import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  showUserModal = false;

  constructor(private router: Router) {}

  openUserModal(): void {
    this.showUserModal = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showUserModal = false;
    // Restore body scroll
    document.body.style.overflow = '';
  }

  navigateAsGuest(): void {
    // You can add guest-specific logic here
    console.log('Navigating as guest user');
    this.closeModal();
    this.router.navigate(['/dashboard'], { 
      queryParams: { mode: 'guest' } 
    });
  }

  navigateAsUser(): void {
    // You can add authentication logic here
    console.log('Navigating as logged in user');
    this.closeModal();
    
    // For now, just navigate to dashboard
    // In a real app, you might show a login modal or redirect to login page
    this.router.navigate(['/dashboard'], { 
      queryParams: { mode: 'authenticated' } 
    });
  }
}