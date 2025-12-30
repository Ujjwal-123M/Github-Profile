/**
 * Application Routes Configuration
 * Defines all routes for the GitHub profile application
 * Default route redirects to shreeramk profile
 */
import { Routes } from '@angular/router';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';

export const routes: Routes = [
  // Default route - redirects to shreeramk profile
  { path: '', redirectTo: 'user/shreeramk', pathMatch: 'full' },
  // Dynamic route for viewing any user's profile
  { path: 'user/:username', component: ProfilePageComponent },
  // Fallback route - redirects unknown paths to default profile
  { path: '**', redirectTo: 'user/shreeramk' },
];
