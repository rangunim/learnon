import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild, ElementRef, effect } from '@angular/core';
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
  private readonly localstore = inject(ExamLocalStore);

  protected readonly rootViewModel = this.localstore.rootViewModel;
  protected readonly questionViewModel = this.localstore.questionViewModel;
  protected readonly summaryViewModel = this.localstore.summaryViewModel;
  protected readonly resultViewModel = this.localstore.resultViewModel;

  private readonly scrollAnchor = viewChild<ElementRef<HTMLElement>>('scrollAnchor');

  constructor() {
    effect(() => {
      // Trigger scroll on step change
      this.rootViewModel().state.currentStep;
      // Trigger scroll on question change
      this.questionViewModel().state.currentIndex;

      this.scrollToTop();
    });
  }

  private scrollToTop(): void {
    const el = this.scrollAnchor()?.nativeElement;
    if (el) {
      // Find the scrollable p-dialog-content
      const dialogContent = el.closest('.p-dialog-content');
      if (dialogContent) {
        dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.localstore.loadGame(id);
    }
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

  protected handleNext(): void {
    this.localstore.nextQuestion();
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
