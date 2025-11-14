import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent {

  darkModeEnabled: boolean = false;
  locationTracking: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Werte aus LocalStorage laden
    this.darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    this.locationTracking = localStorage.getItem('locationTracking') === 'true';

    // Dark Mode sofort anwenden, falls aktiv
    if (this.darkModeEnabled) {
      document.body.classList.add('dark-theme');
    }
  }

  toggleDarkMode() {
    this.darkModeEnabled = !this.darkModeEnabled;
    localStorage.setItem('darkMode', String(this.darkModeEnabled));

    if (this.darkModeEnabled) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  toggleLocation() {
    this.locationTracking = !this.locationTracking;
    localStorage.setItem('locationTracking', String(this.locationTracking));
  }

  logout() {
    // Optional: User Session löschen
    localStorage.removeItem('currentUser');

    // Zu Home routen
    this.router.navigate(['/home']);
  }
}
