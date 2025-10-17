import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LearnMoreComponent } from './learn-more.component';

describe('LearnMoreComponent', () => {
  let component: LearnMoreComponent;
  let fixture: ComponentFixture<LearnMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearnMoreComponent],
      providers: [
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearnMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle phase details', () => {
    expect(component.currentPhase).toBeNull();
    
    component.togglePhase(1);
    expect(component.currentPhase).toBe(1);
    
    component.togglePhase(1);
    expect(component.currentPhase).toBeNull();
    
    component.togglePhase(2);
    expect(component.currentPhase).toBe(2);
  });

  it('should handle phase toggle correctly', () => {
    component.togglePhase(3);
    expect(component.currentPhase).toBe(3);
    
    component.togglePhase(4);
    expect(component.currentPhase).toBe(4);
    
    // Toggling same phase should close it
    component.togglePhase(4);
    expect(component.currentPhase).toBeNull();
  });
});