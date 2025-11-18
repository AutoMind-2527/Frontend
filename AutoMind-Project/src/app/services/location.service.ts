// location.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  public position$ = new BehaviorSubject<GeolocationPosition | null>(null);
  private watchId: number | null = null;

  constructor() {
    this.startWatching();
  }

  private startWatching(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation API nicht verfügbar');
      return;
    }

    console.log('🚀 Starte direkte Geolocation...');

    // STOPPE erst alle vorhandenen Watcher
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('🎯 DIREKTE POSITION:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy + 'm',
          zeit: new Date().toLocaleTimeString()
        });
        this.position$.next(position);
      },
      (error) => {
        console.error('❌ DIREKTER FEHLER:', error);
      },
      {
        enableHighAccuracy: true,    // WICHTIGSTE EINSTELLUNG
        timeout: 30000,              // 30 Sekunden warten für GPS
        maximumAge: 0                // IMMER neue Position
      }
    );
  }

  // Manuell aktualisieren
  public async updateLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.position$.next(position);
          resolve();
        },
        (error) => {
          console.error('Manuelle Aktualisierung fehlgeschlagen:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
    });
  }
}