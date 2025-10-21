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
    if (!this.loginData.email || !this.loginData.password) {
      this.authError = 'Please fill in all fields';
      return;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.authError = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.authError = '';

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      
      // For demo purposes - in real app, validate against backend
      if (this.loginData.email.includes('@') && this.loginData.password.length >= 6) {
        console.log('Login successful');
        this.router.navigate(['/dashboard'], { 
          queryParams: { mode: 'authenticated' } 
        });
      } else {
        this.authError = 'Invalid email or password';
      }
    }, 1500);
  }

  onSignup(): void {
    if (!this.signupData.name || !this.signupData.email || !this.signupData.password) {
      this.authError = 'Please fill in all required fields';
      return;
    }

    if (!this.isValidEmail(this.signupData.email)) {
      this.authError = 'Please enter a valid email address';
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.authError = 'Passwords do not match';
      return;
    }

    if (this.signupData.password.length < 6) {
      this.authError = 'Password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    this.authError = '';

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      
      // For demo purposes - always succeed
      console.log('Signup successful');
      this.router.navigate(['/dashboard'], { 
        queryParams: { mode: 'authenticated' } 
      });
    }, 1500);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}