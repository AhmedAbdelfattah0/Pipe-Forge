import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EnvironmentType, Language, TokenMapping } from '../../models/generator.model';
import { GeneratorStateService } from '../../services/generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToggleInlineComponent } from '../../../../shared/components/toggle-inline/toggle-inline.component';
import { FeatureGateComponent } from '../../../../shared/components/feature-gate/feature-gate.component';
import { PlanGateService } from '../../../billing/services/plan-gate.service';

interface MatrixColumn {
  env: EnvironmentType;
  lang: Language | null;  // null in single-language mode
  headerKey: string;      // unique track key for @for
  keySuffix: string;      // appended after marketCode to form the buildScripts map key
}

@Component({
  standalone: true,
  selector: 'pf-step-languages',
  templateUrl: './step-languages.component.html',
  styleUrl: './step-languages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, InputComponent, ToggleInlineComponent, FeatureGateComponent],
})
export class StepLanguagesComponent implements OnInit {
  protected readonly state = inject(GeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly planGate = inject(PlanGateService);

  // Token format options — defined here to avoid Angular template parser issues with ${...} literals.
  protected readonly tokenFormatOptions: { value: '#{TOKEN}#' | '__TOKEN__' | '${TOKEN}'; label: string; description: string }[] = [
    { value: '#{TOKEN}#', label: '#{TOKEN_NAME}#', description: 'Azure DevOps standard' },
    { value: '__TOKEN__', label: '__TOKEN_NAME__', description: 'Double underscore' },
    { value: '${TOKEN}', label: '${TOKEN_NAME}', description: 'Dollar sign' },
  ];

  // Display-only computed — matrix column headers are a pure presentation concern.
  // Branches on isMultiLanguage: multi produces Env×Lang columns, single produces Env-only columns.
  protected readonly matrixColumns = computed<MatrixColumn[]>(() => {
    const columns: MatrixColumn[] = [];
    if (this.state.isMultiLanguage()) {
      for (const env of this.state.environments()) {
        for (const lang of this.state.languages()) {
          columns.push({
            env,
            lang,
            headerKey: `${env}-${lang.code}`,
            keySuffix: `-${env}-${lang.code}`,
          });
        }
      }
    } else {
      for (const env of this.state.environments()) {
        columns.push({
          env,
          lang: null,
          headerKey: env,
          keySuffix: `-${env}`,
        });
      }
    }
    return columns;
  });

  // FormControl for the file pattern input (new TokenReplacement model).
  protected readonly filePatternControl = new FormControl('src/environments/environment.*.ts', { nonNullable: true });
  /** @deprecated Kept for backward compatibility — not shown in UI. */
  protected readonly envFilePathControl = new FormControl('', { nonNullable: true });
  /** @deprecated Kept for backward compatibility — not shown in UI. */
  protected readonly secretVarNamesControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    const tr = this.state.tokenReplacement();
    this.filePatternControl.setValue(tr.filePattern || 'src/environments/environment.*.ts', { emitEvent: false });

    this.filePatternControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v =>
        this.state.setTokenReplacement({
          ...this.state.tokenReplacement(),
          filePattern: v,
          // Also keep deprecated field in sync for existing backend templates
          environmentFilePath: v,
        })
      );
  }

  protected onMultiLanguageToggle(checked: boolean): void {
    this.state.setIsMultiLanguage(checked);
  }

  protected onLanguageNameChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const lang = this.state.languages()[index];
    this.state.updateLanguage(index, { ...lang, name: value });
  }

  protected onLanguageCodeChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const lang = this.state.languages()[index];
    this.state.updateLanguage(index, { ...lang, code: value });
  }

  // key = full buildScripts map key e.g. "sa-QA-en" (multi) or "sa-QA" (single)
  protected onBuildScriptChange(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.state.setBuildScript(key, value);
  }

  protected onTokenEnabledToggle(checked: boolean): void {
    const tr = this.state.tokenReplacement();
    this.state.setTokenReplacement({
      ...tr,
      enabled: checked,
      tokenMappings: tr.tokenMappings?.length ? tr.tokenMappings : [{ tokenName: '', variableName: '' }],
    });
  }

  protected onTokenFormatChange(format: '#{TOKEN}#' | '__TOKEN__' | '${TOKEN}'): void {
    this.state.setTokenReplacement({
      ...this.state.tokenReplacement(),
      tokenFormat: format,
    });
  }

  protected addTokenMapping(): void {
    const tr = this.state.tokenReplacement();
    this.state.setTokenReplacement({
      ...tr,
      tokenMappings: [...(tr.tokenMappings ?? []), { tokenName: '', variableName: '' }],
    });
  }

  protected removeTokenMapping(index: number): void {
    const tr = this.state.tokenReplacement();
    this.state.setTokenReplacement({
      ...tr,
      tokenMappings: (tr.tokenMappings ?? []).filter((_, i) => i !== index),
    });
  }

  protected onTokenMappingChange(index: number, field: 'tokenName' | 'variableName', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const tr = this.state.tokenReplacement();
    const mappings: TokenMapping[] = [...(tr.tokenMappings ?? [])];
    mappings[index] = { ...mappings[index], [field]: value };
    this.state.setTokenReplacement({ ...tr, tokenMappings: mappings });
  }

  protected buildScriptValue(marketCode: string, keySuffix: string): string {
    return this.state.buildScripts()[marketCode + keySuffix] ?? '';
  }

  protected onQualityGatesToggle(checked: boolean): void {
    this.state.setQualityGatesEnabled(checked);
  }

  protected onQualityGateToggle(gate: 'typescript' | 'lint' | 'tests' | 'format', checked: boolean): void {
    this.state.setQualityGate(gate, { enabled: checked });
  }

  protected onQualityGateCommandChange(gate: 'typescript' | 'lint' | 'tests' | 'format', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.state.setQualityGate(gate, { command: value });
  }
}
