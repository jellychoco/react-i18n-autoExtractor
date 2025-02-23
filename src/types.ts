export interface I18nConfig {
    sourceDir: string;
    localesDir: string;
    defaultLocale: string;
    supportedLocales: string[];
    ignorePatterns?: string[];
    keyGeneration: 'hash' | 'text';
    namespaceSeparator?: string;
    namespace?: string;
    interpolation?: {
        prefix?: string;
        suffix?: string;
    };
    attributesToTranslate?: string[];
    preserveWhitespace?: boolean;
    outputFormat?: 'flat' | 'nested';
    backupPath?: string;
}

export interface TranslationKey {
    key: string;
    defaultValue: string;
    file: string;
    line: number;
    isTemplate?: boolean;
    namespace?: string;
    context?: string;
}

export interface TranslationFile {
    [key: string]: string;
}

export interface ExclusionConfig {
    rules: ExclusionRule[];
}

export interface ExclusionRule {
    pattern: string;
    reason?: string;
}

export interface InitAnswers {
    sourceDir: string;
    localesDir: string;
    supportedLocales: string[];
    defaultLocale: string;
    keyGeneration: 'text' | 'hash';
    outputFormat: 'flat' | 'nested';
    useNamespace: boolean;
    namespaceSeparator?: string;
    enableBackup: boolean;
}
