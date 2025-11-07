import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-live-map',
  standalone: true,
  templateUrl: './live-map.html',
  styleUrls: ['./live-map.css']
})
export class LiveMap implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private marker!: L.Marker;
  private locationSub!: Subscription;

  constructor(private router: Router, private locationService: LocationService) {}

  ngAfterViewInit(): void {
    this.initMap();

    this.locationSub = this.locationService.location$.subscribe(coords => {
      if (coords) {
        this.updateMarker(coords.latitude, coords.longitude);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.locationSub) this.locationSub.unsubscribe();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [48.2612, 14.2690],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private updateMarker(lat: number, lng: number): void {
    const pinIcon = L.divIcon({
      className: 'custom-pin-marker',
      html: `<svg width="24" height="32" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 28 16 28s16-17 16-28C32 7.2 24.8 0 16 0z"
              fill="#6c63ff" stroke="#fff" stroke-width="2"/>
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
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
