import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { LoginLocalStore, LoginViewModel } from './login.localstore';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, Button, InputText, Password, Card, Message],
  providers: [LoginLocalStore],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  private readonly store = inject(LoginLocalStore);
  protected readonly viewModel: Signal<LoginViewModel> = this.store.viewModel;

  protected onSubmit(): void {
    this.store.onSubmit();
  }
}
