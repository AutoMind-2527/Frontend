import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements AfterViewInit {
  private map!: L.Map;
  private marker!: L.Marker;

  
  ngAfterViewInit(): void { 
    this.initMap();
  }

  private initMap(): void {
    const initialCoords: L.LatLngExpression = [48.137154, 11.576124];

    this.map = L.map('map', {
      center: initialCoords,
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

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

    this.marker = L.marker(initialCoords, { icon: pinIcon })
      .addTo(this.map);
  }
}
