import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DictationLocalStore } from './dictation.localstore';
import { DictationPlayComponent } from './components/dictation-play/dictation-play.component';
import { DictationResultComponent } from './components/dictation-result/dictation-result.component';


@Component({
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
  private readonly localstore = inject(DictationLocalStore);

  protected readonly rootViewModel = this.localstore.rootViewModel;
  protected readonly playViewModel = this.localstore.playViewModel;
  protected readonly resultViewModel = this.localstore.resultViewModel;

  //constructor() {
  // Auto-play audio on new word
  //   const currentIndex = computed(() => this.playViewModel().state.currentIndex);
  //    const currentStep = computed(() => this.rootViewModel().state.currentStep);
  //  effect(() => {
  //     const index = currentIndex();
  //     const stepValue = currentStep();

  //     if (stepValue === 'PLAY' && index !== undefined) {
  //     untracked(() => this.localstore.playAudio());
  //    }
  // });
  // }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.localstore.handleLoadGame(id);
    }
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
