import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // Hält die aktuelle Position oder null (wenn Tracking deaktiviert)
  private positionSubject = new BehaviorSubject<GeolocationPosition | null>(null);
  position$ = this.positionSubject.asObservable();

  private watchId: number | null = null;

  // Ob Tracking erlaubt ist (z.B. Settings Toggle)
  private trackingEnabled: boolean = true;

  constructor() {
    // Startet automatisch das Tracking, wenn erlaubt
    if (this.trackingEnabled) {
      this.startTracking();
    }
  }

  // Tracking EIN/AUS aus Settings
  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;

    if (enabled) {
      this.startTracking();
    } else {
      this.stopTracking();
      this.positionSubject.next(null);  // Dashboard/Livemap bekommen "kein Standort"
    }
  }

  startTracking(): void {
    if (!this.trackingEnabled) return;

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    // Wenn schon aktiv → kein zweites Watch
    if (this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (this.trackingEnabled) {
          this.positionSubject.next(position);
        }
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
