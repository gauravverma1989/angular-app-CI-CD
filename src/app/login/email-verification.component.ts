import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="verification-page">
      <section class="verification-card" aria-live="polite">
        <div class="verification-mark" [class.failed]="failed">{{ failed ? '!' : '✓' }}</div>
        <p class="eyebrow">ACCOUNT VERIFICATION</p>
        <h1>{{ failed ? 'Verification failed' : 'Verifying your email' }}</h1>
        <p>{{ message }}</p>
        <a routerLink="/login">Return to sign in</a>
      </section>
    </main>
  `,
  styles: [`
    .verification-page { min-height:100vh; display:grid; place-items:center; padding:24px; background:#f5f7fb; color:#18212f; }
    .verification-card { width:min(100%,440px); padding:38px; border:1px solid #e8edf3; border-radius:20px; background:#fff; text-align:center; box-shadow:0 20px 55px rgba(15,23,42,.09); }
    .verification-mark { width:48px; height:48px; display:grid; place-items:center; margin:0 auto 20px; border-radius:15px; background:#ecfdf5; color:#059669; font-size:22px; font-weight:800; }
    .verification-mark.failed { background:#fef2f2; color:#dc2626; }
    .eyebrow { margin:0; color:#4f46e5; font-size:11px; font-weight:800; letter-spacing:1.5px; }
    h1 { margin:7px 0; font-size:27px; font-weight:750; }
    p:not(.eyebrow) { color:#718096; }
    a { display:inline-block; margin-top:12px; color:#4f46e5; font-weight:700; text-decoration:none; }
  `]
})
export class EmailVerificationComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  message = 'Please wait while we confirm your email address.';
  failed = false;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.failed = true;
      this.message = 'This verification link is missing its token. Request a new email.';
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: response => this.message = response.message,
      error: error => {
        this.failed = true;
        this.message = error?.error?.message ?? 'This verification link is invalid or expired. Request a new email.';
      }
    });
  }
}
