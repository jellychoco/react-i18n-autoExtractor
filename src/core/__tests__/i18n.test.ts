import { i18n } from '../i18n';

describe('i18n Core', () => {
    beforeEach(() => {
        i18n.clearCache();
        i18n.setTranslations({
            en: {
                WELCOME: 'Welcome, {name}!',
                HELLO: 'Hello',
            },
            ko: {
                WELCOME: '환영합니다, {name}님!',
                HELLO: '안녕하세요',
            },
        });
        i18n.setLanguage('en');
    });

    describe('Basic Translation', () => {
        it('should translate simple text', () => {
            expect(i18n.t('HELLO')).toBe('Hello');
            i18n.setLanguage('ko');
            expect(i18n.t('HELLO')).toBe('안녕하세요');
        });

        it('should handle interpolation', () => {
            expect(i18n.t('WELCOME', { name: 'John' })).toBe('Welcome, John!');
            i18n.setLanguage('ko');
            expect(i18n.t('WELCOME', { name: 'John' })).toBe('환영합니다, John님!');
        });

        it('should return key if translation not found', () => {
            expect(i18n.t('UNKNOWN_KEY')).toBe('UNKNOWN_KEY');
        });
    });

    describe('Language Management', () => {
        it('should change language', () => {
            expect(i18n.getLanguage()).toBe('en');
            i18n.setLanguage('ko');
            expect(i18n.getLanguage()).toBe('ko');
        });

        it('should notify listeners on language change', () => {
            const listener = jest.fn();
            const unsubscribe = i18n.onLanguageChange(listener);

            i18n.setLanguage('ko');
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
            i18n.setLanguage('en');
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });

    describe('Caching', () => {
        beforeEach(() => {
            i18n.setTranslations({
                en: { TEST: 'Test' },
            });
            i18n.clearCache();
        });

        it('should cache translations', () => {
            const spy = jest.spyOn(i18n as any, 'interpolate');

            // 첫 번째 호출은 캐시 미스
            i18n.t('TEST');
            expect(spy).toHaveBeenCalledTimes(1);

            spy.mockClear();

            // 두 번째 호출은 캐시 히트
            i18n.t('TEST');
            expect(spy).not.toHaveBeenCalled();
        });

        it('should clear cache on language change', () => {
            const spy = jest.spyOn(i18n as any, 'interpolate');

            i18n.t('TEST');
            spy.mockClear();

            i18n.setLanguage('ko');
            i18n.t('TEST');

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should respect cache timeout', () => {
            jest.useFakeTimers();
            i18n.setCacheTimeout(1000); // 1 second

            const spy = jest.spyOn(i18n as any, 'interpolate');

            i18n.t('TEST');
            spy.mockClear();

            jest.advanceTimersByTime(1500);
            i18n.t('TEST');

            expect(spy).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });
    });
});
