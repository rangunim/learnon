import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-memory-result',
  standalone: true,
  imports: [RouterModule, Button, Tag],
  templateUrl: './memory-result.component.html',
  styleUrl: './memory-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemoryResultComponent {
  readonly movesCount = input.required<number>();
  readonly chapterId = input.required<string>();

  readonly restart = output<void>();

  protected onRestart(): void {
    this.restart.emit();
  }
}
