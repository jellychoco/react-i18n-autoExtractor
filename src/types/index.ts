export interface I18nConfig {
    sourceDir: string;
    localesDir: string;
    defaultLocale: string;
    supportedLocales: string[];
    keyGeneration: 'text' | 'hash';
    outputFormat: 'flat' | 'nested';
    ignorePatterns: string[];
    namespace?: string;
    backupPath?: string;
}

export interface TranslationKey {
    key: string;
    defaultValue: string;
    namespace?: string;
    file: string;
    line: number;
    isTemplate?: boolean;
}

export interface TranslationFile {
    [key: string]: string;
}
