import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, effect, computed, untracked, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ListenRepeatLocalStore, ListenRepeatViewModel } from './listen-repeat.localstore';
import { SpeechService } from '../../../../core/services/speech.service';
import { LrPlayComponent } from './components/lr-play/lr-play.component';
import { LrResultComponent } from './components/lr-result/lr-result.component';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';


@Component({
  imports: [
    RouterModule,
    Button,
    Card,
    Tag,
    ProgressSpinner,
    TooltipModule,
    LrPlayComponent,
    LrResultComponent
  ],
  providers: [ListenRepeatLocalStore],
  templateUrl: './listen-repeat.page.html',
  styleUrl: './listen-repeat.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListenRepeatPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(ListenRepeatLocalStore);
  private readonly speechService = inject(SpeechService);

  readonly viewModel = computed<ListenRepeatViewModel>(() => {
    const baseVm = this.store.viewModel();
    const isListening = this.speechService.isListening();

    if (baseVm.play) {
      return {
        ...baseVm,
        play: {
          ...baseVm.play,
          isListening
        }
      };
    }
    return baseVm;
  });

  constructor() {
    const wordId = computed(() => this.viewModel().play?.currentWord?.id);
    const isFinished = computed(() => this.viewModel().currentStep === 'RESULTS');
    const isCorrect = computed(() => this.viewModel().play?.isCorrect ?? null);

    effect((onCleanup) => {
      const id = wordId();
      const vm = this.viewModel();

      if (!id || vm.currentStep !== 'PLAY' || isFinished() || isCorrect() !== null || !vm.play) return;

      this.store.playAudio();

      if (vm.play.autoListen) {
        const timer = setTimeout(() => {
          untracked(() => {
            const currentVm = this.viewModel();
            if (currentVm.play?.isCorrect === null && !this.speechService.isListening()) {
              this.store.startListening();
            }
          });
        }, 1500);
        onCleanup(() => clearTimeout(timer));
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.store.handleLoadGame(id);
      }
    });
  }

  protected handleEnter(): void {
    const vm = this.viewModel();
    if (vm.currentStep === 'RESULTS') return;

    if (vm.play?.isCorrect === true) {
      this.nextWord();
    } else if (!vm.play?.isListening) {
      this.startListening();
    }
  }

  protected toggleMode(): void {
    this.store.toggleMode();
  }

  protected nextWord(): void {
    this.store.nextWord();
  }

  protected toggleAutoListen(): void {
    this.store.toggleAutoListen();
  }

  protected toggleWord(): void {
    this.store.toggleWord();
  }

  protected playAudio(): void {
    this.store.playAudio();
  }

  protected startListening(): void {
    this.store.startListening();
  }

  protected restart(): void {
    this.store.resetGame();
  }
}
