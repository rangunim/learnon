import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { QuizItem } from '../../quiz.localstore';

@Component({
  selector: 'app-quiz-summary',
  imports: [Button],
  templateUrl: './quiz-summary.component.html',
  styleUrl: './quiz-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizSummaryComponent {
  readonly items = input.required<QuizItem[]>();

  readonly onEditItem = output<number>();
  readonly onConfirm = output<void>();
  readonly onBack = output<void>();
}
