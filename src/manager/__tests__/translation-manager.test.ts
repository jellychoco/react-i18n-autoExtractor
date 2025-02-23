import { TranslationManager } from '../translation-manager';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

jest.mock('fs');
jest.mock('path');
jest.mock('glob', () => ({
    sync: jest.fn().mockReturnValue([]),
}));

describe('TranslationManager', () => {
    const mockConfig = {
        sourceDir: './src',
        localesDir: './src/locales',
        defaultLocale: 'en',
        supportedLocales: ['en', 'ko'],
        outputFormat: 'flat' as const,
        keyGeneration: 'text' as const,
        ignorePatterns: [],
    };

    let manager: TranslationManager;

    beforeEach(() => {
        manager = new TranslationManager(mockConfig);
        (fs.existsSync as jest.Mock).mockReset();
        (fs.mkdirSync as jest.Mock).mockReset();
        (fs.writeFileSync as jest.Mock).mockReset();
        (fs.readFileSync as jest.Mock).mockReset();
    });

    describe('extractAndUpdate', () => {
        it('should create locale directory if not exists', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await manager.extractAndUpdate();

            expect(fs.mkdirSync).toHaveBeenCalledWith(mockConfig.localesDir, { recursive: true });
        });

        it('should handle backup creation', async () => {
            const managerWithBackup = new TranslationManager({
                ...mockConfig,
                backupPath: './backup',
            });

            await managerWithBackup.extractAndUpdate();

            expect(fs.mkdirSync).toHaveBeenCalledWith('./backup', { recursive: true });
        });

        it('should update translation files', async () => {
            const mockTranslations = [
                {
                    key: 'HELLO',
                    defaultValue: 'Hello',
                    file: 'test.tsx',
                    line: 1,
                },
                {
                    key: 'WELCOME',
                    defaultValue: 'Welcome',
                    file: 'test.tsx',
                    line: 2,
                },
            ];

            jest.spyOn(manager['parser'], 'extractTranslations').mockResolvedValue(mockTranslations);

            await manager.extractAndUpdate();

            expect(fs.writeFileSync).toHaveBeenCalled();
        });
    });
});
