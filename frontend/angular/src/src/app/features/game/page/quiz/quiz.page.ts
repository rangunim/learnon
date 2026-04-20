import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, effect } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { QuizLocalStore } from './quiz.localstore';

import { QuizQuestionComponent } from './components/quiz-question/quiz-question.component';
import { QuizResultComponent } from './components/quiz-result/quiz-result.component';
import { QuizSummaryComponent } from './components/quiz-summary/quiz-summary.component';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  imports: [
    RouterModule,
    Card,
    Button,
    Tag,
    ProgressSpinner,
    TooltipModule,
    QuizQuestionComponent,
    QuizSummaryComponent,
    QuizResultComponent
  ],
  providers: [QuizLocalStore],
  templateUrl: './quiz.page.html',
  styleUrl: './quiz.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly localstore = inject(QuizLocalStore);

  protected readonly rootViewModel = this.localstore.rootViewModel;
  protected readonly questionViewModel = this.localstore.questionViewModel;
  protected readonly summaryViewModel = this.localstore.summaryViewModel;
  protected readonly resultViewModel = this.localstore.resultViewModel;

  constructor() {
    effect(() => {
      const root = this.localstore.rootViewModel();
      const question = this.localstore.questionViewModel();
      const trigger = `${root.state.currentStep}-${question.state.currentIndex}`;

      if (trigger) { // Trigger scroll on step or index change
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.localstore.loadGame(id);
    }
  }

  protected handleSelectOption(optionId: string): void {
    this.localstore.selectOption(optionId);
  }

  protected handleNextStep(): void {
    this.localstore.nextStep();
  }

  protected handlePrevStep(): void {
    this.localstore.prevStep();
  }

  protected handleGoToStep(index: number): void {
    this.localstore.goToStep(index);
  }

  protected handleRestartGame(): void {
    this.localstore.restartGame();
  }

  protected handleSetFilter(filter: 'all' | 'correct' | 'wrong'): void {
    this.localstore.setFilter(filter);
  }

  protected handleToggleDirection(): void {
    this.localstore.toggleDirection();
  }

  protected handleForceSummary(): void {
    this.localstore.forceSummary();
  }
}
