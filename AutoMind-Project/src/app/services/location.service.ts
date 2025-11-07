import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationSubject = new BehaviorSubject<{ latitude: number, longitude: number } | null>(null);
  location$ = this.locationSubject.asObservable();

  private watchId: number | null = null;

  constructor() {
    this.startTracking();
  }

  startTracking(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    if (this.watchId !== null) {
      // Läuft schon, kein zweites Watch starten
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.locationSubject.next({ latitude, longitude });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}
