import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonComponent,
  CardComponent,
  InputComponent,
  SpinnerComponent,
} from '../../../shared/components';
import { ProfileService } from '../services/profile.service';
import type { CICDPlatform } from '../../generator/models/generator.model';

@Component({
  standalone: true,
  selector: 'pf-profile-page',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    SpinnerComponent,
  ],
})
export class ProfilePage implements OnInit {
  protected readonly profileService = inject(ProfileService);

  protected readonly selectedPlatform = signal<CICDPlatform>('azure-devops');

  // Form controls
  protected readonly fullName = new FormControl('');
  protected readonly jobTitle = new FormControl('');
  protected readonly company = new FormControl('');
  protected readonly linkedinUrl = new FormControl('');
  protected readonly adoOrganization = new FormControl('');
  protected readonly adoProject = new FormControl('');
  protected readonly githubUsername = new FormControl('');

  protected readonly form = new FormGroup({
    fullName: this.fullName,
    jobTitle: this.jobTitle,
    company: this.company,
    linkedinUrl: this.linkedinUrl,
    adoOrganization: this.adoOrganization,
    adoProject: this.adoProject,
    githubUsername: this.githubUsername,
  });

  async ngOnInit(): Promise<void> {
    await this.profileService.loadProfile();
    this.populateForm();
  }

  private populateForm(): void {
    const p = this.profileService.profile();
    if (!p) return;

    this.fullName.setValue(p.full_name ?? '');
    this.jobTitle.setValue(p.job_title ?? '');
    this.company.setValue(p.company ?? '');
    this.linkedinUrl.setValue(p.linkedin_url ?? '');
    this.adoOrganization.setValue(p.ado_organization ?? '');
    this.adoProject.setValue(p.ado_project ?? '');
    this.githubUsername.setValue(p.github_username ?? '');
    this.selectedPlatform.set((p.default_platform as CICDPlatform) ?? 'azure-devops');
  }

  protected selectPlatform(platform: CICDPlatform): void {
    this.selectedPlatform.set(platform);
  }

  protected async onSave(): Promise<void> {
    await this.profileService.updateProfile({
      full_name: this.fullName.value ?? '',
      job_title: this.jobTitle.value ?? '',
      company: this.company.value ?? '',
      linkedin_url: this.linkedinUrl.value ?? '',
      ado_organization: this.adoOrganization.value ?? '',
      ado_project: this.adoProject.value ?? '',
      default_platform: this.selectedPlatform(),
      github_username: this.githubUsername.value ?? '',
    });
  }

  protected async onAvatarChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await this.profileService.uploadAvatar(file);
  }

  protected get initials(): string {
    return this.profileService.getInitials();
  }

  protected get memberSince(): string {
    const p = this.profileService.profile();
    if (!p) return '';
    return new Date(p.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  protected get displayName(): string {
    const p = this.profileService.profile();
    if (!p) return '';
    return p.full_name || p.display_name || p.email.split('@')[0] || '';
  }

  protected get subtitle(): string {
    const p = this.profileService.profile();
    if (!p) return '';
    const parts: string[] = [];
    if (p.job_title) parts.push(p.job_title);
    if (p.company) parts.push(p.company);
    return parts.join(' at ');
  }
}
