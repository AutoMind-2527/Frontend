// live-map.ts - KORRIGIERT
import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-livemap',
  templateUrl: './live-map.html',
  styleUrls: ['./live-map.css']
})
export class LiveMap implements AfterViewInit, OnDestroy, OnInit {
  private map!: L.Map;
  private userMarker!: L.Marker;
  private piMarker!: L.Marker;
  private subscription!: Subscription;
  private piGpsSubscription!: Subscription;
  private initialPositionSet = false;
  isLoggedIn = false;

  constructor(
    private locationService: LocationService,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to login status
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
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
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.subscribeToLocation();
  }

  private initializeMap(): void {
    // Start mit Leonding, Österreich (near HTL Leonding)
    this.map = L.map('map').setView([48.2733, 14.3024], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Browser-GPS Marker (blau)
    const userPinIcon = L.divIcon({
      className: 'custom-pin-marker-user',
      html: `
        <div style="
          background: #007bff;
          border: 3px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.userMarker = L.marker([48.2733, 14.3024], { icon: userPinIcon })
      .addTo(this.map)
      .bindPopup('Browser-GPS')
      .openPopup();

    // Pi-GPS Marker (rot) - only if logged in
    if (this.isLoggedIn) {
      const piPinIcon = L.divIcon({
        className: 'custom-pin-marker-pi',
        html: `
          <div style="
            background: #ff6b6b;
            border: 3px solid white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      this.piMarker = L.marker([48.2733, 14.3024], { icon: piPinIcon })
        .addTo(this.map)
        .bindPopup('Pi-GPS');
    }
  }

  private loadPiGpsData(): void {
    this.apiService.getLatestGpsData().subscribe({
      next: (gpsPoints: any[]) => {
        if (gpsPoints && gpsPoints.length > 0) {
          const latest = gpsPoints[0]; // Newest first
          const lat = latest.latitude;
          const lng = latest.longitude;
          
          console.log(`📍 Pi-GPS UPDATE: ${lat}, ${lng}, Speed: ${latest.speedKmh} km/h`);
          
          if (this.piMarker) {
            this.piMarker.setLatLng([lat, lng]);
            const speed = latest.speedKmh ? `${latest.speedKmh.toFixed(2)} km/h` : 'N/A';
            this.piMarker.setPopupContent(`Pi-GPS<br>Speed: ${speed}`);
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading Pi GPS data:', error);
      }
    });
  }

  private subscribeToLocation(): void {
    this.subscription = this.locationService.position$.subscribe({
      next: (position: any) => {
        if (position) {
          this.handleNewPosition(position);
        }
      },
      error: (error: any) => {
        console.error('Fehler in Location Subscription:', error);
      }
    });
  }

  private handleNewPosition(position: GeolocationPosition): void {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    console.log(`🎯 Browser-GPS UPDATE: ${lat}, ${lng} (${position.coords.accuracy}m)`);

    // ✅ NUR beim ERSTEN Mal: Karte zentrieren
    if (!this.initialPositionSet) {
      console.log('🎯 ERSTE POSITION - Zentriere Karte');
      this.map.setView([lat, lng], 16, { animate: true });
      this.initialPositionSet = true;
    }

    // Karten-Größe anpassen
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
    
    // Browser-Marker-Position aktualisieren
    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
      try { this.userMarker.setPopupContent('Browser-GPS'); } catch (e) {}
    }
  }

  public forceLocationUpdate(): void {
    console.log('🔄 Erzwinge Standortaktualisierung...');
    this.locationService.updateLocation();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.piGpsSubscription) {
      this.piGpsSubscription.unsubscribe();
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
