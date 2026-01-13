import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { LocationService } from '../services/location.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, NgClass, NgIf],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent {

  darkMode: boolean = true;
  locationAccess: boolean = false;
  currentUsername: string | null = null;
  private authSub?: Subscription;
  showLogoutConfirm = false;

  constructor(
    private router: Router,
    private locationService: LocationService
    , private auth: AuthService
  ) {}

  ngOnInit() {
   // this.locationAccess = this.locationService.getTrackingStatus();
   this.authSub = this.auth.username$.subscribe(name => {
     this.currentUsername = name;
   });
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
      //this.locationService.enableTracking();
    } else {
    // this.locationService.disableTracking();
    }
  }

  logout() {
    // open confirmation dialog
    this.openLogoutConfirm();
  }

  openLogoutConfirm(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  async confirmLogout(): Promise<void> {
    this.showLogoutConfirm = false;
    const kc = (window as any).keycloak;
    try {
      if (kc && typeof kc.logout === 'function') {
        const redirect = window.location.origin + '/';
        // call Keycloak logout with redirect back to app homepage
        kc.logout({ redirectUri: redirect });
        // if logout does not redirect immediately, navigate as fallback
        setTimeout(() => this.router.navigate(['/home']), 800);
        return;
      }
    } catch (e) {
      console.error('Keycloak logout failed', e);
    }

    // fallback: navigate to home
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }
}
