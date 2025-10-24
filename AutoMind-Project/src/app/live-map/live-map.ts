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

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initMap();
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

    const marker = L.marker([48.3069, 14.2858]).addTo(this.map);
    marker.bindPopup('<b>AutoMind Vehicle</b><br>Aktuelle Position').openPopup();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
