import { Component, AfterViewInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent implements AfterViewInit {

  speed: number = 72;
  distance: number = 145;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.renderChart();
  }

  // Mini Chart Rendering (Native Canvas)
  renderChart() {
    const canvas = document.getElementById("speedChart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const values = [20, 40, 55, 70, 90, 80, 60, 75];
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 250;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#6c63ff";
    ctx.lineWidth = 3;

    ctx.beginPath();
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
