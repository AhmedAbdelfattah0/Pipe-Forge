# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
ng serve          # Dev server at http://localhost:4200
ng build          # Production build → dist/
npm run watch     # Build with watch mode (development config)
ng test           # Run Jasmine/Karma unit tests (Chrome, watch mode)
ng generate component <name>   # Scaffold a new standalone component
ng generate service <name>     # Scaffold a new service
ng generate --help             # Full list of schematics
```

No linting tool (ESLint/TSLint) is configured yet.

## What PipeForge Is

Azure DevOps pipeline generator SaaS. Users configure a multi-step wizard and the app generates build + release pipelines (YAML and Classic JSON) supporting multi-market (KSA, Bahrain, UAE), multi-environment (QA, PROD), and multi-language (AR, EN).

**Stack:** Angular 20 + Signals · Tailwind CSS v4 · Supabase Auth · Cloudflare Pages hosting · Node.js/Express backend (separate repo)

## Project Structure

```
src/app/
├── core/                   ← App-wide singletons (guards, interceptors, services)
├── features/
│   ├── generator/          ← 5-step wizard (main feature)
│   │   ├── components/     ← Dumb UI components (View)
│   │   ├── models/         ← Interfaces + types (Model)
│   │   ├── services/       ← State + business logic (ViewModel)
│   │   └── pages/          ← Routed page shells
│   ├── auth/               ← Login/signup
│   └── history/            ← Saved configurations
└── shared/                 ← Reusable across features
    ├── components/         ← pf-button, pf-input, pf-card, pf-badge, pf-stepper, pf-toggle, pf-sidebar
    ├── models/
    ├── pipes/
    └── services/           ← HTTP base, download, notifications
```

**File placement rules:**
- Feature component → `features/{feature}/components/`
- Routed page → `features/{feature}/pages/`
- State/logic → `features/{feature}/services/`
- Interface/type → `features/{feature}/models/`
- Used in 2+ features → `shared/`
- App-wide singleton → `core/services/`

## Architecture: MVVM with Angular Signals

| Layer | Angular Equivalent | Rule |
|---|---|---|
| **Model** | `*.model.ts` | Data shape only — no logic, no methods |
| **ViewModel** | `*.service.ts` (`providedIn: 'root'`) | Signals, computed, business logic, HTTP |
| **View** | `*.component.ts` + template | Render only — binds to ViewModel signals |

**State lives entirely in services.** Components never define signals, never inject `HttpClient`, and never contain computed/derived values. All computed values go in services as `computed()`.

```typescript
// Service (ViewModel) — owns all state
@Injectable({ providedIn: 'root' })
export class GeneratorStateService {
  private readonly _step = signal<number>(1);
  readonly step = this._step.asReadonly();
  readonly isLastStep = computed(() => this._step() === 5);
  nextStep(): void { this._step.update(s => Math.min(s + 1, 5)); }
}

// Component (View) — delegates everything
export class StepComponent {
  protected readonly state = inject(GeneratorStateService);
  protected onNext(): void { this.state.nextStep(); }
}
```

## Component Rules

```typescript
@Component({
  standalone: true,                          // always standalone
  selector: 'pf-my-component',              // always pf- prefix
  templateUrl: './my-component.html',        // always separate files
  styleUrl: './my-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,  // always OnPush
})
export class MyComponent {
  private readonly state = inject(MyService);  // inject(), not constructor
}
```

- Never use `ngModel` — use `ReactiveFormsModule`
- Never use `any` — always type everything
- Never use `BehaviorSubject` — use `signal()` and `computed()`
- Never use `async` pipe when a signal is available
- Never subscribe inside components

## SOLID — Key Rules

- **S:** One responsibility per service. Separate: state, generation logic, download, persistence.
- **O:** New deploy target = new class extending an abstract template, not editing existing code.
- **I:** Small, focused interfaces (`Nameable`, `Codeable`, `Toggleable`).
- **D:** Services depend on abstract classes, not concrete implementations.

## Tailwind CSS v4

- Use design tokens: `bg-primary`, `text-primary`, `bg-navy`, `text-accent`
- Mobile-first responsive: default = mobile, `md:` = tablet, `lg:` = desktop
- Never write inline styles; avoid arbitrary values like `w-[347px]`

## Shared Components (reuse before creating new)

`pf-button` · `pf-input` · `pf-card` · `pf-badge` · `pf-stepper` · `pf-toggle` · `pf-sidebar`

## Angular Bootstrap

`main.ts` → `bootstrapApplication(App, appConfig)` → routes via `<router-outlet>`

`app.config.ts` provides: `provideZonelessChangeDetection()` (no Zone.js — rely on signals for reactivity), `provideRouter(routes)`, `provideBrowserGlobalErrorListeners()`

**Build budgets:** Initial bundle ≤ 500 kB (warn) / 1 MB (error) · Component styles ≤ 4 kB (warn) / 8 kB (error)

**Static assets** served from `public/` (not `src/assets/`)
