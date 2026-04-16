import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { RegisterLocalStore, RegisterViewModel } from './register.localstore';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { DatePicker } from 'primeng/datepicker';
import { RadioButton } from 'primeng/radiobutton';
import { Checkbox } from 'primeng/checkbox';

@Component({
  imports: [ReactiveFormsModule, RouterModule, Button, InputText, Password, Card, Message, DatePicker, RadioButton, Checkbox],
  providers: [RegisterLocalStore],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPage {
  private readonly store = inject(RegisterLocalStore);
  readonly viewModel: Signal<RegisterViewModel> = this.store.viewModel;


  protected onSubmit(): void {
    this.store.onSubmit();
  }
}

