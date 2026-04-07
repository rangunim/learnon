import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { Avatar } from 'primeng/avatar';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { NgOptimizedImage } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-main-layout',
  imports: [RouterModule, Avatar, Toast, ConfirmDialog, Menu, NgOptimizedImage, ButtonModule, TooltipModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  protected readonly user = this.authStore.user;
  protected readonly isDark = () => this.themeService.theme() === 'dark';

  protected readonly profileMenuItems: MenuItem[] = [
    {
      label: 'Mój Profil',
      icon: 'pi pi-user',
      routerLink: '/account/profile'
    },
    {
      separator: true
    },
    {
      label: 'Wyloguj się',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  protected logout(): void {
    this.authStore.handleLogout();
    this.router.navigate(['/']);
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected reloadPage(): void {
    window.location.reload();
  }
}
