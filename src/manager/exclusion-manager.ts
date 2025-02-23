import * as fs from 'fs';
import * as path from 'path';

interface ExclusionRule {
    pattern: string;
    reason?: string;
}

export class ExclusionManager {
    private readonly configPath: string;
    private rules: ExclusionRule[] = [];

    constructor(private config: { configDir: string }) {
        this.configPath = path.join(config.configDir, 'i18n-exclusions.json');
        this.loadRules();
    }

    private loadRules(): void {
        if (fs.existsSync(this.configPath)) {
            this.rules = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        }
    }

    shouldExclude(text: string, context: { file: string; line: number }): boolean {
        // 번역에서 제외할 텍스트 판단
        return this.rules.some((rule) => {
            if (rule.pattern.startsWith('/') && rule.pattern.endsWith('/')) {
                // 정규식 패턴
                const regex = new RegExp(rule.pattern.slice(1, -1));
                return regex.test(text);
            }
            // 정확한 문자열 매칭
            return text === rule.pattern;
        });
    }

    addRule(pattern: string, reason?: string): void {
        this.rules.push({ pattern, reason });
        this.saveRules();
    }

    removeRule(pattern: string): void {
        this.rules = this.rules.filter((rule) => rule.pattern !== pattern);
        this.saveRules();
    }

    private saveRules(): void {
        fs.writeFileSync(this.configPath, JSON.stringify(this.rules, null, 2));
    }

    getRules(): ExclusionRule[] {
        return [...this.rules];
    }
}
