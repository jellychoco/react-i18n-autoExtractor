import { declare } from '@babel/helper-plugin-utils';
import { NodePath, PluginPass } from '@babel/core';
import * as t from '@babel/types';
import fs from 'fs';

interface BabelAPI {
    assertVersion(version: number): void;
}

interface PluginOptions {
    onNewTranslation?: (key: string, text: string) => void;
}

interface PluginState extends PluginPass {
    usesTranslation: boolean;
    opts: PluginOptions;
}

// Only translate user-facing content attributes
const TRANSLATABLE_ATTRIBUTES = new Set([
    'placeholder', // Input placeholder text
    'title', // Tooltip text
    'label', // Form label text
    'alt', // Image alternative text
    'aria-label', // Accessibility label
    'aria-description', // Accessibility description
]);

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
                        const hasImport = path.node.body.some((node) => t.isImportDeclaration(node) && node.source.value === 'react-i18n-autoextractor');
                        if (!hasImport) {
                            const importDecl = t.importDeclaration([t.importSpecifier(t.identifier('i18n'), t.identifier('i18n'))], t.stringLiteral('react-i18n-autoextractor'));
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
    // Ignore HTML attributes that should not be translated
    const nonTranslatableAttrs = ['href', 'src', 'rel', 'target', 'type', 'id', 'name', 'className', 'style'];
    if (nonTranslatableAttrs.includes(name)) return false;

    return TRANSLATABLE_ATTRIBUTES.has(name);
}
