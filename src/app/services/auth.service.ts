import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, AuthUser, LoginResponseData } from '../models/dashboard.models';

const ACCESS_TOKEN_KEY = 'admin_access_token';
const AUTH_USER_KEY = 'admin_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<ApiResponse<LoginResponseData>> {
    return this.http.post<ApiResponse<LoginResponseData>>(
      `${environment.apiBaseUrl}/auth/login`,
      { email, password }
    );
  }

  verifyEmail(token: string): Observable<ApiResponse<{ email: string; emailVerifiedAt: string }>> {
    return this.http.post<ApiResponse<{ email: string; emailVerifiedAt: string }>>(
      `${environment.apiBaseUrl}/auth/verify-email`,
      { token }
    );
  }

  resendVerification(email: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${environment.apiBaseUrl}/auth/resend-verification`,
      { email }
    );
  }

  setSession(data: LoginResponseData): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    try {
      const encodedPayload = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const claims = JSON.parse(atob(encodedPayload));
      if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) {
        this.clearSession();
        return null;
      }
      return token;
    } catch {
      this.clearSession();
      return null;
    }
  }

  getUser(): AuthUser | null {
    if (!this.getAccessToken()) return null;

    try {
      return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null') as AuthUser | null;
    } catch {
      this.clearSession();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}
