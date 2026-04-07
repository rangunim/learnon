import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Observable } from 'rxjs';
import { Chapter, WordPair } from './model/chapter.model';

@Injectable({
    providedIn: 'root'
})
export class ChapterFileService {
    /**
     * Parses words from CSV or Excel file.
     */
    public parseFile(file: File): Observable<WordPair[]> {
        return new Observable(subscriber => {
            const extension = file.name.split('.').pop()?.toLowerCase();

            if (extension === 'csv') {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        subscriber.next(this.mapToWordPairs(results.data as any[]));
                        subscriber.complete();
                    },
                    error: (err: any) => subscriber.error(err)
                });
            } else if (extension === 'xlsx' || extension === 'xls') {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    try {
                        const bstr = e.target.result;
                        const wb = XLSX.read(bstr, { type: 'binary' });
                        const wsname = wb.SheetNames[0];
                        const ws = wb.Sheets[wsname];
                        const data = XLSX.utils.sheet_to_json(ws);
                        subscriber.next(this.mapToWordPairs(data));
                        subscriber.complete();
                    } catch (err) {
                        subscriber.error(err);
                    }
                };
                reader.onerror = (err) => subscriber.error(err);
                reader.readAsBinaryString(file);
            } else {
                subscriber.error(new Error('Unsupported file format'));
            }
        });
    }

    /**
     * Exports a chapter's words to CSV or Excel.
     */
    public exportChapter(chapter: Chapter, format: 'csv' | 'xlsx'): void {
        const data = chapter.words.map(w => ({
            Polski: w.pl,
            Angielski: w.eng
        }));

        const fileName = `${chapter.name}_export`;

        if (format === 'csv') {
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            this.downloadFile(blob, `${fileName}.csv`);
        } else {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Słówka');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            this.downloadFile(blob, `${fileName}.xlsx`);
        }
    }

    private mapToWordPairs(data: any[]): WordPair[] {
        return data.map(item => {
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
