import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { QuizItem } from '../../quiz.localstore';

@Component({
    selector: 'app-quiz-result',
    imports: [RouterModule, FormsModule, Button, SelectButtonModule],
    templateUrl: './quiz-result.component.html',
    styleUrl: './quiz-result.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizResultComponent {
    readonly score = input.required<number>();
    readonly totalCount = input.required<number>();
    readonly chapterId = input.required<string>();
    readonly filteredItems = input.required<QuizItem[]>();
    readonly currentFilter = input.required<'all' | 'correct' | 'wrong'>();

    readonly onRestart = output<void>();
    readonly onFilterChange = output<'all' | 'correct' | 'wrong'>();

    protected readonly filterOptions = [
        { label: 'Wszystkie', value: 'all' },
        { label: 'Poprawne', value: 'correct' },
        { label: 'Błędne', value: 'wrong' }
    ];
}
