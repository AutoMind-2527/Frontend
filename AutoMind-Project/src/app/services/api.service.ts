import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Direct cloud backend URL
  private baseUrl = 'https://if220129.cloud.htl-leonding.ac.at/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const kc = (window as any).keycloak;
    const token = sessionStorage.getItem('token') || (kc && kc.token);

    if (!token) {
      return new HttpHeaders();
    }

    // Keep session token in sync when interceptor/auth service uses kc.token.
    if (!sessionStorage.getItem('token')) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('isLoggedIn', 'true');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ---- Auth / aktueller User ----
  getCurrentUser() {
    return this.http.get(`${this.baseUrl}/Auth/me`, {
      headers: this.getHeaders()
    });
  }

  // ---- Trips ----
  getTrips() {
    return this.http.get(`${this.baseUrl}/Trips`, {
      headers: this.getHeaders()
    });
  }

  createTrip(body: any) {
    return this.http.post(`${this.baseUrl}/Trips`, body, {
      headers: this.getHeaders()
    });
  }

  // ---- Vehicles ----
  getVehicles() {
    return this.http.get(`${this.baseUrl}/Vehicles`, {
      headers: this.getHeaders()
    });
  }

  createVehicle(body: any) {
    return this.http.post(`${this.baseUrl}/Vehicles`, body, {
      headers: this.getHeaders()
    });
  }

  claimTracker(trackerCode: string) {
    return this.http.post(`${this.baseUrl}/Vehicles/claim`, {
      trackerCode: trackerCode
    }, {
      headers: this.getHeaders()
    });
  }

  // ---- GPS Data ----
  getLatestGpsData() {
    return this.http.get<any[]>(`${this.baseUrl}/Gps`, {
      headers: this.getHeaders()
    });
  }
}
