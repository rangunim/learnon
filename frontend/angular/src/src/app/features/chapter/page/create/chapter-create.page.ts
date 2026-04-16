import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { ChapterCreateViewComponent } from './components/chapter-create-view/chapter-create-view.component';
import { ChapterCreateLocalStore, ChapterCreateViewModel } from './chapter-create.localstore';

@Component({
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
export class ChapterCreatePage implements OnInit {
  private readonly localstore = inject(ChapterCreateLocalStore);
  protected readonly viewModel: Signal<ChapterCreateViewModel> = this.localstore.viewModel;

  public ngOnInit(): void {
    this.localstore.addWord();
    this.localstore.addWord();
  }

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
