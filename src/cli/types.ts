import { QuestionCollection } from 'inquirer';

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

export const initQuestions: QuestionCollection = [
    {
        type: 'input',
        name: 'sourceDir',
        message: 'Source directory:',
        default: './src',
    },
    // ... rest of the questions
] as const;
