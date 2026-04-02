import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PlansService } from '../../billing/services/plans.service';
import {
  Check,
  Code,
  Download,
  FileCode,
  GitBranch,
  Globe,
  History,
  Languages,
  Layers,
  Lock,
  LucideAngularModule,
  Menu,
  Server,
  ShieldCheck,
  Star,
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

@Component({
  standalone: true,
  selector: 'pf-landing-page',
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, ButtonComponent],
})
export class LandingPage implements OnInit {
  private readonly router = inject(Router);
  protected readonly plansService = inject(PlansService);

  ngOnInit(): void {
    this.plansService.loadPlans();
  }

  // Mobile menu state
  protected readonly mobileMenuOpen = signal(false);

  // Billing toggle state — false = monthly, true = annual
  protected readonly isAnnual = signal(false);

  protected toggleBilling(): void {
    this.isAnnual.update(v => !v);
  }

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
  protected readonly starIcon = Star;
  protected readonly gitBranchIcon = GitBranch;
  protected readonly layersIcon = Layers;
  protected readonly shieldCheckIcon = ShieldCheck;
  protected readonly lockIcon = Lock;

  protected readonly testimonials = [
    {
      name: 'Sarah K.',
      company: 'DevOps Lead, CloudScale',
      rating: 5,
      text: 'PipeForge saved us hours of manual pipeline setup. What used to take a full day now takes 5 minutes.',
    },
    {
      name: 'Mohammed A.',
      company: 'Senior Engineer, TechFlow',
      rating: 5,
      text: 'The multi-market support is exactly what we needed. Managing KSA and UAE deployments is now effortless.',
    },
    {
      name: 'James L.',
      company: 'CTO, StartupGrid',
      rating: 4,
      text: 'Clean YAML output that just works. We imported the pipelines and deployed on the same day.',
    },
  ];

  protected readonly howItWorksSteps: HowItWorksStep[] = [
    {
      icon: FileCode,
      title: 'Fill the form',
      description:
        'Project info + choose your platform (Azure DevOps or GitHub Actions).',
    },
    {
      icon: Code,
      title: 'Configure your pipeline',
      description:
        'Markets, environments, quality gates, and deploy target (Azure Storage, SWA, App Service, or cPanel/FTP).',
    },
    {
      icon: Download,
      title: 'Download and import',
      description:
        'Get a ZIP file with all your pipeline files, README, and secrets guide — ready to import and run.',
    },
  ];

  protected readonly features: Feature[] = [
    {
      icon: GitBranch,
      title: 'Azure DevOps + GitHub Actions',
      description:
        'Choose the platform that fits your team. Generate YAML pipelines, Classic JSON definitions, or GitHub Actions workflows — your call.',
    },
    {
      icon: Server,
      title: 'Four deploy targets',
      description:
        'Azure Storage, Static Web Apps, App Service, or cPanel/FTP. Each target gets the correct pipeline template automatically.',
    },
    {
      icon: Layers,
      title: 'Any web project',
      description:
        'Frontend, backend, or full stack — PipeForge generates pipelines for any Node.js-based project, not just microfrontends.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality gates',
      description:
        'TypeScript checks, ESLint, unit tests, and format verification — all configurable, all run before the build step.',
    },
    {
      icon: Globe,
      title: 'Multi-market & multi-language',
      description:
        'KSA, UAE, Bahrain, or any custom market. Optional multi-language builds with auto-generated build scripts per combination.',
    },
    {
      icon: Lock,
      title: 'Protected files & secrets',
      description:
        'Preserve .well-known/ files across deploys. Every ZIP includes a secrets guide with setup instructions for your platform.',
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
        'Get a ZIP with all pipelines, README, and setup guide — ready to import and run in minutes.',
    },
  ];

  protected scrollTo(fragment: string): void {
    this.closeMobileMenu();
    this.router.navigate([], { fragment });
  }
}
