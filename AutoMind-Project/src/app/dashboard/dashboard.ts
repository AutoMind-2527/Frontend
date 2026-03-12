import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
import { NgIf, NgForOf, DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { AddTrackerComponent } from '../components/add-tracker/add-tracker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    NgForOf,
    DecimalPipe,
    DatePipe,
    SlicePipe,
    AddTrackerComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(AddTrackerComponent) addTrackerComponent?: AddTrackerComponent;

  // --- Map ---
  private map!: L.Map;
  private marker?: L.Marker;
  private piMarker?: L.Marker;
  private locationSub!: Subscription;
  private piGpsSubscription!: Subscription;

  // --- Daten aus Backend ---
  vehicles: any[] = [];
  trips: any[] = [];
  currentUser: any | null = null;
  private authSub?: Subscription;

  // --- Stats ---
  totalDistanceKm = 0;
  isLoading = true;
  hasError = false;

  constructor(
    private locationService: LocationService,
    private router: Router,
    private api: ApiService,
    private auth: AuthService
  ) {}

  // -----------------------------
  // 1. Beim Laden -> Daten holen
  // -----------------------------
  ngOnInit(): void {
    // Wait for Keycloak to finish initializing (including code exchange on login callback)
    // before firing API requests, otherwise they go out without a Bearer token.
    const keycloakReady = (window as any).keycloakReady as Promise<any> | undefined;
    const doLoad = () => this.loadDashboardData();
    if (keycloakReady && typeof (keycloakReady as any).then === 'function') {
      (keycloakReady as Promise<any>).then(doLoad).catch(doLoad);
    } else {
      doLoad();
    }

    this.authSub = this.auth.username$.subscribe(name => {
      if (!name) { return; }
      if (!this.currentUser) {
        this.currentUser = { username: name, role: 'User' };
      } else {
        this.currentUser.username = name;
      }
    });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;

    // Fahrzeuge laden
    this.api.getVehicles().subscribe({
      next: (vehicles: any) => {
        this.vehicles = vehicles || [];
      },
      error: (err) => {
        console.error('Error loading vehicles', err);
        this.hasError = true;
      }
    });

    // Trips laden
    this.api.getTrips().subscribe({
      next: (trips: any) => {
        this.trips = trips || [];
        this.recalculateStats();
      },
      error: (err) => {
        console.error('Error loading trips', err);
        this.hasError = true;
      }
    });

    // Aktuellen User laden
    this.api.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUser = user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading current user', err);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  private recalculateStats(): void {
    this.totalDistanceKm = this.trips.reduce(
      (sum, t: any) => sum + (t.distanceKm ?? 0),
      0
    );
  }

  // -----------------------------
  // 2. Map/Leaflet initialisieren
  // -----------------------------
  ngAfterViewInit(): void {
    this.initMap();

    // Subscribe to login status to load Pi GPS
    this.authSub = this.auth.isLoggedIn$.subscribe(status => {
      if (status) {
        // Start polling for Pi GPS if logged in
        this.piGpsSubscription = interval(10000).subscribe(() => {
          this.loadPiGpsData();
        });
        this.loadPiGpsData(); // Load immediately
      } else {
        // Stop polling if logged out
        if (this.piGpsSubscription) {
          this.piGpsSubscription.unsubscribe();
        }
        if (this.piMarker && this.map) {
          this.map.removeLayer(this.piMarker);
        }
      }
    });

    // Subscription: reagiere auf Positionsupdates vom LocationService
    this.locationSub = this.locationService.position$.subscribe(pos => {
      if (!pos) {
        // Tracking disabled or unavailable -> hide browser marker.
        if (this.marker && this.map.hasLayer(this.marker)) {
          this.map.removeLayer(this.marker);
        }
        return;
      }

      const coords: L.LatLngExpression = [pos.coords.latitude, pos.coords.longitude];

      // Falls Marker noch nicht existiert, erstelle ihn
      if (!this.marker) {
        const pinIcon = L.divIcon({
          className: 'custom-pin-marker',
          html: `
            <svg width="24" height="32" viewBox="0 0 32 44">
              <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 28 16 28s16-17 16-28C32 7.2 24.8 0 16 0z"
                fill="#6c63ff"
                stroke="#fff"
                stroke-width="2"/>
              <circle cx="16" cy="16" r="6" fill="#fff"/>
            </svg>`,
          iconSize: [24, 32],
          iconAnchor: [12, 32]
        });

        this.marker = L.marker(coords, { icon: pinIcon }).addTo(this.map);
      } else {
        // Marker existiert → Position sicher aktualisieren
        this.marker.setLatLng(coords);
      }

      // Karte sanft zur Position zentrieren
      this.map.setView(coords, 15, { animate: true });
    });
  }

  private initMap(): void {
    const initialCoords: L.LatLngExpression = [48.2612, 14.2690];

    this.map = L.map('map', {
      center: initialCoords,
      zoom: 13
    });

    // Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      try { this.map.invalidateSize(); } catch (e) {}
    }, 200);
  }

  private resolveVehicleLabel(vehicleId: number | undefined): string {
    if (vehicleId !== undefined && vehicleId !== null) {
      const matched = this.vehicles.find(v => v.id === vehicleId);
      if (matched) {
        return `${matched.brand} ${matched.model} (${matched.licensePlate})`;
      }
    }

    if (this.vehicles.length === 1) {
      const only = this.vehicles[0];
      return `${only.brand} ${only.model} (${only.licensePlate})`;
    }

    return 'Tracker GPS';
  }

  private loadPiGpsData(): void {
    this.api.getLatestGpsData().subscribe({
      next: (data: any[]) => {
        if (!data || data.length === 0) return;

        const latest = data[0];
        const coords: L.LatLngExpression = [latest.latitude, latest.longitude];
        const speed = latest.speedKmh ?? 0;
        const vehicleLabel = this.resolveVehicleLabel(latest.vehicleId);
        const popupContent = `<b>${vehicleLabel}</b><br/>Speed: ${speed.toFixed(2)} km/h`;

        if (!this.piMarker) {
          const piIcon = L.divIcon({
            className: 'custom-pi-marker',
            html: `
              <svg width="24" height="32" viewBox="0 0 32 44">
                <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 28 16 28s16-17 16-28C32 7.2 24.8 0 16 0z"
                  fill="#ef4444"
                  stroke="#fff"
                  stroke-width="2"/>
                <circle cx="16" cy="16" r="6" fill="#fff"/>
              </svg>`,
            iconSize: [24, 32],
            iconAnchor: [12, 32]
          });

          this.piMarker = L.marker(coords, { icon: piIcon, title: vehicleLabel })
            .bindPopup(popupContent)
            .addTo(this.map);
        } else {
          this.piMarker.setLatLng(coords);
          this.piMarker.options.title = vehicleLabel;
          this.piMarker.setPopupContent(popupContent);
        }
      },
      error: (err) => {
        console.error('Error loading Pi GPS data', err);
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  openAddTrackerModal(): void {
    if (this.addTrackerComponent) {
      this.addTrackerComponent.openModal();
    }
  }

  onTrackerAdded(vehicle: any): void {
    // Refresh vehicles list after tracker is added
    this.loadDashboardData();
  }

  closeModal(): void {
    // This method is called when the add-tracker modal is closed
    // No action needed - modal will close on its own
  }

  ngOnDestroy(): void {
    if (this.locationSub) {
      this.locationSub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.piGpsSubscription) {
      this.piGpsSubscription.unsubscribe();
    }
  }
}
