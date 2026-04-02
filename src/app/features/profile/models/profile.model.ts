export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  job_title: string | null;
  company: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  ado_organization: string | null;
  ado_project: string | null;
  default_platform: 'azure-devops' | 'github-actions' | null;
  github_username: string | null;
  created_at: string;
  updated_at: string;
}
