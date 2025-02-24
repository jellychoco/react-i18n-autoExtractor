import { transformSync } from '@babel/core';
import babelPluginI18nAuto from '../index';

describe('Babel Plugin i18n Auto', () => {
    const transform = (code: string) => {
        try {
            return (
                transformSync(code, {
                    filename: 'test.tsx',
                    babelrc: false,
                    configFile: false,
                    plugins: ['@babel/plugin-syntax-jsx', [babelPluginI18nAuto, {}]],
                    parserOpts: {
                        plugins: ['jsx'],
                        sourceType: 'module',
                    },
                    generatorOpts: {
                        retainLines: true,
                        compact: false,
                    },
                })?.code || ''
            );
        } catch (error) {
            console.error('Transform error:', error);
            return '';
        }
    };

    it('should transform text nodes to i18n calls', () => {
        const code = '<div>Hello World</div>';
        const output = transform(code);
        expect(output).toContain('i18n.t("HELLO_WORLD")');
        expect(output).toContain('import { i18n }');
    });

    it('should ignore className and id attributes', () => {
        const code = '<div className="test" id="test">Hello</div>';
        const output = transform(code);
        expect(output).toContain('i18n.t("HELLO")');
        expect(output).not.toContain('i18n.t("TEST")');
    });
});
