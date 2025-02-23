import { NodePath, PluginObj } from '@babel/core';
import * as t from '@babel/types';

export default function reactI18nAutoPlugin(): PluginObj {
    return {
        name: 'react-i18n-auto',
        visitor: {
            JSXText(path: NodePath<t.JSXText>) {
                const text = path.node.value.trim();
                if (!text) return;

                const key = text
                    .toUpperCase()
                    .replace(/[^A-Z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '');

                path.replaceWith(t.jsxExpressionContainer(t.callExpression(t.memberExpression(t.identifier('i18n'), t.identifier('t')), [t.stringLiteral(key)])));
            },
            JSXAttribute(path) {
                // 속성 변환 로직
            },
            TemplateLiteral(path) {
                // 템플릿 리터럴 변환 로직
            },
            CallExpression(path) {
                // 이미 변환된 i18n.t() 호출 최적화
            },
        },
    };
}
