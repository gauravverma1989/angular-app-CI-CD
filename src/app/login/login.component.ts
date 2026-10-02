import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = false;
  showPassword = false;
  canResendVerification = false;
  resendingVerification = false;
  resendMessage = '';
  errorMessage = this.route.snapshot.queryParamMap.get('reason') === 'forbidden'
    ? 'Administrator access is required.'
    : '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.canResendVerification = false;
    this.resendMessage = '';
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: response => {
        if (response.data.user.role !== 'ADMIN') {
          this.errorMessage = 'This dashboard is available to administrators only.';
          this.loading = false;
          return;
        }

        this.auth.setSession(response.data);
        const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = requestedUrl?.startsWith('/') && !requestedUrl.startsWith('//')
          ? requestedUrl
          : '/dashboard';
        void this.router.navigateByUrl(destination);
      },
      error: error => {
        this.errorMessage = error?.error?.message ?? 'Unable to sign in. Please try again.';
        this.canResendVerification = error?.status === 403 &&
          String(error?.error?.message || '').toLowerCase().includes('not verified');
        this.loading = false;
      }
    });
  }

  resendVerification(): void {
    const email = this.form.controls.email.value.trim();
    if (!email || this.resendingVerification) return;

    this.resendingVerification = true;
    this.resendMessage = '';
    this.auth.resendVerification(email).subscribe({
      next: response => {
        this.resendMessage = response.message;
        this.resendingVerification = false;
      },
      error: error => {
        this.resendMessage = error?.error?.message ?? 'Unable to send a verification email right now.';
        this.resendingVerification = false;
      }
    });
  }
}
