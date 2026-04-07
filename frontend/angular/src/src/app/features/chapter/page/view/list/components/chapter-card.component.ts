import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Chapter } from '../../../../model/chapter.model';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-chapter-card',
  imports: [RouterModule, Button, Tag, TooltipModule],
  templateUrl: './chapter-card.component.html',
  styleUrl: './chapter-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChapterCardComponent {
  readonly viewModel = input.required<Chapter>();

  readonly onExport = output<'xlsx' | 'csv'>();
  readonly onShare = output<void>();

  protected handleExport(event: Event): void {
    event.stopPropagation();
    this.onExport.emit('xlsx');
  }

  protected handleShare(event: Event): void {
    event.stopPropagation();
    this.onShare.emit();
  }

}
