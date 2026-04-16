import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { AuthStore } from '../../../core/stores/auth.store';

import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [RouterModule, Button, Tag, NgOptimizedImage],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPage {
  private readonly authStore = inject(AuthStore);
  protected readonly user = this.authStore.user;
}
