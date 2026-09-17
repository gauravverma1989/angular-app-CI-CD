import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
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

  profileSearch = '';
  roleSearch = '';

  editingProfile: Profile | null = null;
  editingRole: Role | null = null;

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    age: [18, [Validators.required, Validators.min(1), Validators.max(120)]],
    designation: ['', Validators.required],
    role: [0, Validators.required]
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

  get filteredProfiles(): Profile[] {
    const query = this.profileSearch.trim().toLowerCase();
    if (!query) return this.profiles;

    return this.profiles.filter(p =>
      String(p.id).includes(query) ||
      p.name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.designation.toLowerCase().includes(query) ||
      (p.role?.name ?? '').toLowerCase().includes(query)
    );
  }

  get filteredRoles(): Role[] {
    const query = this.roleSearch.trim().toLowerCase();
    if (!query) return this.roles;

    return this.roles.filter(r =>
      String(r.id).includes(query) ||
      r.name.toLowerCase().includes(query) ||
      (r.description ?? '').toLowerCase().includes(query)
    );
  }

  loadProfiles(): void {
    this.loadingProfiles = true;
    this.api.getProfiles().subscribe({
      next: response => this.profiles = response.data ?? [],
      error: error => this.showError(error),
      complete: () => this.loadingProfiles = false
    });
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.api.getRoles().subscribe({
      next: response => this.roles = response.data ?? [],
      error: error => this.showError(error),
      complete: () => this.loadingRoles = false
    });
  }

  openCreateProfile(): void {
    this.editingProfile = null;
    this.profileForm.reset({
      name: '',
      email: '',
      age: 18,
      designation: '',
      role: this.roles[0]?.id ?? 0
    });
    this.modal.open(this.profileModal, { centered: true });
  }

  openEditProfile(profile: Profile): void {
    this.editingProfile = profile;
    this.profileForm.reset({
      name: profile.name,
      email: profile.email,
      age: profile.age,
      designation: profile.designation,
      role: profile.role?.id ?? 0
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

    const request$ = this.editingProfile
      ? this.api.updateProfile(this.editingProfile.id, payload)
      : this.api.createProfile(payload);

    request$.subscribe({
      next: () => {
        modalRef.close();
        this.loadProfiles();
      },
      error: error => this.showError(error),
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
