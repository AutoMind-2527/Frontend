import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { LearnMoreComponent } from './learn-more.component/learn-more.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'dashboard', component: Dashboard},
    { path: 'learn-more', component: LearnMoreComponent }
];
