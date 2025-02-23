import { declare } from '@babel/helper-plugin-utils';
import type { NodePath } from '@babel/traverse';
import type { PluginPass } from '@babel/core';
import * as t from '@babel/types';

interface BabelAPI {
    assertVersion(version: number): void;
}

interface PluginState extends PluginPass {
    usesTranslation: boolean; // scope.data 대신 직접 state에 플래그 저장
}

// 번역이 필요한 속성들
const TRANSLATABLE_ATTRIBUTES = new Set(['placeholder', 'title', 'label', 'helperText', 'description', 'alt']);

export default declare((api: BabelAPI) => {
    api.assertVersion(7);

    return {
        name: 'babel-plugin-i18n-auto',
        visitor: {
            Program: {
                enter(path: NodePath<t.Program>, state: PluginState) {
                    state.usesTranslation = false; // 플래그 초기화
                    path.traverse({
                        JSXText(textPath: NodePath<t.JSXText>) {
                            const text = textPath.node.value.trim();
                            if (text) state.usesTranslation = true;
                        },
                        JSXAttribute(attrPath: NodePath<t.JSXAttribute>) {
                            if (isTranslatableAttribute(attrPath)) {
                                state.usesTranslation = true;
                            }
                        },
                    });
                },
                exit(path: NodePath<t.Program>, state: PluginState) {
                    if (state.usesTranslation) {
                        addI18nImport(path);
                    }
                },
            },
            JSXText(path: NodePath<t.JSXText>) {
                const text = path.node.value.trim();
                if (!text) return;

                const key = generateTranslationKey(text);
                path.replaceWith(t.jsxExpressionContainer(t.callExpression(t.memberExpression(t.identifier('i18n'), t.identifier('t')), [t.stringLiteral(key)])));
            },
            JSXAttribute(path: NodePath<t.JSXAttribute>) {
                if (!isTranslatableAttribute(path)) return;

                const value = path.node.value;
                if (!t.isStringLiteral(value)) return;

                const text = value.value;
                const key = generateTranslationKey(text);

                path.node.value = t.jsxExpressionContainer(t.callExpression(t.memberExpression(t.identifier('i18n'), t.identifier('t')), [t.stringLiteral(key)]));
            },
        },
    };
});

// 번역 키 생성 함수
function generateTranslationKey(text: string): string {
    return text
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// 번역 가능한 속성인지 확인
function isTranslatableAttribute(path: NodePath<t.JSXAttribute>): boolean {
    const name = path.node.name.name;
    if (typeof name !== 'string') return false;

    // 모든 컴포넌트의 특정 속성들을 번역 대상으로 처리
    return TRANSLATABLE_ATTRIBUTES.has(name);
}

// i18n import 추가
function addI18nImport(path: NodePath<t.Program>) {
    path.node.body.unshift(t.variableDeclaration('const', [t.variableDeclarator(t.identifier('i18n'), t.callExpression(t.identifier('require'), [t.stringLiteral('react-native-i18n-auto')]))]));
}
