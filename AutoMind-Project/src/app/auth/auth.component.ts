import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  authMode: 'login' | 'signup' = 'login';
  
  // Form models
  loginData = {
    email: '',
    password: ''
  };
  
  signupData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  isLoading = false;
  authError = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.setBodyBackground();
  }

  private setBodyBackground() {
    document.body.style.background = 'linear-gradient(180deg, #041024 0%, #07162b 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    document.documentElement.style.background = 'linear-gradient(180deg, #041024 0%, #07162b 100%)';
    document.documentElement.style.backgroundAttachment = 'fixed';
  }

  switchAuthMode(mode: 'login' | 'signup'): void {
    this.authMode = mode;
    this.authError = '';
    this.loginData = { email: '', password: '' };
    this.signupData = { name: '', email: '', password: '', confirmPassword: '' };
  }

  onLogin(): void {
    this.authError = '';
    const kc = (window as any).keycloak;
    if (!kc) {
      this.authError = 'Keycloak not available';
      return;
    }
    kc.login({ redirectUri: `${window.location.origin}/dashboard` });
  }

  onSignup(): void {
    this.authError = '';
    const kc = (window as any).keycloak;
    if (!kc) {
      this.authError = 'Keycloak not available';
      return;
    }
    kc.register({ redirectUri: `${window.location.origin}/dashboard` });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}