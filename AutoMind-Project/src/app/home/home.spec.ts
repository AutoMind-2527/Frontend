import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal when openUserModal is called', () => {
    component.openUserModal();
    expect(component.showUserModal).toBeTrue();
  });

  it('should close modal when closeModal is called', () => {
    component.showUserModal = true;
    component.closeModal();
    expect(component.showUserModal).toBeFalse();
  });

  it('should navigate to dashboard as guest', () => {
    component.navigateAsGuest();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], { 
      queryParams: { mode: 'guest' } 
    });
  });

  it('should navigate to dashboard as authenticated user', () => {
    component.navigateAsUser();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], { 
      queryParams: { mode: 'authenticated' } 
    });
  });
});