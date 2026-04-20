import { Injectable } from '@angular/core';
import { csvParse, csvFormat } from 'd3-dsv';
import readXlsxFile from 'read-excel-file/browser';
import writeXlsxFile from 'write-excel-file/browser';
import { Observable, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Chapter, WordPair } from './model/chapter.model';

@Injectable({
    providedIn: 'root'
})
export class ChapterFileService {
    public parseFile(file: File): Observable<WordPair[]> {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'csv') {
            return from(file.text()).pipe(
                map(text => {
                    const data = csvParse(text);
                    return this.mapToWordPairs(data);
                })
            );
        } else if (extension === 'xlsx' || extension === 'xls') {
            return from(readXlsxFile(file)).pipe(
                map((sheets: any) => {
                    const rows = sheets;
                    // Detect if rows is Sheet[] (array of objects with 'data' property) or Row[] (array of arrays)
                    let actualRows: any[][] = [];
                    if (Array.isArray(rows)) {
                        if (Array.isArray(rows[0])) {
                            actualRows = rows;
                        } else if (rows[0] && Array.isArray(rows[0].data)) {
                            actualRows = rows[0].data;
                        }
                    }

                    if (actualRows.length === 0 || !Array.isArray(actualRows[0])) {
                        return [];
                    }

                    const headers = actualRows[0].map((h: any) => String(h || ''));
                    const data = actualRows.slice(1).map((row: any) => {
                        const item: Record<string, string> = {};
                        if (Array.isArray(row)) {
                            row.forEach((cell: any, index: number) => {
                                const header = headers[index];
                                if (header) {
                                    item[header] = String(cell || '');
                                }
                            });
                        }
                        return item;
                    });
                    return this.mapToWordPairs(data);
                })
            );
        } else {
            return throwError(() => new Error('Unsupported file format'));
        }
    }

    public exportChapter(chapter: Chapter, format: 'csv' | 'xlsx'): Observable<void> {
        const data = chapter.words.map(w => ({
            Polski: w.pl,
            Angielski: w.eng
        }));

        const fileName = `${chapter.name}_export`;

        if (format === 'csv') {
            return new Observable(subscriber => {
                try {
                    const csv = csvFormat(data);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    this.downloadFile(blob, `${fileName}.csv`);
                    subscriber.next();
                    subscriber.complete();
                } catch (err) {
                    subscriber.error(err);
                }
            });
        } else {
            const excelData: any = [
                // Header row
                [
                    { value: 'Polski', fontWeight: 'bold' },
                    { value: 'Angielski', fontWeight: 'bold' }
                ],
                // Data rows
                ...data.map(item => [
                    { value: item.Polski },
                    { value: item.Angielski }
                ])
            ];

            return from(writeXlsxFile(excelData, { fileName: `${fileName}.xlsx` })).pipe(
                map(() => {
                    // writeXlsxFile in browser triggers download automatically if fileName is provided
                    // and returns a Promise<void>
                })
            );
        }
    }

    private mapToWordPairs(data: Record<string, string>[] | ArrayLike<Record<string, string>>): WordPair[] {
        return Array.from(data).map(item => {
            // Try to match columns based on headers or positions
            const keys = Object.keys(item);
            const plKey = keys.find(k => k.toLowerCase().includes('pl') || k.toLowerCase().includes('pol')) || keys[0];
            const engKey = keys.find(k => k.toLowerCase().includes('eng') || k.toLowerCase().includes('en')) || keys[1];

            return {
                pl: String(item[plKey] || '').trim(),
                eng: String(item[engKey] || '').trim()
            };
        }).filter(w => w.pl || w.eng);
    }

    private downloadFile(blob: Blob, fileName: string): void {
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
