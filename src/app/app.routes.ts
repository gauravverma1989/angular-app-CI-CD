import { Routes } from '@angular/router';
import { adminGuard } from './auth/admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { EmailVerificationComponent } from './login/email-verification.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'verify-email', component: EmailVerificationComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
