import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements AfterViewInit, OnDestroy {

  private map!: L.Map;
  private marker!: L.Marker;
  private locationSub!: Subscription;

  constructor(private locationService: LocationService, private router: Router) {}

  ngAfterViewInit(): void {
    this.initMap();

    // Subscription: reagiere auf Positionsupdates vom LocationService
    this.locationSub = this.locationService.position$.subscribe(pos => {
      // pos kann null sein (wenn Tracking deaktiviert) — dann nichts tun
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

    // Füge initialen Marker (optional) — bleibt, bis service liefert
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

    // Wichtig: falls die Komponente in einem flex/hidden Container gerendert wurde,
    // zwinge Leaflet später zur Neuberechnung
    setTimeout(() => {
      try { this.map.invalidateSize(); } catch (e) { /* ignore */ }
    }, 200);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    // Aufräumen: Subscription canceln
    if (this.locationSub) {
      this.locationSub.unsubscribe();
    }
  }
}
