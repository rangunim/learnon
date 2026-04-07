import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthStore } from './core/stores/auth.store';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent, AuthLayoutComponent],
  template: `
    <div id="learnon-mfe-root">
      @if (authStore.isLoggedIn()) {
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
  protected readonly authStore = inject(AuthStore);
}
