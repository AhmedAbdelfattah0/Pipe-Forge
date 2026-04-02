/**
 * admin.model.ts
 *
 * Data-shape interfaces for the admin dashboard feature.
 * No logic — pure Model layer.
 */

export interface AdminMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  totalGenerations: number;
  pendingFeedback: number;
}

export interface AdminUserOverview {
  userId: string;
  email: string;
  plan: string;
  mfeUsedThisMonth: number;
  mfeMonthlyLimit: number;
  billingCycleStart: string;
  createdAt: string;
  displayName: string | null;
  company: string | null;
}

export interface AdminFeedback {
  id: string;
  userId: string;
  rating: number;
  pipelinesWorked: string | null;
  whatWentWrong: string | null;
  featureRequest: string | null;
  displayName: string | null;
  company: string | null;
  isPublic: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  appliesTo: string;
  billingCycle: string;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminGenerations {
  byPlatform: Record<string, number>;
  byDeployTarget: Record<string, number>;
  recentGenerations: RecentGeneration[];
  totalThisMonth: number;
}

export interface RecentGeneration {
  id: string;
  mfeName: string;
  deployTarget: string;
  markets: string[];
  createdAt: string;
}

export interface Compensation {
  id: string;
  userId: string;
  adminId: string;
  type: 'free_month' | 'plan_upgrade';
  value: string;
  reason: string | null;
  appliedAt: string;
}

export interface AdminHealthStatus {
  status: string;
  supabase: string;
  timestamp: string;
  environment: string;
}
