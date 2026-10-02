import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { Profile, Role } from '../models/dashboard.models';
import { ActiveRoleCountPipe } from '../pipes/active-role-count.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule, ActiveRoleCountPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(AdminDashboardService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(NgbModal);

  @ViewChild('profileModal') profileModal!: TemplateRef<any>;
  @ViewChild('roleModal') roleModal!: TemplateRef<any>;

  activeTab = 'profiles';
  profiles: Profile[] = [];
  roles: Role[] = [];

  loadingProfiles = false;
  loadingRoles = false;
  saving = false;
  showProfilePassword = false;
  resendingProfileId: number | null = null;
  readonly profilePageSize = 10;
  profilePage = 0;
  profileTotal = 0;
  profileHasMore = true;
  private profileRequestId = 0;

  editingProfile: Profile | null = null;
  editingRole: Role | null = null;

  profileSearch = '';
  profileRoleId: number | null = null;
  profileSortBy = 'id';
  profileSortOrder: 'asc' | 'desc' = 'asc';

  roleSearch = '';
  roleSortBy = 'id';
  roleSortOrder: 'asc' | 'desc' = 'asc';

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    age: [18, [Validators.required, Validators.min(1), Validators.max(120)]],
    designation: ['', Validators.required],
    role: [0, Validators.required],
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(72)]]
  });

  roleForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadProfiles();
    this.loadRoles();
  }

  logout(): void {
    this.auth.clearSession();
    void this.router.navigateByUrl('/login');
  }

  get filteredProfiles(): Profile[] {
    return this.profiles;
  }

  get filteredRoles(): Role[] {
  return this.roles;
}

  sortRoles(column: string): void {
  if (this.roleSortBy === column) {
    this.roleSortOrder =
      this.roleSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    this.roleSortBy = column;
    this.roleSortOrder = 'asc';
  }

  this.loadRoles();
}

  getRoleSortIcon(column: string): string {
  if (this.roleSortBy !== column) {
    return '↕';
  }

  return this.roleSortOrder === 'asc' ? '↑' : '↓';
}

  loadProfiles(reset = true): void {
    if (!reset && (this.loadingProfiles || !this.profileHasMore)) return;

    if (reset) {
      this.profileRequestId++;
      this.profiles = [];
      this.profilePage = 0;
      this.profileTotal = 0;
      this.profileHasMore = true;
    }

    const requestId = this.profileRequestId;
    const page = reset ? 1 : this.profilePage + 1;
    this.loadingProfiles = true;

    this.api.getProfiles({
      roleId: this.profileRoleId ?? undefined,
      search: this.profileSearch,
      sortBy: this.profileSortBy,
      sortOrder: this.profileSortOrder,
      page,
      size: this.profilePageSize
    }).subscribe({
      next: response => {
        if (requestId !== this.profileRequestId) return;

        const pageProfiles = response.data ?? [];
        this.profiles = reset ? pageProfiles : [...this.profiles, ...pageProfiles];
        this.profilePage = response.pagination.page;
        this.profileTotal = response.pagination.total;
        this.profileHasMore = response.pagination.page < response.pagination.totalPages;
        this.loadingProfiles = false;
      },
      error: error => {
        if (requestId !== this.profileRequestId) return;

        this.loadingProfiles = false;
        this.showError(error);
      }
    });
  }

  onProfilesScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const remainingScroll = container.scrollHeight - container.scrollTop - container.clientHeight;

    if (remainingScroll < 120) {
      this.loadProfiles(false);
    }
  }

  loadRoles(): void {
  this.loadingRoles = true;

  this.api.getRoles({
    search: this.roleSearch,
    sortBy: this.roleSortBy,
    sortOrder: this.roleSortOrder
  }).subscribe({
    next: response => {
      this.roles = response.data ?? [];
      this.loadingRoles = false;
    },
    error: error => {
      this.loadingRoles = false;
      this.showError(error);
    }
  });
}

