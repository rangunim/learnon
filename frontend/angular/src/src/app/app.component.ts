import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { AuthStore } from './core/stores/auth.store';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

@Component({
  selector: 'learnon-mfe',
  imports: [MainLayoutComponent, AuthLayoutComponent],
  template: `
    <div id="learnon-mfe-root">
      @if (isLoggedIn()) {
        <app-main-layout></app-main-layout>
      } @else {
        <app-auth-layout></app-auth-layout>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: var(--font-sans, "Open Sans Variable", ui-sans-serif, system-ui, sans-serif);
      color: var(--p-text-color, #656565);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly authStore = inject(AuthStore);

  protected readonly isLoggedIn: Signal<boolean> = computed(() => this.authStore.isLoggedIn());

}
