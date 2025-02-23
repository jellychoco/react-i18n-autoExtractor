import { TranslationParser } from '../index';
import { I18nConfig } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

class TestTranslationParser extends TranslationParser {
    public testGenerateKey(text: string): string {
        return this.generateKey(text);
    }
}

describe('TranslationParser', () => {
    let parser: TestTranslationParser;
    const testConfig: I18nConfig = {
        sourceDir: path.join(__dirname, 'fixtures'),
        localesDir: path.join(__dirname, 'fixtures/locales'),
        defaultLocale: 'en',
        supportedLocales: ['en', 'ko'],
        keyGeneration: 'text',
        ignorePatterns: [],
    };

    beforeEach(() => {
        parser = new TestTranslationParser(testConfig);
    });

    beforeAll(() => {
        const fixtureDir = path.join(__dirname, 'fixtures');
        if (fs.existsSync(fixtureDir)) {
            fs.rmSync(fixtureDir, { recursive: true, force: true });
        }
        fs.mkdirSync(fixtureDir, { recursive: true });

        // 테스트 파일 생성
        fs.writeFileSync(
            path.join(fixtureDir, 'TestComponent.tsx'),
            `
                function TestComponent() {
                    return <div>Hello World</div>;
                }
            `
        );
    });

    afterAll(() => {
        fs.rmSync(path.join(__dirname, 'fixtures'), { recursive: true, force: true });
    });

    test('should extract translations from JSX', async () => {
        const translations = await parser.extractTranslations();
        expect(translations).toContainEqual(
            expect.objectContaining({
                key: 'HELLO_WORLD',
                defaultValue: 'Hello World',
            })
        );
    });

    test('should generate correct key formats', () => {
        const readableKey = parser.testGenerateKey('Hello World! 123');
        expect(readableKey).toBe('HELLO_WORLD_123');

        const hashParser = new TestTranslationParser({
            ...testConfig,
            keyGeneration: 'hash',
        });
        const hashKey = hashParser.testGenerateKey('Hello World! 123');
        expect(hashKey).toMatch(/^[0-9a-f]{8}$/);
    });
});
