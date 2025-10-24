import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { LearnMoreComponent } from './learn-more.component/learn-more.component';
import { AuthComponent } from './auth/auth.component';
import { LiveMapComponent } from './live-map/live-map';
import { TripsComponent } from './trips/trips';
import { AnalyticsComponent } from './analytics/analytics';
import { SettingsComponent } from './settings/settings';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'dashboard', component: Dashboard},
    { path: 'live-map', component: LiveMapComponent },
    { path: 'trips', component: TripsComponent },
    { path: 'analytics', component: AnalyticsComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'learn-more', component: LearnMoreComponent },
    { path: 'auth', component: AuthComponent }
];