import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ChapterCreateViewComponent } from './components/chapter-create-view/chapter-create-view.component';
import { ChapterCreateLocalStore, ChapterCreateViewModel } from './chapter-create.localstore';

@Component({
  selector: 'app-chapter-create',
  imports: [ChapterCreateViewComponent],
  providers: [ChapterCreateLocalStore],
  template: `
    <app-chapter-create-view
      [viewModel]="viewModel()"
      (onSave)="handleSave()"
      (onAddWord)="handleAddWord()"
      (onRemoveWord)="handleRemoveWord($event)"
      (onCancel)="handleCancel()">
    </app-chapter-create-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChapterCreatePage {
  private readonly localstore = inject(ChapterCreateLocalStore);
  protected readonly viewModel: Signal<ChapterCreateViewModel> = this.localstore.viewModel;

  protected handleAddWord(): void {
    this.localstore.addWord();
  }

  protected handleRemoveWord(index: number): void {
    this.localstore.removeWord(index);
  }

  protected handleCancel(): void {
    this.localstore.cancel();
  }

  protected handleSave(): void {
    this.localstore.saveChapter();
  }
}
