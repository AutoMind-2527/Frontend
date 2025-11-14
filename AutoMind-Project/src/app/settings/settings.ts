import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent {

  darkMode: boolean = true;
  locationAccess: boolean = false;

  constructor(private router: Router) {}

  // AutoMind Button → zurück zur Startseite
  goHome() {
    this.router.navigate(['/home']);
  }

  // Dark Mode Toggle
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-theme', this.darkMode);
  }

  // Datenschutz Toggle
  toggleLocation() {
    this.locationAccess = !this.locationAccess;
  }

  // Logout
  logout() {
    console.log('User logged out.');
    this.router.navigate(['/login']);
  }
}
