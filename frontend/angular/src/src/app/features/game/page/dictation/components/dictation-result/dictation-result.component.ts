import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ResultViewModel } from '../../dictation.localstore';

@Component({
  selector: 'app-dictation-result',
  imports: [RouterModule, Button, Tag],
  templateUrl: './dictation-result.component.html',
  styleUrl: './dictation-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DictationResultComponent {
  readonly viewModel = input.required<ResultViewModel>();

  readonly restart = output<void>();

  protected onRestart(): void {
    this.restart.emit();
  }
}
