import { TranslationManager } from '../index';
import { I18nConfig } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

describe('TranslationManager', () => {
    const testDir = path.join(__dirname, 'test-project');
    const srcDir = path.join(testDir, 'src');
    const localesDir = path.join(testDir, 'locales');

    const config: I18nConfig = {
        sourceDir: srcDir,
        localesDir: localesDir,
        defaultLocale: 'en',
        supportedLocales: ['en', 'ko'],
        keyGeneration: 'text',
        ignorePatterns: [],
    };

    let manager: TranslationManager;

    beforeEach(() => {
        // 테스트 디렉토리 초기화
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
        fs.mkdirSync(srcDir, { recursive: true });
        fs.mkdirSync(localesDir, { recursive: true });

        // 테스트용 React 파일 생성
        fs.writeFileSync(
            path.join(srcDir, 'App.tsx'),
            `
                function App() {
                    return <div>Hello World</div>;
                }
            `
        );

        manager = new TranslationManager(config);
    });

    afterEach(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    test('should create translation files for all supported locales', async () => {
        await manager.extractAndUpdate();

        for (const locale of config.supportedLocales) {
            const filePath = path.join(localesDir, `${locale}.json`);
            expect(fs.existsSync(filePath)).toBeTruthy();

            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            expect(content).toHaveProperty('HELLO_WORLD');

            if (locale === config.defaultLocale) {
                expect(content.HELLO_WORLD).toBe('Hello World');
            } else {
                expect(content.HELLO_WORLD).toBe('');
            }
        }
    });

    test('should preserve existing translations', async () => {
        const existingTranslations = {
            HELLO_WORLD: '안녕하세요',
            EXISTING_KEY: '기존 번역',
        };

        fs.writeFileSync(path.join(localesDir, 'ko.json'), JSON.stringify(existingTranslations, null, 2));

        await manager.extractAndUpdate();

        const updatedContent = JSON.parse(fs.readFileSync(path.join(localesDir, 'ko.json'), 'utf-8'));

        expect(updatedContent.HELLO_WORLD).toBe('안녕하세요');
        expect(updatedContent.EXISTING_KEY).toBe('기존 번역');
    });
});
