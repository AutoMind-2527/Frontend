import { Component, OnInit, AfterViewInit, HostListener, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  showUserModal = false;
  headerSmall = false;
  headerVisible = false;

  @ViewChild('heroSection', { static: false }) heroSection!: ElementRef<HTMLElement>;
  private heroObserver: IntersectionObserver | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.scrollToTop();
    this.fixBodyBackground();
  }

  ngAfterViewInit() {
    // Scroll again after view renders
    setTimeout(() => {
      this.scrollToTop();
    }, 0);
    
    // One more check after a slightly longer delay
    setTimeout(() => {
      this.scrollToTop();
    }, 100);
    // ensure header visibility is computed after view init
    setTimeout(() => {
      this.onWindowScroll();
    }, 150);

    // Use IntersectionObserver as a robust fallback to detect when the hero leaves the viewport
    try {
      if (this.heroSection && this.heroSection.nativeElement) {
        this.heroObserver = new IntersectionObserver(
          (entries) => {
            const e = entries[0];
            // when hero is not intersecting at all, show the header
            this.headerVisible = !e.isIntersecting;
          },
          { root: null, threshold: 0 }
        );
        this.heroObserver.observe(this.heroSection.nativeElement);
      }
    } catch (err) {
      // IntersectionObserver may not be supported in very old browsers; fallback remains in onWindowScroll
      console.warn('IntersectionObserver not available, relying on scroll heuristics', err);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // shrink header when user scrolls down past 80px
    const scrolled = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
    // shrink header when user scrolls down past 80px
    this.headerSmall = scrolled > 80;

    // compute when hero bottom has left the viewport -> show header
    if (this.heroSection && this.heroSection.nativeElement) {
      const el = this.heroSection.nativeElement;
      const rect = el.getBoundingClientRect();
      // if the bottom of the hero is above the top of the viewport (i.e., scrolled past)
      const byRect = rect.bottom <= 0;

      // fallback: use document scroll position vs element offsets (more robust across layouts)
      const scrollTop = scrolled;
      const heroBottomY = el.offsetTop + el.offsetHeight;
      const byOffset = scrollTop >= (heroBottomY - 20); // 20px cushion

      // if IntersectionObserver is active, prefer that (it will update headerVisible). Otherwise, use computed heuristic.
      if (!this.heroObserver) {
        this.headerVisible = byRect || byOffset;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.heroObserver) {
      this.heroObserver.disconnect();
      this.heroObserver = null;
    }
  }
  
  private scrollToTop(): void {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // More aggressive scrolling methods
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
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
    this.authService.continueAsGuest(); // Mark as guest
    this.router.navigate(['/guest-dashboard'], { 
      queryParams: { mode: 'guest' } 
    });
  }

  navigateToAuth(): void {
    this.closeModal();
    // Wait for login to complete before navigating
    this.authService.login().then(success => {
      if (success) {
        this.router.navigate(['/dashboard'], { 
          queryParams: { mode: 'authenticated' } 
        });
      } else {
        console.error('Login failed');
      }
    });
  }
}