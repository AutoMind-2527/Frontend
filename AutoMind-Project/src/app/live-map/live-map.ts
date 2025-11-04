import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-live-map',
  templateUrl: './live-map.html',
  styleUrls: ['./live-map.css']
})
export class LiveMapComponent implements AfterViewInit {
  private map!: L.Map;
  private marker!: L.Marker;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.locateUser();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [48.3069, 14.2858], // Beispiel: Linz
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private locateUser(): void {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // 👇 Dein Dashboard-Marker (SVG)
          const pinIcon = L.divIcon({
            className: 'custom-pin-marker',
            html: `<svg width="24" height="32" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 28 16 28s16-17 16-28C32 7.2 24.8 0 16 0z" 
                    fill="#6c63ff" 
                    stroke="#fff" 
                    stroke-width="2"
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.3))"/>
              <circle cx="16" cy="16" r="6" fill="#fff"/>
            </svg>`,
            iconSize: [24, 32],
            iconAnchor: [12, 32]
          });

          if (!this.marker) {
            this.marker = L.marker([lat, lng], { icon: pinIcon }).addTo(this.map);
          } else {
            this.marker.setLatLng([lat, lng]);
          }

          this.map.setView([lat, lng], 15);
        },
        (error) => {
          console.error('Standort konnte nicht ermittelt werden:', error);
          alert('Bitte Standortzugriff erlauben.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation wird von deinem Browser nicht unterstützt.');
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
