import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MemoryLocalStore } from './memory.localstore';
import { MemoryGridComponent } from './components/memory-grid/memory-grid.component';
import { MemoryResultComponent } from './components/memory-result/memory-result.component';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';

@Component({
  imports: [
    RouterModule,
    Button,
    Card,
    Tag,
    ProgressSpinner,
    MemoryGridComponent,
    MemoryResultComponent
  ],
  providers: [MemoryLocalStore],
  templateUrl: './memory.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemoryPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly localstore = inject(MemoryLocalStore);

  protected readonly viewModel = this.localstore.viewModel;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.localstore.loadGame(id);
      }
    });
  }

  protected handleFlipCard(card: any): void {
    this.localstore.flipCard(card);
  }

  protected handleRestart(): void {
    this.localstore.restartGame();
  }
}
