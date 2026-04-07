import { Route, Routes } from '@angular/router';
import { MemoryPage } from './memory/memory.page';
import { ExamPage } from './exam/exam.page';
import { ListenRepeatPage } from './listen-repeat/listen-repeat.page';
import { DictationPage } from './dictation/dictation.page';
import { QuizPage } from './quiz/quiz.page';

export const GAME_ROUTES: Routes = [
    <Route>{
        path: 'memory',
        component: MemoryPage,
    },
    <Route>{
        path: 'exam',
        component: ExamPage
    },
    <Route>{
        path: 'listen-repeat',
        component: ListenRepeatPage
    },
    <Route>{
        path: 'dictation',
        component: DictationPage
    },
    <Route>{
        path: 'quiz',
        component: QuizPage
    }
];
