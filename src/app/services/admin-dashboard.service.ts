import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Profile, Role } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getProfiles(roleId?: number): Observable<ApiResponse<Profile[]>> {
    let params = new HttpParams();
    if (roleId !== undefined && roleId !== null) {
      params = params.set('roleId', roleId);
    }
    return this.http.get<ApiResponse<Profile[]>>(
      `${this.baseUrl}/profile/users`,
      { params }
    );
  }

  createProfile(payload: {
    name: string;
    email: string;
    age: number;
    designation: string;
    role: number;
  }): Observable<ApiResponse<Profile>> {
    return this.http.post<ApiResponse<Profile>>(
      `${this.baseUrl}/profile/createuser`,
      payload
    );
  }

  updateProfile(
    id: number,
    payload: Partial<{
      name: string;
      email: string;
      age: number;
      designation: string;
      role: number;
    }>
  ): Observable<ApiResponse<Profile>> {
    return this.http.put<ApiResponse<Profile>>(
      `${this.baseUrl}/profile/updateuser`,
      payload,
      { params: new HttpParams().set('id', id) }
    );
  }

  deleteProfile(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/profile/deleteuser`,
      { params: new HttpParams().set('id', id) }
    );
  }

  getRoles(options?: {
    id?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<ApiResponse<Role[]>> {
    let params = new HttpParams()
      .set('sortBy', options?.sortBy ?? 'id')
      .set('sortOrder', options?.sortOrder ?? 'asc');

    if (options?.id !== undefined && options.id !== null) {
      params = params.set('id', options.id);
    }

    return this.http.get<ApiResponse<Role[]>>(
      `${this.baseUrl}/role/list`,
      { params }
    );
  }

  createRole(payload: {
    name: string;
    description: string;
  }): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(
      `${this.baseUrl}/role/create`,
      payload
    );
  }

  updateRole(
    id: number,
    payload: Partial<{
      name: string;
      description: string;
      isActive: boolean;
    }>
  ): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(
      `${this.baseUrl}/role/update`,
      payload,
      { params: new HttpParams().set('id', id) }
    );
  }

  deleteRole(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/role/delete`,
      { params: new HttpParams().set('id', id) }
    );
  }
}
