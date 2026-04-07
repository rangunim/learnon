import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ExamLocalStore, ExamViewModel } from './exam.localstore';
import { ExamQuestionComponent } from './components/exam-question/exam-question.component';
import { ExamSummaryComponent } from './components/exam-summary/exam-summary.component';
import { ExamResultComponent } from './components/exam-result/exam-result.component';
import { Dialog } from 'primeng/dialog';
import { Stepper, StepList, Step } from 'primeng/stepper';
import { Router } from '@angular/router';


@Component({
  selector: 'app-exam',
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
  private readonly router = inject(Router);

  private readonly localstore = inject(ExamLocalStore);
  protected readonly viewModel: Signal<ExamViewModel> = this.localstore.viewModel;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
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

  protected handleClose(): void {
    const chapterId = this.localstore.viewModel().state.chapterId;
    if (chapterId) {
      this.router.navigate(['/chapters', chapterId]);
    } else {
      this.router.navigate(['/chapters']);
    }
  }
}
