import { Injectable, inject, signal, computed } from '@angular/core';
import { ChapterUpdateRequest } from '../../model/chapter.dto';
import { Chapter } from '../../model/chapter.model';
import { Router } from '@angular/router';
import { ChapterStore } from '../../chapter.store';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';


export interface ChapterEditFormData {
    name: string;
    description: string;
    lang1: string;
    lang2: string;
    words: { pl: string; eng: string }[];
}

export interface ChapterEditState {
    chapterId: string | null;
    initialData: Chapter | null;
    isLoading: boolean;
    isSaving: boolean;
}

export interface ChapterEditViewModel {
    state: ChapterEditState;
    form: FormGroup;
    isValid: boolean;
    canSubmit: boolean;
    submitLabel: string;
}

@Injectable()
export class ChapterEditLocalStore {
    private readonly chapterStore = inject(ChapterStore);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    private readonly _form: FormGroup = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        lang1: ['', Validators.required],
        lang2: ['', Validators.required],
        isPublic: [false],
        words: this.fb.array([])
    });

    private readonly _formChanges = toSignal(
        this._form.valueChanges,
        { initialValue: this._form.value }
    );

    private readonly _state = signal<ChapterEditState>({
        chapterId: null,
        initialData: null,
        isLoading: false,
        isSaving: false
    });

    public readonly viewModel = computed<ChapterEditViewModel>(() => {
        const s = this._state();
        this._formChanges();

        return {
            state: s,
            form: this._form,
            isValid: this._form.valid,
            canSubmit: this._form.valid && !s.isSaving,
            submitLabel: s.isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'
        };
    });

    public loadChapter(id: string): void {
        const globalCache = this.chapterStore.state().chapters.find((c: Chapter) => c.id === id);

        this._state.update(s => ({
            ...s,
            isLoading: !globalCache,
            chapterId: id,
            initialData: globalCache || null
        }));

        this.chapterStore.loadChapter(id).subscribe({
            next: (chapter: Chapter) => {
                this.patchFormWithData(chapter);
                this._state.update(s => ({ ...s, initialData: chapter, isLoading: false }));
            },
            error: (err: unknown) => {
                console.error('Failed to load chapter for edit:', err);
                this._state.update(s => ({ ...s, isLoading: false, chapterId: null }));
                this.router.navigate(['/chapters']);
            }
        });
    }

    public updateChapter(): void {
        const id = this._state().chapterId;
        if (!id || this._form.invalid) return;

        const chapterData = this._form.getRawValue() as ChapterEditFormData;

        this._state.update(s => ({ ...s, isSaving: true }));

        this.chapterStore.updateChapter(id, chapterData as ChapterUpdateRequest).subscribe({
            next: () => {
                this._state.update(s => ({ ...s, isSaving: false }));
                this.router.navigate(['/chapters', id]);
            },
            error: (err: unknown) => {
                console.error('Error updating chapter:', err);
                this._state.update(s => ({ ...s, isSaving: false }));;
            }
        });
    }

    public cancel(): void {
        const id = this._state().chapterId;
        if (id) {
            this.router.navigate(['/chapters', id]);
        } else {
            this.router.navigate(['/chapters']);
        }
    }

    private patchFormWithData(data: Chapter): void {
        this._form.patchValue({
            name: data.name,
            description: data.description,
            lang1: data.lang1 || 'Polski',
            lang2: data.lang2 || 'Angielski',
            isPublic: data.isPublic || false
        });

        this.words.clear();

        data.words.forEach((w: { pl: string; eng: string }) => {
            this.words.push(this.fb.group({
                pl: [w.pl, Validators.required],
                eng: [w.eng, Validators.required]
            }));
        });
    }

    public get words(): FormArray {
        return this._form.get('words') as FormArray;
    }

    public addWord(): void {
        this.words.push(this.fb.group({
            pl: ['', Validators.required],
            eng: ['', Validators.required]
        }));
    }

    public removeWord(index: number): void {
        this.words.removeAt(index);
    }
}
