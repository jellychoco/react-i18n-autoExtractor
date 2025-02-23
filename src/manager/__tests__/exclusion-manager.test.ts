import { ExclusionManager } from '../exclusion-manager';
import * as fs from 'fs';
import * as path from 'path';

describe('ExclusionManager', () => {
    const testDir = path.join(__dirname, 'test-config');
    const configPath = path.join(testDir, 'i18n-exclusions.json');

    beforeEach(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
        fs.mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
        fs.rmSync(testDir, { recursive: true, force: true });
    });

    test('should add and remove exclusion rules', () => {
        const manager = new ExclusionManager({ configDir: testDir });

        manager.addRule('/^[0-9]+$/', 'Exclude numbers');
        expect(fs.existsSync(configPath)).toBeTruthy();

        const savedRules = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        expect(savedRules).toHaveLength(1);
        expect(savedRules[0].pattern).toBe('/^[0-9]+$/');
        expect(savedRules[0].reason).toBe('Exclude numbers');

        manager.removeRule('/^[0-9]+$/');
        const updatedRules = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        expect(updatedRules).toHaveLength(0);
    });

    test('should correctly exclude patterns', () => {
        const manager = new ExclusionManager({ configDir: testDir });

        manager.addRule('/^[0-9]+$/', 'Exclude numbers');
        manager.addRule('DO_NOT_TRANSLATE', 'Special keyword');

        expect(manager.shouldExclude('123', { file: 'test.tsx', line: 1 })).toBeTruthy();
        expect(manager.shouldExclude('DO_NOT_TRANSLATE', { file: 'test.tsx', line: 1 })).toBeTruthy();
        expect(manager.shouldExclude('Hello World', { file: 'test.tsx', line: 1 })).toBeFalsy();
    });
});
