import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { NgOptimizedImage } from '@angular/common';
import { inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterModule, ButtonModule, NgOptimizedImage],
  template: `
    <div class="auth-layout relative min-h-screen flex flex-col">
      <header class="auth-header w-full z-10">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a routerLink="/" class="block">
            <img ngSrc="/img/logo.png" alt="LearnON Logo" width="155" height="52" priority />
          </a>
          <nav class="flex gap-2">
            <p-button routerLink="/login" label="Zaloguj" [text]="true" severity="secondary" />
            <p-button routerLink="/register" label="Zarejestruj" [text]="true" severity="secondary" />
            <p-button 
              [icon]="isDark() ? 'pi pi-sun' : 'pi pi-moon'" 
              [rounded]="true" 
              [text]="true" 
              (onClick)="toggleTheme()"
              severity="secondary"
            />
          </nav>
        </div>
      </header>
      
      <main class="flex-1 flex items-center justify-center p-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .auth-layout {
      background-color: var(--p-content-background, #f9fafb);
      color: var(--p-text-color, #656565);
    }
    .auth-header {
      background-color: var(--p-content-background, #ffffff);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border-bottom: 1px solid var(--p-content-border-color, #f3f4f6);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {
  private readonly themeService = inject(ThemeService);
  protected readonly isDark = () => this.themeService.theme() === 'dark';

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
