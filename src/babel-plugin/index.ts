import { declare } from '@babel/helper-plugin-utils';
import type { NodePath } from '@babel/traverse';
import type { PluginPass } from '@babel/core';
import * as t from '@babel/types';

interface BabelAPI {
    assertVersion(version: number): void;
}

interface PluginState extends PluginPass {
    usesTranslation: boolean;
}

// 번역이 필요한 속성들
const TRANSLATABLE_ATTRIBUTES = new Set(['placeholder', 'title', 'label', 'helperText', 'description', 'alt']);

export default declare((api: BabelAPI) => {
    api.assertVersion(7);

    return {
        inherits: require('@babel/plugin-syntax-jsx').default,
        name: 'babel-plugin-i18n-auto',
        visitor: {
            Program: {
                enter(path: NodePath<t.Program>, state: PluginState) {
                    state.usesTranslation = false;
                },
                exit(path: NodePath<t.Program>, state: PluginState) {
                    if (state.usesTranslation) {
                        const hasImport = path.node.body.some((node) => t.isImportDeclaration(node) && node.source.value === '@jellychoco/react-i18n-auto');
                        if (!hasImport) {
                            const importDecl = t.importDeclaration([t.importSpecifier(t.identifier('i18n'), t.identifier('i18n'))], t.stringLiteral('@jellychoco/react-i18n-auto'));
                            path.unshiftContainer('body', importDecl);
                        }
                    }
                },
            },
            JSXText(path: NodePath<t.JSXText>, state: PluginState) {
                const text = path.node.value.trim();
                if (!text) return;

                state.usesTranslation = true;
                const key = generateTranslationKey(text);
                path.replaceWith(t.jsxExpressionContainer(t.callExpression(t.memberExpression(t.identifier('i18n'), t.identifier('t')), [t.stringLiteral(key)])));
            },
            JSXAttribute(path: NodePath<t.JSXAttribute>, state: PluginState) {
                if (!isTranslatableAttribute(path)) return;

                const value = path.node.value;
                if (!t.isStringLiteral(value)) return;

                const text = value.value.trim();
                if (!text) return;

                state.usesTranslation = true;
                const key = generateTranslationKey(text);
                path.node.value = t.jsxExpressionContainer(t.callExpression(t.memberExpression(t.identifier('i18n'), t.identifier('t')), [t.stringLiteral(key)]));
            },
        },
    };
});

function generateTranslationKey(text: string): string {
    return text
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function isTranslatableAttribute(path: NodePath<t.JSXAttribute>): boolean {
    const name = path.node.name.name;
    if (typeof name !== 'string') return false;
    return TRANSLATABLE_ATTRIBUTES.has(name);
}
