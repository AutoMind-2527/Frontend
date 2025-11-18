import { Component, AfterViewInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import * as L from 'leaflet';
import { LocationService } from '../services/location.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-livemap',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './live-map.html',
  styleUrls: ['./live-map.css']
})
export class LiveMap implements AfterViewInit {

  private map!: L.Map;
  private marker!: L.Marker;

  constructor(private locationService: LocationService, private router: Router) {}

  ngAfterViewInit(): void {
    this.initMap();

    this.locationService.position$.subscribe(pos => {
      if (!pos) return;

      const coords = [pos.coords.latitude, pos.coords.longitude] as L.LatLngExpression;
      this.marker.setLatLng(coords);
      this.map.setView(coords, 15);
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [48.2612, 14.2690],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    const pinIcon = L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <svg width="24" height="32" viewBox="0 0 32 44">
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

    this.marker = L.marker([48.2612, 14.2690], { icon: pinIcon }).addTo(this.map);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
