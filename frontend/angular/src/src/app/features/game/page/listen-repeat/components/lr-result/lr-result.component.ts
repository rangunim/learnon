import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-lr-result',
  imports: [RouterModule, Button, Tag],
  templateUrl: './lr-result.component.html',
  styleUrl: './lr-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LrResultComponent {
  readonly totalCount = input.required<number>();
  readonly chapterId = input.required<string>();

  readonly restart = output<void>();

  protected onRestart(): void {
    this.restart.emit();
  }
}
