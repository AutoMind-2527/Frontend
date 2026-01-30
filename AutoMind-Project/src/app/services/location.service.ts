// location.service.ts - VOLLSTÄNDIGE VERSION
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  public position$ = new BehaviorSubject<GeolocationPosition | null>(null);
  private watchId: number | null = null;
  private trackingEnabled: boolean = true;

  constructor() {
    // read persisted preference (default = true)
    const stored = localStorage.getItem('trackingEnabled');
    this.trackingEnabled = stored === null ? true : stored === 'true';

    if (this.trackingEnabled) {
      this.startWatching();
    }
  }

  private startWatching(): void {
    console.log('🔍 Starte erweiterte GPS-Diagnose...');

    // Prüfe ob Geolocation verfügbar ist
    if (!navigator.geolocation) {
      console.error('❌ Geolocation API nicht verfügbar');
      alert('Geolocation wird von diesem Browser nicht unterstützt!');
      return;
    }

    // Teste mit getCurrentPosition zuerst
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ GET_CURRENT_POSITION ERFOLGREICH:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy + 'm',
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed
        });
        
        // Starte watchPosition erst nach erfolgreichem Test
        this.startWatchingInternal();
        
        // Sende die erste Position sofort
        this.position$.next(position);
      },
      (error) => {
        console.error('❌ GET_CURRENT_POSITION FEHLER:', this.getErrorText(error));
        alert(`GPS Fehler: ${this.getErrorText(error)}\n\nStelle sicher dass:\n- Standortzugriff erlaubt ist\n- GPS eingenschaltet ist\n- Internet verfügbar ist`);
        
        // Trotzdem versuchen watchPosition zu starten (mit weniger strengen Einstellungen)
        this.startWatchingInternal();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  /** Returns whether tracking is currently enabled (based on stored preference) */
  public isTrackingEnabled(): boolean {
    return this.trackingEnabled;
  }

  /** Enable tracking: persist preference and (re)start the geolocation watcher */
  public enableTracking(): void {
    if (this.trackingEnabled) { return; }
    this.trackingEnabled = true;
    localStorage.setItem('trackingEnabled', 'true');
    this.startWatching();
  }

  /** Disable tracking: persist preference and stop the geolocation watcher */
  public disableTracking(): void {
    if (!this.trackingEnabled) { return; }
    this.trackingEnabled = false;
    localStorage.setItem('trackingEnabled', 'false');
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    // Clear last known position for privacy
    this.position$.next(null);
  }

  private startWatchingInternal(): void {
    // Stoppe vorhandenen Watcher
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        
        console.log('📍 GPS POSITION:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude, 
          accuracy: accuracy + 'm',
          source: accuracy < 50 ? '📡 GPS' : '🌐 NETWORK',
          timestamp: new Date().toLocaleTimeString()
        });

        // Warnung bei schlechter Genauigkeit
        if (accuracy > 100) {
          console.warn('⚠️ UNGENAU: Mehr als 100m Abweichung!');
        }

        this.position$.next(position);
      },
      (error) => {
        console.error('❌ WATCH_POSITION FEHLER:', this.getErrorText(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    );
  }

  private getErrorText(error: GeolocationPositionError): string {
    switch(error.code) {
      case 1: return 'PERMISSION_DENIED - Standortzugriff verweigert';
      case 2: return 'POSITION_UNAVAILABLE - Position nicht verfügbar';
      case 3: return 'TIMEOUT - Zeitüberschreitung';
      default: return `Unbekannter Fehler: ${error.code}`;
    }
  }

  // Manuell aktualisieren
  public async updateLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('🔄 MANUELLE AKTUALISIERUNG:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy + 'm'
          });
          this.position$.next(position);
          resolve();
        },
        (error) => {
          console.error('Manuelle Aktualisierung fehlgeschlagen:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  }
}