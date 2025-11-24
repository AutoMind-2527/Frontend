// live-map.ts - KORRIGIERT
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
  private initialPositionSet = false;

  constructor(private locationService: LocationService, private router: Router) {}

  ngAfterViewInit(): void {
    this.initializeMap();
    this.subscribeToLocation();
  }

  private initializeMap(): void {
    // Start mit Berlin als Fallback
    this.map = L.map('map').setView([52.5200, 13.4050], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Benutzerdefinierten Pin-Marker erstellen
    const pinIcon = L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="
          background: #7b61ff;
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

    // Marker erstellen (Position wird durch Location Service gesetzt)
    this.marker = L.marker([52.5200, 13.4050], { icon: pinIcon })
      .addTo(this.map)
      .bindPopup('Deine Position wird geladen...')
      .openPopup();
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
    
    console.log(`🎯 MAP UPDATE: ${lat}, ${lng} (${position.coords.accuracy}m)`);

    // ✅ IMMER: Marker bewegen
    this.marker.setLatLng([lat, lng]);
    this.marker.bindPopup(`
      <div style="text-align: center;">
        <strong>Deine Position</strong><br>
        📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>
        ⚡ Genauigkeit: ${position.coords.accuracy.toFixed(0)}m
      </div>
    `);

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