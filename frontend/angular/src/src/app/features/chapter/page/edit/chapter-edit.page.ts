import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChapterEditViewComponent } from './components/chapter-edit/chapter-edit-view.component';
import { ChapterEditLocalStore, ChapterEditViewModel } from './chapter-edit.localstore';

@Component({
    imports: [ChapterEditViewComponent],
    providers: [ChapterEditLocalStore],
    template: `
    <app-chapter-edit-view
      [viewModel]="viewModel()"
      (onSave)="handleSave()"
      (onAddWord)="handleAddWord()"
      (onRemoveWord)="handleRemoveWord($event)"
      (onCancel)="handleCancel()">
    </app-chapter-edit-view>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChapterEditPage implements OnInit {
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly localstore = inject(ChapterEditLocalStore);
    protected readonly viewModel: Signal<ChapterEditViewModel> = this.localstore.viewModel;

    public ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.localstore.loadChapter(id);
        }
    }

    protected handleCancel(): void {
        this.localstore.cancel();
    }

    protected handleAddWord(): void {
        this.localstore.addWord();
    }

    protected handleRemoveWord(index: number): void {
        this.localstore.removeWord(index);
    }

    protected handleSave(): void {
        this.localstore.updateChapter();
    }
}
