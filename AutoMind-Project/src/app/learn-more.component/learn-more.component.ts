import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-learn-more',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.css']
})
export class LearnMoreComponent implements OnInit {
  currentPhase: number | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Scroll to top when component initializes
    this.scrollToTop();
  }

  togglePhase(phase: number): void {
    this.currentPhase = this.currentPhase === phase ? null : phase;
  }

  navigateToHome(): void {
    // Scroll to top first, then navigate
    this.scrollToTop();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 100); // Small delay to ensure scroll completes
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
}