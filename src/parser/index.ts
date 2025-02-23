import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { createHash } from 'crypto';
import { I18nConfig, TranslationKey } from '../types';

export class TranslationParser {
    private config: I18nConfig;

    constructor(config: I18nConfig) {
        this.config = config;
    }

    async extractTranslations(): Promise<TranslationKey[]> {
        const translations: TranslationKey[] = [];
        const files = this.findReactFiles(this.config.sourceDir);

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript'],
            });

            traverse(ast, {
                JSXText: (path) => {
                    this.handleTranslationNode(path, translations, file);
                },
                StringLiteral: (path) => {
                    if (this.isJSXAttribute(path)) {
                        this.handleTranslationNode(path, translations, file);
                    }
                },
                TemplateLiteral: (path) => {
                    if (this.isJSXAttribute(path)) {
                        this.handleTemplateLiteral(path, translations, file);
                    }
                },
            });
        }

        return this.deduplicateTranslations(translations);
    }

    protected generateKey(text: string): string {
        if (this.config.keyGeneration === 'hash') {
            return createHash('md5').update(text).digest('hex').substring(0, 8);
        }

        // Convert "Hello World" to "HELLO_WORLD"
        return text
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    private findReactFiles(dir: string): string[] {
        return glob.sync(path.join(dir, '**/*.{jsx,tsx,js,ts}'), {
            ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*', ...(this.config.ignorePatterns || [])],
        });
    }

    private shouldIgnore(text: string): boolean {
        if (!text.trim()) return true;
        if (/^\d+$/.test(text)) return true;
        if (/^https?:\/\//.test(text)) return true;
        return false;
    }

    private isJSXAttribute(path: any): boolean {
        return path.parent?.type === 'JSXAttribute' && !this.shouldIgnoreAttribute(path.parent.name.name);
    }

    private shouldIgnoreAttribute(name: string): boolean {
        const ignoreList = ['className', 'style', 'id', 'data-testid'];
        return ignoreList.includes(name);
    }

    private handleTranslationNode(path: any, translations: TranslationKey[], file: string): void {
        const text = path.node.value.trim();
        if (text && !this.shouldIgnore(text)) {
            translations.push({
                key: this.generateKey(text),
                defaultValue: text,
                file: file,
                line: path.node.loc?.start.line || 0,
            });
        }
    }

    private handleTemplateLiteral(path: any, translations: TranslationKey[], file: string): void {
        const quasis = path.node.quasis.map((quasi: any) => quasi.value.raw);
        const combined = quasis.join('{}');
        if (!this.shouldIgnore(combined)) {
            translations.push({
                key: this.generateKey(combined),
                defaultValue: combined,
                file,
                line: path.node.loc?.start.line || 0,
                isTemplate: true,
            });
        }
    }

    private deduplicateTranslations(translations: TranslationKey[]): TranslationKey[] {
        const uniqueTranslations = new Map<string, TranslationKey>();

        for (const translation of translations) {
            const key = `${translation.key}-${translation.file}-${translation.line}`;
            if (!uniqueTranslations.has(key)) {
                uniqueTranslations.set(key, translation);
            }
        }

        return Array.from(uniqueTranslations.values());
    }
}
