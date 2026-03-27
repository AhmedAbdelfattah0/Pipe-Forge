import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  Check,
  Code,
  Download,
  FileCode,
  Globe,
  History,
  Languages,
  LucideAngularModule,
  Menu,
  Server,
  X,
  Zap,
} from 'lucide-angular';

import { ButtonComponent } from '../../../shared/components';

interface HowItWorksStep {
  icon: typeof FileCode;
  title: string;
  description: string;
}

interface Feature {
  icon: typeof Globe;
  title: string;
  description: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  subtitle: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

@Component({
  standalone: true,
  selector: 'pf-landing-page',
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, ButtonComponent],
})
export class LandingPage {
  private readonly router = inject(Router);

  // Mobile menu state
  protected readonly mobileMenuOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  // Lucide icons
  protected readonly zapIcon = Zap;
  protected readonly menuIcon = Menu;
  protected readonly xIcon = X;
  protected readonly fileCodeIcon = FileCode;
  protected readonly codeIcon = Code;
  protected readonly downloadIcon = Download;
  protected readonly globeIcon = Globe;
  protected readonly serverIcon = Server;
  protected readonly languagesIcon = Languages;
  protected readonly historyIcon = History;
  protected readonly checkIcon = Check;

  protected readonly howItWorksSteps: HowItWorksStep[] = [
    {
      icon: FileCode,
      title: 'Fill the form',
      description:
        'Answer questions about your project structure, markets, and deployment targets.',
    },
    {
      icon: Code,
      title: 'Choose your format',
      description:
        'Select YAML for modern pipelines or Classic JSON for compatibility.',
    },
    {
      icon: Download,
      title: 'Download and import',
      description:
        'Get a ZIP file with all your pipelines ready to import into Azure DevOps.',
    },
  ];

  protected readonly features: Feature[] = [
    {
      icon: Globe,
      title: 'Multi-market support',
      description:
        'Support for KSA, Bahrain, UAE, and any custom markets you need. Each market gets its own isolated pipeline set.',
    },
    {
      icon: FileCode,
      title: 'YAML and Classic JSON',
      description:
        'Generate both modern YAML pipelines and Classic JSON definitions for full Azure DevOps compatibility.',
    },
    {
      icon: Server,
      title: 'Multiple deploy targets',
      description:
        'Azure Storage, Static Web Apps, and App Service all supported with the correct release pipeline template for each.',
    },
    {
      icon: Languages,
      title: 'Multi-language builds',
      description:
        'Optional separate builds for Arabic and English with an auto-generated build scripts matrix.',
    },
    {
      icon: History,
      title: 'Project history',
      description:
        'Save and regenerate pipeline sets. Never start from scratch when adding a new market or environment.',
    },
    {
      icon: Zap,
      title: 'Instant download',
      description:
        'Get a ZIP with all pipelines, infra files, README, and a setup checklist — ready to use in minutes.',
    },
  ];

  protected readonly pricingPlans: PricingPlan[] = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      subtitle: 'Perfect for trying out PipeForge',
      features: [
        '1 market',
        '3 MFEs per month',
        'YAML output only',
        'Community support',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      subtitle: 'For small teams and projects',
      features: [
        '3 markets',
        'Unlimited MFEs',
        'YAML + JSON output',
        'Priority support',
        'History & regeneration',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Growth',
      price: '$149',
      period: '/month',
      subtitle: 'For scaling organizations',
      features: [
        'Unlimited markets',
        'Unlimited MFEs',
        'YAML + JSON output',
        'Priority support',
        'History & regeneration',
        'Custom templates',
        'Team collaboration',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
  ];

  protected scrollTo(fragment: string): void {
    this.closeMobileMenu();
    this.router.navigate([], { fragment });
  }
}
