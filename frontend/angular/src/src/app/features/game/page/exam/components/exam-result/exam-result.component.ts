import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ResultViewModel, ResultFilter } from '../../exam.localstore';

@Component({
    selector: 'app-exam-result',
    imports: [RouterModule, Button, Tag],
    templateUrl: './exam-result.component.html',
    styleUrl: './exam-result.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamResultComponent {
    readonly viewModel = input.required<ResultViewModel>();

    readonly restart = output<void>();
    readonly setFilter = output<ResultFilter>();

    protected handleSetFilterEvent(filter: ResultFilter): void {
        this.setFilter.emit(filter);
    }

    protected handleRestart(): void {
        this.restart.emit();
    }
}
