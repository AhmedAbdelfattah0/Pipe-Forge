import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BackendGeneratorStateService } from '../../services/backend-generator-state.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import type { BackendDeployTargetType } from '../../models/backend-generator.model';

@Component({
  standalone: true,
  selector: 'pf-step-backend-deploy-target',
  templateUrl: './step-backend-deploy-target.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent],
})
export class StepBackendDeployTargetComponent implements OnInit {
  protected readonly state = inject(BackendGeneratorStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly appServiceForm = new FormGroup({
    appServiceName: new FormControl('', { nonNullable: true }),
    resourceGroup: new FormControl('', { nonNullable: true }),
  });

  protected readonly dockerForm = new FormGroup({
    acrName: new FormControl('', { nonNullable: true }),
    imageName: new FormControl('', { nonNullable: true }),
  });

  protected readonly k8sForm = new FormGroup({
    clusterName: new FormControl('', { nonNullable: true }),
    namespace: new FormControl('default', { nonNullable: true }),
    manifestPath: new FormControl('k8s/', { nonNullable: true }),
  });

  protected readonly deployTargetTypes: { id: BackendDeployTargetType; label: string; desc: string }[] = [
    { id: 'app-service', label: 'Azure App Service', desc: 'Deploy to a managed Azure App Service' },
    { id: 'docker-acr',  label: 'Docker + ACR',      desc: 'Build image and push to Azure Container Registry' },
    { id: 'kubernetes',  label: 'Kubernetes (AKS)',   desc: 'Deploy manifest to Azure Kubernetes Service' },
  ];

  ngOnInit(): void {
    const dt = this.state.deployTarget();
    this.appServiceForm.patchValue({
      appServiceName: dt.appService.appServiceName,
      resourceGroup: dt.appService.resourceGroup,
    }, { emitEvent: false });
    this.dockerForm.patchValue({
      acrName: dt.docker.acrName,
      imageName: dt.docker.imageName,
    }, { emitEvent: false });
    this.k8sForm.patchValue({
      clusterName: dt.kubernetes.clusterName,
      namespace: dt.kubernetes.namespace,
      manifestPath: dt.kubernetes.manifestPath,
    }, { emitEvent: false });

    this.appServiceForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.state.updateDeployTarget({
          appService: {
            ...this.state.deployTarget().appService,
            appServiceName: v.appServiceName ?? '',
            resourceGroup: v.resourceGroup ?? '',
          },
        });
      });

    this.dockerForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.state.updateDeployTarget({
          docker: {
            ...this.state.deployTarget().docker,
            acrName: v.acrName ?? '',
            imageName: v.imageName ?? '',
          },
        });
      });

    this.k8sForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.state.updateDeployTarget({
          kubernetes: {
            ...this.state.deployTarget().kubernetes,
            clusterName: v.clusterName ?? '',
            namespace: v.namespace ?? 'default',
            manifestPath: v.manifestPath ?? 'k8s/',
          },
        });
      });
  }

  protected selectTargetType(type: BackendDeployTargetType): void {
    this.state.updateDeployTarget({ type });
  }

  protected selectAppSlot(slot: 'production' | 'staging'): void {
    this.state.updateDeployTarget({
      appService: { ...this.state.deployTarget().appService, slot },
    });
  }

  protected selectTagStrategy(strategy: 'BuildId' | 'latest' | 'semver'): void {
    this.state.updateDeployTarget({
      docker: { ...this.state.deployTarget().docker, tagStrategy: strategy },
    });
  }
}
