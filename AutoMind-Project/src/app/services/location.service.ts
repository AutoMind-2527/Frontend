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
          console.log('New position:', position.coords.accuracy + 'm accuracy');
          this.positionSubject.next(position);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,      // Reduziert von 10000 auf 5000 ms (frischer)
        timeout: 15000         // Erhöht auf 15 Sekunden für bessere Genauigkeit
      }
    );
  }

  // Manuelle Standortabfrage mit höchster Genauigkeit
  getHighAccuracyPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          maximumAge: 0,       // Immer frische Position
          timeout: 20000       // Noch länger warten für beste Genauigkeit
        }
      );
    });
  }

  private handleLocationError(error: GeolocationPositionError): void {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('Location access denied by user');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('Location information unavailable');
        break;
      case error.TIMEOUT:
        console.error('Location request timeout');
        // Optional: Retry logic hier einfügen
        break;
    }
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}