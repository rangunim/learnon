import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { SummaryViewModel } from '../../quiz.localstore';

@Component({
  selector: 'app-quiz-summary',
  imports: [Button],
  templateUrl: './quiz-summary.component.html',
  styleUrl: './quiz-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizSummaryComponent {
  readonly viewModel = input.required<SummaryViewModel>();

  readonly onEditItem = output<number>();
  readonly onConfirm = output<void>();
  readonly onBack = output<void>();

  protected handleEditItem(index: number): void {
    this.onEditItem.emit(index);
  }

  protected handleConfirm(): void {
    this.onConfirm.emit();
  }

  protected handleBack(): void {
    this.onBack.emit();
  }
}
