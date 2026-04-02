export interface FeedbackSubmission {
  generationId?: string | null;
  rating: number;
  pipelinesWorked?: 'yes' | 'no' | 'partial' | null;
  whatWentWrong?: string | null;
  featureRequest?: string | null;
  displayName?: string | null;
  company?: string | null;
  isPublic?: boolean;
}

export interface Testimonial {
  id: string;
  rating: number;
  displayName: string | null;
  company: string | null;
  featureRequest: string | null;
  pipelinesWorked: string | null;
  createdAt: string;
}
