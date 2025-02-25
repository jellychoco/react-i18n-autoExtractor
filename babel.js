module.exports = function (api) {
    api.assertVersion(7);

    // CLI에서 실행되는지 확인
    const isCliContext = process.env.BABEL_CLI_CONTEXT === 'true';

    if (isCliContext) {
        // CLI 실행 시 JSX 변환 없이 텍스트만 변환
        return {
            plugins: ['@babel/plugin-syntax-jsx', [require('react-i18n-autoextractor/babel'), {}]],
        };
    }

    // 일반 빌드 시 기존 설정 사용
    return {
        plugins: [require('react-i18n-autoextractor/babel')],
    };
};
