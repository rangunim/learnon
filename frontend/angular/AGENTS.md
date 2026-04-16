# Guidelines for AI Agents

These guidelines define the architectural patterns, state management, and styling rules. All development should strictly adhere to these principles to maintain consistency and scalability.

## 1. Directory and File Structure

Features should be organized by domain under `src/app/features/`.

### Feature Folder Structure
- `model/`: Domain models (`[feature].model.ts`) and API DTOs (`[feature].dto.ts`).
- `page/`: Container components representing major views (e.g., `create`, `edit`, `view`).
    - Sub-views like `list` and `detail` should be nested within `view/`.
    - `[feature].routes.ts`: Lazy-loaded routes for the feature, lives here alongside the page components.
- `[feature].service.ts`: Handles all HTTP communication and data mapping.
- `[feature].store.ts`: Global domain state management for the feature.

### Naming Conventions
- **Pages (Containers)**: `[name].page.ts`, `[name].page.html`, `[name].page.scss`.
- **Dumb Components**: `[name].component.ts`.
- **Global Stores**: `[feature].store.ts`.
- **Local Stores**: `[name].localstore.ts`.

---

## 2. State Management (Signals-based)

### Store vs. LocalStore
1. **Store (Global)**: Provided in `'root'` or at the feature level. Manages data shared across multiple pages (e.g., identity, global feature state, cached lists).
2. **LocalStore (Component-specific)**: Provided at the component level (`providers: [LocalStore]`). Manages state local to a single view (e.g., form current values, search queries, pagination, local loading flags).

### ViewModel Pattern

- Every page component should use a **ViewModel**.
- The `ViewModel` is a signal computed from the `LocalStore` state.
- Component templates should rely **only** on the `viewModel` input to render.
- **Goal**: Logic resides in the Store/LocalStore; components remain thin.

#### Simple ViewModel (single-view features)

For simple views with a single state and a single presentation component:

```typescript
// LocalStore
export interface MyState { items: Item[]; isLoading: boolean; }
export interface MyViewModel { hasItems: boolean; isLoading: boolean; }

@Injectable()
export class MyLocalStore {
    private readonly _state = signal<MyState>({ items: [], isLoading: false });

    public readonly viewModel = computed<MyViewModel>(() => {
        const s = this._state();
        return { state: s, hasItems: s.items.length > 0, isLoading: s.isLoading };
    });
}

// Dumb Component
export class MyViewComponent {
    // Inputs/Outputs MUST NOT be protected. They are public API.
    readonly viewModel = input.required<MyViewModel>();
    readonly onAction = output<void>();

    // Template-bound methods MUST be protected.
    protected doAction(): void { this.onAction.emit(); }
}
```

#### Multi-Step ViewModel (features with sub-steps, e.g. games, wizards)

For views composed of distinct steps (`PLAY → RESULTS`, wizards, etc.), where each presentational component needs its own precise slice of data.

**Rules:**
- Split state into **Signal Slices** — each slice owns a single domain (`_config`, `_play`, `_result`).
- Expose **one `computed()` per step** (`rootViewModel`, `playViewModel`, `resultViewModel`). No raw state leaks outward.
- Dumb Components receive only their dedicated ViewModel — never the full state.
- Mutations target only the relevant slice: `this._play.update(p => ({ ...p, isCorrect: true }))`.
- Page Components expose LocalStore signals as `protected readonly` — the template never references `localstore` directly.

```typescript
// ─── State Slices ──────────────────────────────────────────────
export interface ConfigState  { chapter: Chapter | null; words: WordPair[]; isSwapped: boolean; }
export interface PlayState    { currentIndex: number; isCorrect: boolean | null; }
export interface ResultState  { score: number; }

// ─── ViewModels per step ───────────────────────────────────────
export interface RootViewModel   { state: ConfigState, isLoading: boolean; currentStep: 'PLAY' | 'RESULTS'; totalCount: number; }
export interface PlayViewModel   { state: PlayState, targetText: string; progress: number; }
export interface ResultViewModel { state: ResultState, scoreText: string; percentText: string; chapterId: string | null; }

@Injectable()
export class MyLocalStore {
    private readonly _meta   = signal<{ isLoading: boolean; currentStep: 'PLAY' | 'RESULTS' }>({ isLoading: false, currentStep: 'PLAY' });
    private readonly _config = signal<ConfigState>(initialConfig);
    private readonly _play   = signal<PlayState>(initialPlay);
    private readonly _result = signal<ResultState>(initialResult);

    public readonly rootViewModel   = computed((): RootViewModel   => { /* reads _meta + _config */ });
    public readonly playViewModel   = computed((): PlayViewModel   => { /* reads _config + _play */ });
    public readonly resultViewModel = computed((): ResultViewModel => { /* reads _config + _result */ });
}

// Page Component
export class MyPage {
    private readonly localstore = inject(MyLocalStore);

    protected readonly rootViewModel   = this.localstore.rootViewModel;
    protected readonly playViewModel   = this.localstore.playViewModel;
    protected readonly resultViewModel = this.localstore.resultViewModel;
}
```

