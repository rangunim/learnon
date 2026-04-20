import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ChaptersListLocalStore } from './chapters-list.localstore';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ChapterCardComponent } from './components/chapter-card.component';
import { Chapter } from '../../../model/chapter.model';

@Component({
  imports: [RouterModule, ChapterCardComponent, Button, ProgressSpinner, InputText],
  providers: [ChaptersListLocalStore],
  templateUrl: './chapters-list.page.html',
  styleUrl: './chapters-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChaptersListPage implements OnInit {
  private readonly localstore = inject(ChaptersListLocalStore);
  protected readonly viewModel = this.localstore.viewModel;

  ngOnInit() {
    this.localstore.loadChapters();
  }

  protected updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.localstore.updateSearch(input.value);
  }

  protected onExportChapter(chapter: Chapter, format: 'csv' | 'xlsx'): void {
    this.localstore.onExport(chapter, format);
  }

  protected onShareChapter(chapter: Chapter): void {
    this.localstore.shareChapter(chapter);
  }

  protected onClearSearch(): void {
    this.localstore.clearSearch();
  }

  protected onTriggerImport(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.localstore.importFile(input.files[0]);
      input.value = ''; // Reset for next selection
    }
  }

}