onRoleSearchChange(): void {
  this.loadRoles();
}

  onProfileSearchChange(): void {
    this.loadProfiles();
  }

  onProfileRoleChange(): void {
    this.loadProfiles();
  }

  sortProfiles(column: string): void {
  if (this.profileSortBy === column) {
    this.profileSortOrder =
      this.profileSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    this.profileSortBy = column;
    this.profileSortOrder = 'asc';
  }

  this.loadProfiles();
}

  getProfileSortIcon(column: string): string {
  if (this.profileSortBy !== column) {
    return '↕';
  }

  return this.profileSortOrder === 'asc' ? '↑' : '↓';
}

  openCreateProfile(): void {
    this.editingProfile = null;
    this.profileForm.controls.password.setValidators([
      Validators.required,
      Validators.minLength(12),
      Validators.maxLength(72)
    ]);
    this.profileForm.controls.password.updateValueAndValidity();
    this.profileForm.reset({
      name: '',
      email: '',
      age: 18,
      designation: '',
      role: this.roles[0]?.id ?? 0,
      password: ''
    });
    this.modal.open(this.profileModal, { centered: true });
  }

  openEditProfile(profile: Profile): void {
    this.editingProfile = profile;
    this.profileForm.controls.password.setValidators([
      Validators.minLength(12),
      Validators.maxLength(72)
    ]);
    this.profileForm.controls.password.updateValueAndValidity();
    this.profileForm.reset({
      name: profile.name,
      email: profile.email,
      age: profile.age,
      designation: profile.designation,
      role: profile.role?.id ?? 0,
      password: ''
    });
    this.modal.open(this.profileModal, { centered: true });
  }

  saveProfile(modalRef: any): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = this.profileForm.getRawValue();

    const { password, ...profilePayload } = payload;
    const request$ = this.editingProfile
      ? this.api.updateProfile(
          this.editingProfile.id,
          password ? { ...profilePayload, password } : profilePayload
        )
      : this.api.createProfile({ ...profilePayload, password });

    request$.subscribe({
      next: response => {
        modalRef.close();
        this.loadProfiles();
        if (response.emailVerificationSent === false) {
          alert('The profile was saved, but its verification email could not be sent. Use Resend in the profile list.');
        } else if (response.emailVerificationSent === true) {
          alert('A verification email was sent to the profile email address.');
        }
      },
      error: error => {
        this.saving = false;
        this.showError(error);
      },
      complete: () => this.saving = false
    });
  }

  confirmDeleteProfile(profile: Profile): void {
    if (!confirm(`Delete profile #${profile.id} (${profile.name})?`)) return;

    this.api.deleteProfile(profile.id).subscribe({
      next: () => this.loadProfiles(),
      error: error => this.showError(error)
    });
  }

  resendProfileVerification(profile: Profile): void {
    if (this.resendingProfileId !== null) return;

    this.resendingProfileId = profile.id;
    this.api.resendVerification(profile.email).subscribe({
      next: response => {
        this.resendingProfileId = null;
        alert(response.message);
      },
      error: error => {
        this.resendingProfileId = null;
        this.showError(error);
      }
    });
  }

  openCreateRole(): void {
    this.editingRole = null;
    this.roleForm.reset({
      name: '',
      description: '',
      isActive: true
    });
    this.modal.open(this.roleModal, { centered: true });
  }

  openEditRole(role: Role): void {
    this.editingRole = role;
    this.roleForm.reset({
      name: role.name,
      description: role.description ?? '',
      isActive: role.isActive
    });
    this.modal.open(this.roleModal, { centered: true });
  }

  saveRole(modalRef: any): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = this.roleForm.getRawValue();

    const request$ = this.editingRole
      ? this.api.updateRole(this.editingRole.id, payload)
      : this.api.createRole(payload);

    request$.subscribe({
      next: () => {
        modalRef.close();
        this.loadRoles();
        this.loadProfiles();
      },
      error: error => this.showError(error),
      complete: () => this.saving = false
    });
  }

  confirmDeleteRole(role: Role): void {
    if (!confirm(`Delete role #${role.id} (${role.name})?`)) return;

    this.api.deleteRole(role.id).subscribe({
      next: () => {
        this.loadRoles();
        this.loadProfiles();
      },
      error: error => this.showError(error)
    });
  }

  private showError(error: any): void {
    console.error(error);
    alert(error?.error?.message ?? error?.message ?? 'Something went wrong');
  }
}
