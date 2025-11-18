import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { LocationService } from '../services/location.service';

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

  constructor(
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.locationAccess = this.locationService.getTrackingStatus();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-theme', this.darkMode);
  }

  toggleLocation() {
    this.locationAccess = !this.locationAccess;

    if (this.locationAccess) {
      this.locationService.enableTracking();
    } else {
      this.locationService.disableTracking();
    }
  }

  logout() {
    console.log('User logged out.');
    this.router.navigate(['/login']);
  }
}
