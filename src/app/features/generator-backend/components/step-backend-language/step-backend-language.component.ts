import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { BackendGeneratorStateService } from '../../services/backend-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { BackendLanguage, JavaBuildTool } from '../../models/backend-generator.model';

interface LanguageOption {
  id: BackendLanguage;
  label: string;
  versions: string[];
}

@Component({
  standalone: true,
  selector: 'pf-step-backend-language',
  templateUrl: './step-backend-language.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
})
export class StepBackendLanguageComponent {
  protected readonly state = inject(BackendGeneratorStateService);

  protected readonly languages: LanguageOption[] = [
    { id: 'nodejs',  label: 'Node.js', versions: ['18.x', '20.x', '22.x'] },
    { id: 'java',    label: 'Java',    versions: ['11', '17', '21'] },
    { id: 'python',  label: 'Python',  versions: ['3.9', '3.10', '3.11', '3.12'] },
    { id: 'dotnet',  label: '.NET',    versions: ['6', '7', '8'] },
    { id: 'go',      label: 'Go',      versions: ['1.21', '1.22'] },
    { id: 'php',     label: 'PHP',     versions: ['8.1', '8.2', '8.3'] },
    { id: 'ruby',    label: 'Ruby',    versions: ['3.1', '3.2', '3.3'] },
  ];

  protected readonly javaBuildTools: { id: JavaBuildTool; label: string }[] = [
    { id: 'maven',  label: 'Maven' },
    { id: 'gradle', label: 'Gradle' },
  ];

  protected selectLanguage(lang: BackendLanguage): void {
    this.state.updateLanguageConfig({ language: lang });
  }

  protected selectVersion(version: string): void {
    const lang = this.state.languageConfig().language;
    if (lang === 'nodejs')  this.state.updateLanguageConfig({ nodeVersion: version });
    else if (lang === 'java')   this.state.updateLanguageConfig({ javaVersion: version });
    else if (lang === 'python') this.state.updateLanguageConfig({ pythonVersion: version });
    else if (lang === 'dotnet') this.state.updateLanguageConfig({ dotnetVersion: version });
    else if (lang === 'go')     this.state.updateLanguageConfig({ goVersion: version });
    else if (lang === 'php')    this.state.updateLanguageConfig({ phpVersion: version });
    else if (lang === 'ruby')   this.state.updateLanguageConfig({ rubyVersion: version });
  }

  protected selectJavaBuildTool(tool: JavaBuildTool): void {
    this.state.updateLanguageConfig({ javaBuildTool: tool });
  }

  protected currentVersion(): string {
    const c = this.state.languageConfig();
    switch (c.language) {
      case 'nodejs':  return c.nodeVersion;
      case 'java':    return c.javaVersion;
      case 'python':  return c.pythonVersion;
      case 'dotnet':  return c.dotnetVersion;
      case 'go':      return c.goVersion;
      case 'php':     return c.phpVersion;
      case 'ruby':    return c.rubyVersion;
      default:        return '';
    }
  }

  protected currentVersions(): string[] {
    return this.languages.find(l => l.id === this.state.languageConfig().language)?.versions ?? [];
  }
}
