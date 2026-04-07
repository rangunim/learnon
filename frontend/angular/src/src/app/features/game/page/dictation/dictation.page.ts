import { ChangeDetectionStrategy, Component, inject, OnInit, effect, untracked, DestroyRef, computed } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DictationLocalStore } from './dictation.localstore';
import { DictationPlayComponent } from './components/dictation-play/dictation-play.component';
import { DictationResultComponent } from './components/dictation-result/dictation-result.component';


@Component({
  selector: 'app-dictation',
  imports: [
    RouterModule,
    Button,
    Card,
    Tag,
    ProgressSpinner,
    TooltipModule,
    DictationPlayComponent,
    DictationResultComponent
  ],
  providers: [DictationLocalStore],
  templateUrl: './dictation.page.html',
  styleUrl: './dictation.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DictationPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly localstore = inject(DictationLocalStore);

  constructor() {
    // Auto-play audio on new word
    const currentIndex = computed(() => this.localstore.viewModel().state.currentIndex);
    const currentStep = computed(() => this.localstore.viewModel().state.currentStep);

    effect(() => {
      const index = currentIndex();
      const step = currentStep();

      if (step === 'PLAY') {
        untracked(() => this.localstore.playAudio());
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.localstore.handleLoadGame(id);
      }
    });
  }

  protected handleInputChange(val: string): void {
    this.localstore.validateInput(val);
  }

  protected handleEnter(): void {
    this.localstore.nextStep();
  }

  protected toggleHighlight(): void {
    this.localstore.toggleHighlight();
  }

  protected toggleMode(): void {
    this.localstore.toggleMode();
  }

  protected prevStep(): void {
    this.localstore.prevStep();
  }

  protected nextStep(): void {
    this.localstore.nextStep();
  }

  protected nextWord(): void {
    this.localstore.nextWord();
  }

  protected toggleTranslation(): void {
    this.localstore.toggleTranslation();
  }

  protected giveUp(): void {
    this.localstore.giveUp();
  }

  protected playAudio(): void {
    this.localstore.playAudio();
  }

  protected restart(): void {
    this.localstore.resetGame();
  }
}
