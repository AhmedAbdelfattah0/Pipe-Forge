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
import { EnvironmentType, Language } from '../../models/generator.model';
import { GeneratorStateService } from '../../services/generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ToggleInlineComponent } from '../../../../shared/components/toggle-inline/toggle-inline.component';

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
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, InputComponent, ToggleInlineComponent],
})
export class StepLanguagesComponent implements OnInit {
  protected readonly state = inject(GeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);

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

  // FormControls for the two static token-replacement text inputs.
  // Initialized in ngOnInit from service state (supports back-navigation).
  protected readonly envFilePathControl = new FormControl('', { nonNullable: true });
  protected readonly secretVarNamesControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    const tr = this.state.tokenReplacement();
    this.envFilePathControl.setValue(tr.environmentFilePath, { emitEvent: false });
    this.secretVarNamesControl.setValue(tr.secretVariableNames, { emitEvent: false });

    this.envFilePathControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v =>
        this.state.setTokenReplacement({
          ...this.state.tokenReplacement(),
          environmentFilePath: v,
        })
      );

    this.secretVarNamesControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v =>
        this.state.setTokenReplacement({
          ...this.state.tokenReplacement(),
          secretVariableNames: v,
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
    this.state.setTokenReplacement({
      ...this.state.tokenReplacement(),
      enabled: checked,
    });
  }

  protected buildScriptValue(marketCode: string, keySuffix: string): string {
    return this.state.buildScripts()[marketCode + keySuffix] ?? '';
  }
}
