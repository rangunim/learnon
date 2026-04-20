import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chapter } from '../../../model/chapter.model';
import { ChapterDetailViewComponent } from './components/chapter-detail-view.component';
import { ChapterDetailLocalStore, ChapterDetailViewModel } from './chapter-detail.localstore';

@Component({
  imports: [ChapterDetailViewComponent],
  providers: [ChapterDetailLocalStore],
  template: `
    <app-chapter-detail-view
      [viewModel]="viewModel()"
      (onDelete)="handleDeleteChapter($event)"
      (onExport)="handleExportChapter($event)"
      (onShare)="handleShareChapter($event)">
    </app-chapter-detail-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChapterDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly localstore = inject(ChapterDetailLocalStore);

  protected readonly viewModel: Signal<ChapterDetailViewModel> = this.localstore.viewModel;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.localstore.loadChapter(id);
    }
  }

  protected handleDeleteChapter(id: string): void {
    this.localstore.deleteChapter(id);
  }

  protected handleExportChapter(event: { chapter: Chapter, format: 'csv' | 'xlsx' }): void {
    this.localstore.exportChapter(event.chapter, event.format);
  }

  protected handleShareChapter(chapter: Chapter): void {
    this.localstore.shareChapter(chapter);
  }
}

