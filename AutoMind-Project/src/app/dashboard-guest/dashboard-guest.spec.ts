import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGuest } from './dashboard-guest';

describe('DashboardGuest', () => {
  let component: DashboardGuest;
  let fixture: ComponentFixture<DashboardGuest>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGuest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGuest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
