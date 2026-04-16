import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { QuestionViewModel } from '../../quiz.localstore';

@Component({
  selector: 'app-quiz-question',
  imports: [Button, ProgressBar],
  templateUrl: './quiz-question.component.html',
  styleUrl: './quiz-question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizQuestionComponent {
  readonly viewModel = input.required<QuestionViewModel>();

  readonly selectOption = output<string>();
  readonly next = output<void>();
  readonly prev = output<void>();

  protected onNext(): void {
    this.next.emit();
  }

  protected onPrev(): void {
    this.prev.emit();
  }

  protected onSelectOption(optionId: string): void {
    this.selectOption.emit(optionId);
  }
}
