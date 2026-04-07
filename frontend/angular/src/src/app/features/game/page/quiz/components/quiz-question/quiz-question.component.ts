import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { QuizItem } from '../../quiz.localstore';

@Component({
  selector: 'app-quiz-question',
  imports: [Button, ProgressBar],
  templateUrl: './quiz-question.component.html',
  styleUrl: './quiz-question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizQuestionComponent {
  readonly item = input.required<QuizItem | null>();
  readonly currentIndex = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly progress = input.required<number>();

  readonly selectOption = output<string>();
  readonly next = output<void>();
  readonly prev = output<void>();
}
