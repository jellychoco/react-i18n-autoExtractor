type EventCallback = () => void;
type TranslationCache = Map<string, { value: string; timestamp: number }>;

export class I18n {
    private currentLanguage: string = 'en';
    private translations: { [key: string]: { [key: string]: string } } = {};
    private eventListeners: Set<EventCallback> = new Set();
    private cache: TranslationCache = new Map();
    private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes default

    constructor() {
        // Initialize any other necessary properties
    }

    // 프록시 대신 직접 메서드 호출 방식으로 변경
    t(key: string, params?: Record<string, any>): string {
        const cacheKey = `${this.currentLanguage}:${key}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.value; // 캐시된 값을 그대로 반환, interpolate 호출하지 않음
        }

        const translation = this.translations[this.currentLanguage]?.[key] || key;
        const result = this.interpolate(translation, params);

        if (!params) {
            this.cache.set(cacheKey, {
                value: result, // 이미 interpolate된 결과를 캐시
                timestamp: Date.now(),
            });
        }

        return result;
    }

    // translate 메서드는 파라미터가 있는 경우만 사용
    translate(key: string, params: Record<string, string>): string {
        const translation = this.translations[this.currentLanguage]?.[key] || key;
        return this.interpolate(translation, params);
    }

    private interpolate(text: string, params?: Record<string, any>): string {
        if (!params) return text;
        return text.replace(/\{(\w+)\}/g, (_, key) => {
            const value = params[key];
            return value !== undefined ? value.toString() : '';
        });
    }

    // 언어 변경
    setLanguage(lang: string): boolean {
        if (this.currentLanguage === lang) return false;
        this.currentLanguage = lang;
        this.clearCache();
        this.notifyListeners();
        return true;
    }

    // 이벤트 리스너 관리
    onLanguageChange(callback: EventCallback): () => void {
        this.eventListeners.add(callback);
        return () => {
            this.eventListeners.delete(callback);
        };
    }

    private notifyListeners(): void {
        this.eventListeners.forEach((callback) => callback());
    }

    // 캐시 관리
    clearCache(): void {
        this.cache.clear();
    }

    setCacheTimeout(timeout: number): void {
        this.cacheTimeout = timeout;
    }

    // 번역 데이터 설정
    setTranslations(translations: Record<string, Record<string, string>>): void {
        this.translations = translations;
        this.clearCache();
    }

    getLanguage(): string {
        return this.currentLanguage;
    }

    loadTranslations(lang: string, translations: Record<string, string>) {
        this.translations[lang] = translations;
    }
}

// 싱글톤 인스턴스 생성
export const i18n = new I18n();
