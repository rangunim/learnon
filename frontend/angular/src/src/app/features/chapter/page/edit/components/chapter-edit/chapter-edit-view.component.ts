import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Card } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { AutoComplete } from 'primeng/autocomplete';
import { ALL_LANGUAGES } from '../../../../model/languages';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ChapterEditViewModel } from '../../chapter-edit.localstore';

@Component({
  selector: 'app-chapter-edit-view',
  imports: [ReactiveFormsModule, Button, InputText, Textarea, Card, ProgressSpinner, AutoComplete, ToggleSwitch],
  templateUrl: './chapter-edit-view.component.html',
  styleUrl: './chapter-edit-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChapterEditViewComponent {
  readonly viewModel = input.required<ChapterEditViewModel>();

  readonly onSave = output<void>();
  readonly onCancel = output<void>();
  readonly onAddWord = output<void>();
  readonly onRemoveWord = output<number>();

  protected readonly languages: string[] = ALL_LANGUAGES;
  protected filteredLanguages: string[] = [];

  protected get words(): FormArray {
    return this.viewModel().form.get('words') as FormArray;
  }

  protected addWord(): void {
    this.onAddWord.emit();
  }

  protected removeWord(index: number): void {
    this.onRemoveWord.emit(index);
  }

  protected submit(): void {
    this.onSave.emit();
  }

  protected filterLanguages(event: any): void {
    const query: string = event.query;
    const lowerQuery: string = query.toLowerCase().trim();

    if (!lowerQuery) {
      this.filteredLanguages = [...this.languages];
      return;
    }

    const matches: string[] = this.languages.filter(lang => lang.toLowerCase().includes(lowerQuery));
    const exactMatchExists: boolean = this.languages.some(lang => lang.toLowerCase() === lowerQuery);

    if (!exactMatchExists && query) {
      // Show the typed query as the first option to indicate it's a new entry
      this.filteredLanguages = [query, ...matches];
    } else {
      this.filteredLanguages = matches;
    }
  }
}
