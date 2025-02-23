import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { I18nConfig, TranslationFile } from '../types';

export class KeyManager {
    constructor(private config: I18nConfig) {}

    async findDuplicateKeys(): Promise<Map<string, string[]>> {
        const duplicates = new Map<string, string[]>();
        const keyLocations = new Map<string, string[]>();

        const files = glob.sync(path.join(this.config.sourceDir, '**/*.{tsx,jsx,ts,js}'));

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const matches = content.matchAll(/i18n\.t\(['"]([^'"]+)['"]\)/g);

            for (const match of matches) {
                const key = match[1];
                const locations = keyLocations.get(key) || [];
                locations.push(`${file}:${this.getLineNumber(content, match.index!)}`);
                keyLocations.set(key, locations);

                if (locations.length > 1) {
                    duplicates.set(key, locations);
                }
            }
        }

        return duplicates;
    }

    async findUnusedKeys(): Promise<string[]> {
        const usedKeys = new Set<string>();
        const definedKeys = this.getDefinedKeys();

        // 소스 코드에서 사용된 키 수집
        const files = glob.sync(path.join(this.config.sourceDir, '**/*.{tsx,jsx,ts,js}'));
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const matches = content.matchAll(/i18n\.t\(['"]([^'"]+)['"]\)/g);
            for (const match of matches) {
                usedKeys.add(match[1]);
            }
        }

        // 사용되지 않는 키 찾기
        return definedKeys.filter((key) => !usedKeys.has(key));
    }

    private getDefinedKeys(): string[] {
        const keys: string[] = [];
        const localeFile = path.join(this.config.localesDir, `${this.config.defaultLocale}.json`);

        if (fs.existsSync(localeFile)) {
            try {
                const content = fs.readFileSync(localeFile, 'utf-8');
                const translations: TranslationFile = JSON.parse(content);
                keys.push(...Object.keys(translations));
            } catch (error) {
                console.error(`Error reading translation file: ${error}`);
                return [];
            }
        }

        return keys;
    }

    private getLineNumber(content: string, index: number): number {
        return content.slice(0, index).split('\n').length;
    }
}
