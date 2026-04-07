import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, ElementRef, viewChild, effect, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { ExamViewModel } from '../../exam.localstore';

@Component({
    selector: 'app-exam-question',
    imports: [ReactiveFormsModule, Button, ProgressBar],
    templateUrl: './exam-question.component.html',
    styleUrl: './exam-question.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamQuestionComponent {
    readonly viewModel = input.required<ExamViewModel>();

    readonly submit = output<void>();
    readonly validate = output<string>();
    readonly skip = output<void>();

    protected readonly answerCtrl = new FormControl('');
    private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.answerCtrl.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(val => {
            this.validate.emit(val || '');
        });

        // Sync control value if changed from store (e.g. word change)
        effect(() => {
            const val = this.viewModel().state.currentInput;
            untracked(() => {
                if (this.answerCtrl.value !== val) {
                    this.answerCtrl.setValue(val, { emitEvent: false });
                }
            });
        });

        // Focus input on new word or mount
        effect(() => {
            const word = this.viewModel().currentSourceWord;
            if (word) {
                untracked(() => {
                    setTimeout(() => this.inputEl()?.nativeElement.focus(), 300);
                });
            }
        });
    }

    protected onSubmit(): void {
        this.submit.emit();
    }

    protected onSkip(): void {
        this.skip.emit();
    }
}
