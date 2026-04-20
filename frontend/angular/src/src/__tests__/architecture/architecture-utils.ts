import * as fs from 'fs';
import * as path from 'path';

export function getFilesRecursive(dir: string, extension: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach((file: string) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results.push(...getFilesRecursive(filePath, extension));
        } else if (file.endsWith(extension)) {
            results.push(filePath);
        }
    });
    return results;
}