import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:5191'; // Backend Port
  
  constructor(private http: HttpClient) {}
  
  getData() {
    return this.http.get(`${this.apiUrl}/api/controller`);
  }
}