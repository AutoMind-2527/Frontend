import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // ⚠️ Falls dein Backend auf einem anderen Port läuft -> hier anpassen
  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = sessionStorage.getItem('token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ---- Auth / aktueller User ----
  getCurrentUser() {
    return this.http.get(`${this.baseUrl}/api/Auth/me`, {
      headers: this.getHeaders()
    });
  }

  // ---- Trips ----
  getTrips() {
    return this.http.get(`${this.baseUrl}/api/Trips`, {
      headers: this.getHeaders()
    });
  }

  createTrip(body: any) {
    return this.http.post(`${this.baseUrl}/api/Trips`, body, {
      headers: this.getHeaders()
    });
  }

  // ---- Vehicles ----
  getVehicles() {
    return this.http.get(`${this.baseUrl}/api/Vehicles`, {
      headers: this.getHeaders()
    });
  }

  createVehicle(body: any) {
    return this.http.post(`${this.baseUrl}/api/Vehicles`, body, {
      headers: this.getHeaders()
    });
  }
}
