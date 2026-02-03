import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthHttpService {

  // use backend port 5191 (matches backend launchSettings)
  private baseUrl = 'http://localhost:5191';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = sessionStorage.getItem("token");
    return new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });
  }

  getTrips() {
    return this.http.get(`${this.baseUrl}/api/Trips`, { headers: this.getHeaders() });
  }

  createTrip(data: any) {
    return this.http.post(`${this.baseUrl}/api/Trips`, data, {
      headers: this.getHeaders()
    });
  }

  getVehicles() {
    return this.http.get(`${this.baseUrl}/api/Vehicles`, { headers: this.getHeaders() });
  }

  createVehicle(data: any) {
    return this.http.post(`${this.baseUrl}/api/Vehicles`, data, {
      headers: this.getHeaders()
    });
  }
}
