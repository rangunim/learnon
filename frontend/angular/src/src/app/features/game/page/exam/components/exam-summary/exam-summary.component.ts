import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { TranslationDirection } from '../../exam.localstore';
import { WordPair } from '../../../../../chapter/model/chapter.model';

@Component({
    selector: 'app-exam-summary',
    imports: [Button],
    templateUrl: './exam-summary.component.html',
    styleUrl: './exam-summary.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamSummaryComponent {
    readonly cards = input.required<WordPair[]>();
    readonly direction = input.required<TranslationDirection>();

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
        return this.direction() === 'toLang2' ? card.pl : card.eng;
    }
}
