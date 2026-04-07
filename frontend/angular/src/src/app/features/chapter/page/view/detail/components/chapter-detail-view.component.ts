import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { Chapter } from '../../../../model/chapter.model';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ChapterDetailViewModel } from '../chapter-detail.localstore';


@Component({
  selector: 'app-chapter-detail-view',
  imports: [RouterModule, Button, Card, ProgressSpinner, Tag, TooltipModule],
  templateUrl: './chapter-detail-view.component.html',
  styleUrl: './chapter-detail-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChapterDetailViewComponent {
  readonly viewModel = input.required<ChapterDetailViewModel>();

  readonly onDelete = output<string>();
  readonly onExport = output<{ chapter: Chapter, format: 'csv' | 'xlsx' }>();
  readonly onShare = output<Chapter>();

  protected onShareClick(): void {
    const chapter = this.viewModel().state.chapter;
    if (chapter) {
      this.onShare.emit(chapter);
    }
  }

  protected onExportClick(): void {
    const chapter = this.viewModel().state.chapter;
    if (chapter) {
      this.onExport.emit({ chapter, format: 'xlsx' });
    }
  }

  protected onDeleteClick(): void {
    const id = this.viewModel().state.chapter?.id;
    if (id) {
      this.onDelete.emit(id);
    }
  }
}
