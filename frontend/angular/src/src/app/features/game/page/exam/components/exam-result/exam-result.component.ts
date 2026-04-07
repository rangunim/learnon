import { ChangeDetectionStrategy, Component, input, output, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ExamAnswer } from '../../exam.localstore';

export type ResultFilter = 'ALL' | 'CORRECT' | 'INCORRECT';

@Component({
    selector: 'app-exam-result',
    imports: [RouterModule, Button, Tag],
    templateUrl: './exam-result.component.html',
    styleUrl: './exam-result.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamResultComponent {
    readonly score = input.required<number>();
    readonly totalCount = input.required<number>();
    readonly chapterId = input.required<string>();
    readonly answers = input.required<ExamAnswer[]>();

    readonly restart = output<void>();

    protected readonly Math = Math;
    protected readonly activeFilter = signal<ResultFilter>('ALL');

    protected readonly filteredAnswers = computed((): ExamAnswer[] => {
        const filter = this.activeFilter();
        const all = this.answers();
        switch (filter) {
            case 'CORRECT':
                return all.filter(a => a.isCorrect);
            case 'INCORRECT':
                return all.filter(a => !a.isCorrect);
            default:
                return all;
        }
    });

    protected readonly correctCount = computed((): number =>
        this.answers().filter(a => a.isCorrect).length
    );

    protected readonly incorrectCount = computed((): number =>
        this.answers().filter(a => !a.isCorrect).length
    );

    protected readonly scoreText = computed((): string =>
        `${this.score()} / ${this.totalCount()}`
    );

    protected readonly percentText = computed((): string =>
        `${Math.round((this.score() / this.totalCount()) * 100)}%`
    );

    protected setFilter(filter: ResultFilter): void {
        this.activeFilter.set(filter);
    }

    protected handleRestart(): void {
        this.restart.emit();
    }
}
