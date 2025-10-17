import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-learn-more',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.css']
})
export class LearnMoreComponent {
  currentPhase: number | null = null;

  togglePhase(phase: number): void {
    this.currentPhase = this.currentPhase === phase ? null : phase;
  }
}