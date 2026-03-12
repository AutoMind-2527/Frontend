import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-tracker-modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="add-tracker-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add Vehicle</h2>
          <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>

        <div class="modal-body">
          <p class="instructions">
            Enter your vehicle details and tracker code to save the car directly to your account.
          </p>

          <div class="form-group">
            <label for="license-plate">License Plate:</label>
            <input
              type="text"
              id="license-plate"
              [(ngModel)]="vehicleForm.licensePlate"
              placeholder="e.g., LL-123AB"
              [disabled]="isLoading"
              class="tracker-input"
            />
          </div>

          <div class="form-group">
            <label for="brand">Brand:</label>
            <input
              type="text"
              id="brand"
              [(ngModel)]="vehicleForm.brand"
              placeholder="e.g., Volkswagen"
              [disabled]="isLoading"
              class="tracker-input"
            />
          </div>

          <div class="form-group">
            <label for="model">Model:</label>
            <input
              type="text"
              id="model"
              [(ngModel)]="vehicleForm.model"
              placeholder="e.g., Golf"
              [disabled]="isLoading"
              class="tracker-input"
            />
          </div>

          <div class="form-group">
            <label for="mileage">Mileage:</label>
            <input
              type="number"
              id="mileage"
              [(ngModel)]="vehicleForm.mileage"
              placeholder="e.g., 120000"
              [disabled]="isLoading"
              class="tracker-input"
            />
          </div>

          <div class="form-group">
            <label for="fuel-consumption">Fuel Consumption (L/100km):</label>
            <input
              type="number"
              step="0.1"
              id="fuel-consumption"
              [(ngModel)]="vehicleForm.fuelConsumption"
              placeholder="e.g., 6.5"
              [disabled]="isLoading"
              class="tracker-input"
            />
          </div>

          <div class="form-group">
            <label for="tracker-code">Tracker Code:</label>
            <input
              type="text"
              id="tracker-code"
              [(ngModel)]="vehicleForm.trackerCode"
              placeholder="e.g., TRACK-ABC-123"
              [disabled]="isLoading"
              class="tracker-input"
            />
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn-secondary"
            (click)="closeModal()"
            [disabled]="isLoading">
            Cancel
          </button>
          <button
            class="btn-primary"
            (click)="saveVehicle()"
            [disabled]="isLoading || !vehicleForm.licensePlate.trim() || !vehicleForm.brand.trim() || !vehicleForm.model.trim() || !vehicleForm.trackerCode.trim()">
            {{ isLoading ? 'Saving...' : 'Save Vehicle' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .add-tracker-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .add-tracker-modal {
      background: var(--bg-800, #0f1427);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideInUp 0.3s ease;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-header h2 {
      margin: 0;
      color: var(--primary-400, #6c63ff);
      font-size: 1.25rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .modal-body {
      padding: 24px;
    }

    .instructions {
      margin: 0 0 20px 0;
      color: rgba(230, 238, 248, 0.8);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: rgba(230, 238, 248, 0.9);
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .tracker-input {
      width: 100%;
      padding: 12px 14px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(108, 99, 255, 0.3);
      border-radius: 6px;
      color: white;
      font-size: 0.95rem;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .tracker-input:focus {
      outline: none;
      border-color: var(--primary-400, #6c63ff);
      background: rgba(108, 99, 255, 0.05);
      box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
    }

    .tracker-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      padding: 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #fca5a5;
      font-size: 0.9rem;
      margin-bottom: 16px;
    }

    .success-message {
      padding: 12px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 6px;
      color: #86efac;
      font-size: 0.9rem;
      margin-bottom: 16px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 6px;
      border: none;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-400, #6c63ff);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-500, #5b54d6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class AddTrackerComponent {
  @Output() close = new EventEmitter<void>();
  @Output() trackerAdded = new EventEmitter<any>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  vehicleForm = {
    licensePlate: '',
    brand: '',
    model: '',
    mileage: 0,
    fuelConsumption: 0,
    trackerCode: ''
  };

  constructor(private api: ApiService) {}

  openModal(): void {
    this.isOpen = true;
    this.resetForm();
  }

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }

  private resetForm(): void {
    this.vehicleForm = {
      licensePlate: '',
      brand: '',
      model: '',
      mileage: 0,
      fuelConsumption: 0,
      trackerCode: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveVehicle(): void {
    if (!this.vehicleForm.licensePlate.trim() || !this.vehicleForm.brand.trim() || !this.vehicleForm.model.trim() || !this.vehicleForm.trackerCode.trim()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.createVehicle({
      licensePlate: this.vehicleForm.licensePlate.trim(),
      brand: this.vehicleForm.brand.trim(),
      model: this.vehicleForm.model.trim(),
      mileage: Number(this.vehicleForm.mileage) || 0,
      fuelConsumption: Number(this.vehicleForm.fuelConsumption) || 0,
      trackerCode: this.vehicleForm.trackerCode.trim()
    }).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.successMessage = '✅ Vehicle and tracker saved successfully!';
        this.trackerAdded.emit(response);
        
        // Close modal after 2 seconds
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      (error) => {
        this.isLoading = false;
        if (error.error?.message) {
          this.errorMessage = `❌ ${error.error.message}`;
        } else {
          this.errorMessage = '❌ Failed to save vehicle and tracker. Please try again.';
        }
      }
    );
  }
}
