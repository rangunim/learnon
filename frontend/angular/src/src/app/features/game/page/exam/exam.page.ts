import { ChangeDetectionStrategy, Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ExamLocalStore, ResultFilter } from './exam.localstore';
import { ExamQuestionComponent } from './components/exam-question/exam-question.component';
import { ExamSummaryComponent } from './components/exam-summary/exam-summary.component';
import { ExamResultComponent } from './components/exam-result/exam-result.component';
import { Dialog } from 'primeng/dialog';
import { Stepper, StepList, Step } from 'primeng/stepper';

@Component({
  imports: [
    RouterModule,
    Button,
    Tag,
    ProgressSpinner,
    TooltipModule,
    ExamQuestionComponent,
    ExamSummaryComponent,
    ExamResultComponent,
    Dialog,
    Stepper,
    StepList,
    Step
  ],
  providers: [ExamLocalStore],
  templateUrl: './exam.page.html',
  styleUrl: './exam.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly localstore = inject(ExamLocalStore);

  protected readonly rootViewModel = this.localstore.rootViewModel;
  protected readonly questionViewModel = this.localstore.questionViewModel;
  protected readonly summaryViewModel = this.localstore.summaryViewModel;
  protected readonly resultViewModel = this.localstore.resultViewModel;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.localstore.loadGame(id);
      }
    });
  }

  protected handleForceSummary(): void {
    this.localstore.forceSummary();
  }

  protected handleToggleDirection(): void {
    this.localstore.toggleDirection();
  }

  protected handleSubmit(): void {
    this.localstore.submitAnswer();
  }

  protected handleUpdateInput(value: string): void {
    this.localstore.updateInput(value);
  }

  protected handleSkip(): void {
    this.localstore.skip();
  }

  protected handleGoToItem(index: number): void {
    this.localstore.goToItem(index);
  }

  protected handleConfirm(): void {
    this.localstore.nextStep();
  }

  protected handleBack(): void {
    this.localstore.prevStep();
  }

  protected handleRestart(): void {
    this.localstore.restartGame();
  }

  protected handleSetFilter(filter: ResultFilter): void {
    this.localstore.setResultFilter(filter);
  }

  protected handleClose(): void {
    this.localstore.close();
  }
}
