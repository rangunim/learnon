import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chapter } from '../../../model/chapter.model';
import { ChapterDetailViewComponent } from './components/chapter-detail-view.component';
import { ChapterDetailLocalStore } from './chapter-detail.localstore';

@Component({
  selector: 'app-chapter-detail',
  imports: [ChapterDetailViewComponent],
  providers: [ChapterDetailLocalStore],
  template: `
    <app-chapter-detail-view
      [viewModel]="viewModel()"
      (onDelete)="onDeleteChapter($event)"
      (onExport)="onExportChapter($event)"
      (onShare)="onShareChapter($event)">
    </app-chapter-detail-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChapterDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly localstore = inject(ChapterDetailLocalStore);

  protected readonly viewModel = this.localstore.viewModel;

  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.localstore.loadChapter(id);
      }
    });
  }

  protected onDeleteChapter(id: string): void {
    this.localstore.deleteChapter(id);
  }

  protected onExportChapter(event: { chapter: Chapter, format: 'csv' | 'xlsx' }): void {
    this.localstore.exportChapter(event.chapter, event.format);
  }

  protected onShareChapter(chapter: Chapter): void {
    this.localstore.shareChapter(chapter);
  }
}

