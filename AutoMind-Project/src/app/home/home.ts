import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  showUserModal = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Force set the body background on component initialization
    this.fixBodyBackground();
  }

  private fixBodyBackground() {
    // Remove any white background
    document.body.style.background = 'linear-gradient(180deg, #041024 0%, #07162b 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Fix for WebKit browsers
    document.documentElement.style.background = 'linear-gradient(180deg, #041024 0%, #07162b 100%)';
    document.documentElement.style.backgroundAttachment = 'fixed';
  }

  openUserModal(): void {
    this.showUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showUserModal = false;
    document.body.style.overflow = '';
  }

  navigateAsGuest(): void {
    console.log('Navigating as guest user');
    this.closeModal();
    this.router.navigate(['/dashboard'], { 
      queryParams: { mode: 'guest' } 
    });
  }

  navigateToAuth(): void {
  this.closeModal();
  this.router.navigate(['/auth']);
}
}