```html
<!-- Template: zero direct localstore references -->
@let root = rootViewModel();

@if (root.currentStep === 'PLAY') {
    @let play = playViewModel();
    <app-my-play [viewModel]="play" (next)="next()" />
}
@if (root.currentStep === 'RESULTS') {
    <app-my-result [viewModel]="resultViewModel()" (restart)="restart()" />
}
```

---

## 3. Styling Principles

We strictly separate structural layout from decorative design.

### Tailwind CSS (Structural Only)
Use Tailwind classes **only** for:
- Layout (Grid, Flexbox)
- Dimensions (Width, Height, Max-width)
- Spacing (Margin, Padding, Gap)
- Alignment (Justify, Items, Text-align)
- Display properties

### SCSS (Decorative Only)
Use custom SCSS classes for:
- Typography (Font-size, Font-weight, Letter-spacing)
- Colors and Backgrounds
- Borders and Shadows
- Animations and Transitions
- Complex pseudo-elements

**Important**: Decorative styles must be extracted into the component's `.scss` file. Avoid inlining aesthetic Tailwind classes in HTML.

---

## 4. Angular Best Practices (v20+)

- **Standalone Components**: Everything must be standalone.
- **OnPush Detection**: All components must use `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Signal Inputs/Outputs**: Use `input()`, `output()`, and `model()` instead of decorators.
- **Control Flow**: Use `@if`, `@for`, `@switch` and `@let` instead of structural directives (`*ngIf`, etc.).
- **Optimized Images**: Use `NgOptimizedImage` for static assets.
- **Service Injection**: Use the `inject()` function.
- **Async Pipe**: Avoid manual subscriptions in component templates; instead use the `viewModel()` signal.
- **Lifecycle Hooks**: Use `takeUntilDestroyed()` (from `@angular/core/rxjs-interop`) for manual RxJS subscriptions if they cannot be avoided.
---


## 5. TypeScript & Angular Hard Rules   (for instructions.md)

To maintain high code quality and type safety, the following rules are mandatory:

### TypeScript Strictness
1.  **No `any`**: Use `unknown` or specifically defined interfaces/types.
2.  **Explicit Return Types**: All public methods in services, stores, and components must have an explicit return type.
3.  **Readonly Properties**: Injected dependencies and signals that shouldn't be modified from outside must be `readonly`.
4.  **Minimal Scope (Access Modifiers)**: Always use the narrowest possible scope:
    *   **`readonly` (no visibility modifier)**: For `input()`, `output()`, and `model()`. They **MUST NOT** have the `protected` modifier (as they form the component's public API for data binding). They should be marked as `readonly`.
    *   **`protected`**: For any property or method used directly in the HTML template of the component itself (e.g., event handlers like `protected submit(): void`, or internal template state).
    *   **`private`**: For `inject()` dependencies and internal logic/properties NOT used in the view.
    *   **Public**: Only for members that must be accessible from outside the component/class.


### Data Modeling & Mapping
1.  **DTO vs Domain Model**: API data structures must be defined as `DTOs` (e.g., `ChapterDto`). Domain models used by the UI must be separate (e.g., `Chapter`).
2.  **Service-Level Mapping**: All mapping from DTO to Domain must occur within the Service using private mapping methods (e.g., `private mapToDomain(dto: Dto): Domain`). Store and Components should only handle Domain models.
3.  **Strict Interfaces**: Avoid using classes for data models; use `interface` for better performance and easier state management.
4.  **Single Responsibility**: Extract non-HTTP logic (e.g., CSV parsing, Excel export) into dedicated Utility Services to keep the main Service and Store lean.

### Signal-First State Management
1.  **State Source of Truth**: Signals are the primary way to manage state.
2.  **Encapsulation**: State in Stores must be private (`_state = signal(...)`) and exposed via an `asReadonly()` signal.
3.  **No Direct Mutation**: Never mutate state objects. Use `signal.update(s => ({ ...s, prop: value }))`.
4.  **RxJS to Signals**: Use RxJS for asynchronous operations (HTTP calls). Convert them to signals in Stores by subscribing and updating the corresponding signal.
