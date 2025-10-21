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
  }

  togglePhase(phase: number): void {
    this.currentPhase = this.currentPhase === phase ? null : phase;
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}