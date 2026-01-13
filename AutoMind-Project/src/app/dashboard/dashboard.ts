import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
import { NgIf, NgForOf, DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    NgForOf,
    DecimalPipe,
    DatePipe,
    SlicePipe
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {

  // --- Map ---
  private map!: L.Map;
  private marker!: L.Marker;
  private locationSub!: Subscription;

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
    this.loadDashboardData();
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

    // Subscription: reagiere auf Positionsupdates vom LocationService
    this.locationSub = this.locationService.position$.subscribe(pos => {
      if (!pos) {
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

    // Optionaler Startmarker
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

    this.marker = L.marker(initialCoords, { icon: pinIcon }).addTo(this.map);

    setTimeout(() => {
      try { this.map.invalidateSize(); } catch (e) {}
    }, 200);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    if (this.locationSub) {
      this.locationSub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
