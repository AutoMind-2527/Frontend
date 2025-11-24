import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-livemap',
  templateUrl: './live-map.html',
  styleUrls: ['./live-map.css']
})
export class LiveMap implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private marker!: L.Marker;
  private subscription!: Subscription;

  constructor(private locationService: LocationService, private router: Router) {}

  ngAfterViewInit(): void {
    this.initializeMap();
    this.subscribeToLocation();
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([0, 0], 16); // Start mit 0,0 - wird sofort überschrieben
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Benutzerdefinierten Pin-Marker erstellen
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

    // Erstelle Marker mit benutzerdefiniertem Icon (Position wird später gesetzt)
    this.marker = L.marker([0, 0], { icon: pinIcon }).addTo(this.map);
  }

  private subscribeToLocation(): void {
    this.subscription = this.locationService.position$.subscribe({
      next: (position) => {
        if (position) {
          this.handleNewPosition(position);
        }
      },
      error: (error) => {
        console.error('Fehler in Location Subscription:', error);
      }
    });
  }

  private handleNewPosition(position: GeolocationPosition): void {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    console.log(`📍 MAP UPDATE: ${lat}, ${lng} (${position.coords.accuracy}m)`);

    // Marker bewegen
    this.marker.setLatLng([lat, lng]);

    // Karte zentrieren (mit Animation wie im zweiten Beispiel)
    this.map.setView([lat, lng], 18, { animate: true });


    // Karten-Größe neu berechnen (falls nötig)
    setTimeout(() => {
      try { this.map.invalidateSize(); } catch (e) { /* ignore */ }
    }, 100);
  }

  public forceLocationUpdate(): void {
    console.log('🔄 Erzwinge Standortaktualisierung...');
    this.locationService.updateLocation();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}