import * as fs from 'fs';
import * as path from 'path';
import { TranslationParser } from '../parser';
import { I18nConfig, TranslationKey, TranslationFile } from '../types';

export class TranslationManager {
    private parser: TranslationParser;
    private config: I18nConfig;

    constructor(config: I18nConfig) {
        this.config = config;
        this.parser = new TranslationParser(config);
    }

    async extractAndUpdate(): Promise<void> {
        const translations = await this.parser.extractTranslations();
        console.log('\nExtracted translations in manager:', translations);
        await this.updateTranslationFiles(translations);
    }

    private async updateTranslationFiles(translations: TranslationKey[]): Promise<void> {
        console.log('\nUpdating translation files with:', translations);

        if (!fs.existsSync(this.config.localesDir)) {
            fs.mkdirSync(this.config.localesDir, { recursive: true });
        }

        for (const locale of this.config.supportedLocales) {
            const filePath = path.join(this.config.localesDir, `${locale}.json`);
            console.log(`\nProcessing locale file: ${filePath}`);
            let translationsMap: TranslationFile = {};

            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    translationsMap = content ? JSON.parse(content) : {};
                    console.log('Existing translations:', translationsMap);
                } catch (error) {
                    console.warn(`Warning: Failed to parse ${filePath}`);
                }
            }

            for (const trans of translations) {
                const key = this.getTranslationKey(trans);
                console.log(`\nProcessing key: ${key}`);
                if (locale === this.config.defaultLocale) {
                    translationsMap[key] = trans.defaultValue;
                } else if (!translationsMap[key]) {
                    translationsMap[key] = '';
                }
            }

            console.log('\nWriting translations:', translationsMap);
            fs.writeFileSync(filePath, JSON.stringify(translationsMap, null, 2));
        }
    }

    private createUpdatedTranslations(newTranslations: TranslationKey[], existingTranslations: TranslationFile, locale: string): TranslationFile {
        const translations: TranslationFile = {};

        for (const trans of newTranslations) {
            const key = this.getTranslationKey(trans);
            if (locale === this.config.defaultLocale) {
                if (!existingTranslations[key] || existingTranslations[key] !== trans.defaultValue) {
                    translations[key] = trans.defaultValue;
                } else {
                    translations[key] = existingTranslations[key];
                }
            } else {
                if (!existingTranslations[key]) {
                    translations[key] = '';
                } else {
                    translations[key] = existingTranslations[key];
                }
            }
        }

        // 기존 번역 중 여전히 사용되는 것들 유지
        Object.entries(existingTranslations).forEach(([key, value]) => {
            if (!translations[key]) {
                translations[key] = value;
            }
        });

        return translations;
    }

    private getTranslationKey(translation: TranslationKey): string {
        const namespace = translation.namespace || this.config.namespace;
        return namespace ? `${namespace}.${translation.key}` : translation.key;
    }

    private convertToNestedFormat(translations: TranslationFile): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(translations)) {
            const parts = key.split('.');
            let current = result;

            // 마지막 부분을 제외한 모든 부분을 순회하며 중첩 객체 생성
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                current[part] = current[part] || {};
                current = current[part];
            }

            // 마지막 부분에 값 할당
            current[parts[parts.length - 1]] = value;
        }

        return result;
    }

    private async backupTranslationFiles(): Promise<void> {
        if (!this.config.backupPath) return;

        const backupDir = this.config.backupPath;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        fs.mkdirSync(backupDir, { recursive: true });

        for (const locale of this.config.supportedLocales) {
            const sourcePath = path.join(this.config.localesDir, `${locale}.json`);
            if (fs.existsSync(sourcePath)) {
                const backupPath = path.join(backupDir, `${locale}_${timestamp}.json`);
                fs.copyFileSync(sourcePath, backupPath);
            }
        }
    }
}
