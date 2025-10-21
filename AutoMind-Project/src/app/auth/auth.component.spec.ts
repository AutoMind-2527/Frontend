import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch to login mode', () => {
    component.switchAuthMode('login');
    expect(component.authMode).toBe('login');
    expect(component.authError).toBe('');
  });

  it('should switch to signup mode', () => {
    component.switchAuthMode('signup');
    expect(component.authMode).toBe('signup');
    expect(component.authError).toBe('');
  });

  it('should validate email format', () => {
    expect(component['isValidEmail']('test@example.com')).toBeTrue();
    expect(component['isValidEmail']('invalid-email')).toBeFalse();
  });

  it('should navigate to home', () => {
    component.navigateToHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});