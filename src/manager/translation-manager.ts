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
        await this.updateTranslationFiles(translations);
    }

    private async updateTranslationFiles(translations: TranslationKey[]): Promise<void> {
        // 디렉토리가 없으면 생성
        if (!fs.existsSync(this.config.localesDir)) {
            fs.mkdirSync(this.config.localesDir, { recursive: true });
        }

        // 백업 생성 (설정된 경우)
        if (this.config.backupPath) {
            await this.backupTranslationFiles();
        }

        for (const locale of this.config.supportedLocales) {
            const filePath = path.join(this.config.localesDir, `${locale}.json`);
            let existingTranslations: TranslationFile = {};

            // 기존 번역 파일이 있으면 로드
            if (fs.existsSync(filePath)) {
                existingTranslations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }

            // 새로운 번역 객체 생성
            const updatedTranslations = this.createUpdatedTranslations(translations, existingTranslations, locale);

            // 네임스페이스 처리
            const finalTranslations = this.config.outputFormat === 'nested' ? this.convertToNestedFormat(updatedTranslations) : updatedTranslations;

            // 파일 저장
            fs.writeFileSync(filePath, JSON.stringify(finalTranslations, null, 2));
        }
    }

    private createUpdatedTranslations(newTranslations: TranslationKey[], existingTranslations: TranslationFile, locale: string): TranslationFile {
        const translations: TranslationFile = { ...existingTranslations };

        for (const trans of newTranslations) {
            const key = this.getTranslationKey(trans);
            if (!translations[key]) {
                translations[key] = locale === this.config.defaultLocale ? trans.defaultValue : '';
            }
        }

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
