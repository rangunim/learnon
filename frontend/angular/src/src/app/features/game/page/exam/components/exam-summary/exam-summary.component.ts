import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { SummaryViewModel } from '../../exam.localstore';
import { WordPair } from '../../../../../chapter/model/chapter.model';

@Component({
    selector: 'app-exam-summary',
    imports: [Button],
    templateUrl: './exam-summary.component.html',
    styleUrl: './exam-summary.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamSummaryComponent {
    readonly viewModel = input.required<SummaryViewModel>();

    readonly editItem = output<number>();
    readonly confirm = output<void>();
    readonly back = output<void>();

    protected handleEdit(index: number): void {
        this.editItem.emit(index);
    }

    protected handleConfirm(): void {
        this.confirm.emit();
    }

    protected handleBack(): void {
        this.back.emit();
    }

    protected sourceWord(card: WordPair): string {
        return this.viewModel().direction === 'toLang2' ? card.pl : card.eng;
    }
}
