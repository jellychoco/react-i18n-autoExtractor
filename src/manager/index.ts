import { TranslationParser } from '../parser';
import { I18nConfig, TranslationKey, TranslationFile } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class TranslationManager {
    private parser: TranslationParser;
    private config: I18nConfig;

    constructor(config: I18nConfig) {
        this.config = config;
        this.parser = new TranslationParser(config);
    }

    async extractAndUpdate(): Promise<void> {
        const translations = await this.parser.extractTranslations();
        await this.updateTranslationFiles(translations);
    }

    private async updateTranslationFiles(translations: TranslationKey[]): Promise<void> {
        for (const locale of this.config.supportedLocales) {
            const filePath = path.join(this.config.localesDir, `${locale}.json`);
            let existingTranslations: TranslationFile = {};

            if (fs.existsSync(filePath)) {
                existingTranslations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }

            const updatedTranslations = {
                ...existingTranslations,
                ...translations.reduce((acc, trans) => {
                    if (!existingTranslations[trans.key]) {
                        acc[trans.key] = locale === this.config.defaultLocale ? trans.defaultValue : '';
                    }
                    return acc;
                }, {} as TranslationFile),
            };

            fs.mkdirSync(this.config.localesDir, { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2));
        }
    }
}
