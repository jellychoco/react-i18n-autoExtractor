import { KeyManager } from '../key-manager';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

jest.mock('fs');
jest.mock('glob');

describe('KeyManager', () => {
    const testDir = path.join(__dirname, 'test-project');
    const srcDir = path.join(testDir, 'src');
    const localesDir = path.join(testDir, 'locales');

    const config = {
        sourceDir: srcDir,
        localesDir: localesDir,
        defaultLocale: 'en',
        supportedLocales: ['en', 'ko'],
        keyGeneration: 'text' as const,
    };

    let keyManager: KeyManager;

    beforeEach(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
        fs.mkdirSync(srcDir, { recursive: true });
        fs.mkdirSync(localesDir, { recursive: true });

        keyManager = new KeyManager(config);
        (fs.readFileSync as jest.Mock).mockReset();
        (fs.existsSync as jest.Mock).mockReset();
    });

    afterEach(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    describe('findDuplicateKeys', () => {
        it('should find duplicate translation keys', async () => {
            const mockFiles = ['file1.tsx', 'file2.tsx'];
            require('glob').sync.mockReturnValue(mockFiles);

            (fs.readFileSync as jest.Mock).mockReturnValueOnce('i18n.t("HELLO")\ni18n.t("WELCOME")').mockReturnValueOnce('i18n.t("HELLO")\ni18n.t("GOODBYE")');

            const duplicates = await keyManager.findDuplicateKeys();
            expect(duplicates.get('HELLO')).toHaveLength(2);
        });
    });

    describe('findUnusedKeys', () => {
        it('should find unused translation keys', async () => {
            const mockFiles = ['file1.tsx'];
            require('glob').sync.mockReturnValue(mockFiles);

            (fs.readFileSync as jest.Mock)
                .mockImplementationOnce(() =>
                    JSON.stringify({
                        HELLO: 'Hello',
                        UNUSED: 'Unused',
                    })
                )
                .mockImplementationOnce(() => 'i18n.t("HELLO")');

            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const unusedKeys = await keyManager.findUnusedKeys();
            expect(unusedKeys).toContain('UNUSED');
            expect(unusedKeys).not.toContain('HELLO');
        });
    });
});
