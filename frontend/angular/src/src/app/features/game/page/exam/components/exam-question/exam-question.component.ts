import { ChangeDetectionStrategy, Component, input, output, ElementRef, viewChild, effect, untracked, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { QuestionViewModel } from '../../exam.localstore';

@Component({
    selector: 'app-exam-question',
    imports: [ReactiveFormsModule, Button, ProgressBar, TooltipModule],
    templateUrl: './exam-question.component.html',
    styleUrl: './exam-question.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamQuestionComponent {
    readonly viewModel = input.required<QuestionViewModel>();

    readonly submit = output<void>();
    readonly validate = output<string>();
    readonly skip = output<void>();
    readonly prev = output<void>();
    readonly next = output<void>();

    protected readonly answerCtrl = new FormControl('');
    private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

    constructor() {
        // Create signal from value changes without initial value (starts as undefined)
        const valInput = toSignal(this.answerCtrl.valueChanges);

        // Emit only when actual changes occur
        effect(() => {
            const val = valInput();
            if (val !== undefined) {
                untracked(() => {
                    this.validate.emit(val || '');
                });
            }
        });

        // Sync control value if changed from store or on initialization
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
            const word = this.viewModel().sourceWord;
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

    protected onPrev(): void {
        this.prev.emit();
    }

    protected onNext(): void {
        this.next.emit();
    }
}
