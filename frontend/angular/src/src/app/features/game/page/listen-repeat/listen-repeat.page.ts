import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ListenRepeatLocalStore } from './listen-repeat.localstore';
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
  private readonly localstore = inject(ListenRepeatLocalStore);

  protected readonly rootViewModel = this.localstore.rootViewModel;
  protected readonly playViewModel = this.localstore.playViewModel;

  /* computed(() => {
     const playVm = this.localstore.playViewModel();
     const isListening = this.speechService.isListening();
     return {
       ...playVm,
       isListening
     };
   });*/

  protected readonly resultViewModel = this.localstore.resultViewModel;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.localstore.handleLoadGame(id);
    }
  }

  protected handleEnter(): void {
    const root = this.rootViewModel();
    const play = this.playViewModel();
    if (root.state.currentStep === 'RESULTS') return;

    if (play.state.isCorrect === true) {
      this.handleNextWord();
    } else if (!play.isListening) {
      this.handleStartListening();
    }
  }


  protected handleToggleMode(): void {
    this.localstore.toggleMode();
  }

  protected handleNextWord(): void {
    this.localstore.nextWord();
  }

  protected handleToggleAutoListen(): void {
    this.localstore.toggleAutoListen();
  }

  protected handleToggleWord(): void {
    this.localstore.toggleWord();
  }

  protected handlePlayAudio(): void {
    this.localstore.playAudio();
  }

  protected handleStartListening(): void {
    this.localstore.startListening();
  }

  protected handleRestart(): void {
    this.localstore.resetGame();
  }
}
