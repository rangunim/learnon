import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ResultViewModel } from '../../quiz.localstore';

@Component({
    selector: 'app-quiz-result',
    imports: [RouterModule, FormsModule, Button, SelectButtonModule],
    templateUrl: './quiz-result.component.html',
    styleUrl: './quiz-result.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizResultComponent {
    readonly viewModel = input.required<ResultViewModel>();

    readonly onRestart = output<void>();
    readonly onFilterChange = output<'all' | 'correct' | 'wrong'>();

    protected readonly filterOptions = [
        { label: 'Wszystkie', value: 'all' },
        { label: 'Poprawne', value: 'correct' },
        { label: 'Błędne', value: 'wrong' }
    ];

    protected handleRestart(): void {
        this.onRestart.emit();
    }

    protected handleFilterChange(filter: 'all' | 'correct' | 'wrong'): void {
        this.onFilterChange.emit(filter);
    }
}
