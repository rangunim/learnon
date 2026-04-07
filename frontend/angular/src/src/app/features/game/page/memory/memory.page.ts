import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MemoryLocalStore, MemoryViewModel } from './memory.localstore';
import { MemoryGridComponent } from './components/memory-grid/memory-grid.component';
import { MemoryResultComponent } from './components/memory-result/memory-result.component';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-memory',
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
  protected readonly store = inject(MemoryLocalStore);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.store.loadGame(id);
      }
    });
  }

  protected handleFlipCard(card: any): void {
    this.store.flipCard(card);
  }

  protected handleRestart(): void {
    this.store.restartGame();
  }
}
