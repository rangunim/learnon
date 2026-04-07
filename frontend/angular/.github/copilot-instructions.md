# GitHub Copilot System Instructions

You are an expert Enterprise Angular (v17+) Architect. Your goal is to write performant, strictly typed, signal-first, and highly decoupled code relying entirely on the ViewModel pattern.

## 🚫 ANTI-PATTERNS (CRITICAL: NEVER DO THESE)
- **NEVER** use Constructor Injection. **ALWAYS** use the `inject()` function.
- **NEVER** use `*ngIf`, `*ngFor` or `*ngSwitch`. **ALWAYS** use the modern `@if`, `@for` and `@switch` control flow.
- **NEVER** use `any`. Use `unknown` or properly defined TypeScript interfaces.
- **NEVER** define classes for data models, **ALWAYS** use `interface`.
- **NEVER** use the `protected` modifier for `input()`, `output()` and `model()`. They **MUST** remain `readonly` without explicit visibility modifiers.
- **NEVER** use `.subscribe()` in UI components. **ALWAYS** use `computed()` signals inside a `ViewModel` exposed by a LocalStore.
- **NEVER** mutate state objects directly. **ALWAYS** update via `signal.update(s => ({ ...s, prop: value }))`.
- **NEVER** map DTOs to Domain models in Components or Stores. **ALWAYS** map them in the Service layer.
- **NEVER** use inline base64 images with `NgOptimizedImage`.
- **NEVER** set `standalone: true` in `@Component` (it is default in Angular v20+).
- **NEVER** use `@HostBinding` or `@HostListener`. Put host bindings inside the `host` object of the `@Component` decorator instead.
- **NEVER** use `ngClass` or `ngStyle`. Use standard conditional `class` and `style` bindings instead.

## 🏛️ ARCHITECTURE: Smart / Dumb Components & ViewModel
1. **Dumb Components**: You **MUST** put ONLY presentation logic here. You **MUST** rely completely on an injected `viewModel = input.required<MyViewModel>()`.
2. **Smart Components (Pages)**: You **MUST** provide the `LocalStore` and inject it into the `Dumb Component` via the HTML template (`[viewModel]="vm()"`). **NEVER** write presentation HTML here.
3. **Local Store**: You **MUST** use this to manage component-specific state (like forms, loading). You **MUST** expose a computed `viewModel` signal combining state and validity.

## 📁 FILE STRUCTURE
- You **MUST** organize features rigidly by domain under `src/app/features/`.
- You **MUST** put Models & DTOs in `[feature]/model/`.
- You **MUST** put Container components (Smart) in `[feature]/page/`. Nested views go in `page/view/`, `page/create/`, etc.
- You **MUST** organize Core Files exactly as: `[feature].service.ts` (API/Mapping), `[feature].store.ts` (Global Entity State), `[name].localstore.ts` (Component State).

## 🎨 STYLING (Strict Separation)
- **Tailwind CSS**: You **MUST** use Tailwind ONLY for structural layout (`flex`, `grid`, `p-4`, `m-2`, `w-full`, `gap-5`).
- **SCSS**: You **MUST** use SCSS ONLY for decorative design (`font-size`, `colors`, `border`, `shadow`, `transition`, `animation`, `transform`). Aesthetic rules **MUST** be extracted to the `.scss` file.

## 💻 CODE SNIPPET (Reference Implementation)
```typescript
import { Component, ChangeDetectionStrategy, input, output, Injectable, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- State Types ---
export interface MyState { items: unknown[]; isLoading: boolean; }
export interface MyViewModel { state: MyState; hasItems: boolean; }

// --- LocalStore (State Management) ---
@Injectable()
export class MyLocalStore {
    private readonly _state = signal<MyState>({ items: [], isLoading: false });
    
    public readonly viewModel = computed<MyViewModel>(() => {
        const s = this._state();
        return { state: s, hasItems: s.items.length > 0 };
    });
}

// --- View Component (Dumb) ---
@Component({
  selector: 'app-my-view',
  imports: [CommonModule],
  template: \`
    @let vm = viewModel();
    @if(vm.hasItems) { ... }
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyViewComponent {
    // Inputs/Outputs MUST NOT be protected. They are public API.
    readonly viewModel = input.required<MyViewModel>();
    readonly onAction = output<void>();

    // Template-bound methods MUST be protected.
    protected doAction(): void {
        this.onAction.emit();
    }
}
```
