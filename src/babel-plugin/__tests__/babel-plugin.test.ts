import { transformSync } from '@babel/core';
import babelPluginI18nAuto from '../babel-plugin-i18n-auto';

describe('Babel Plugin i18n Auto', () => {
    const transform = (code: string) => {
        return transformSync(code, {
            plugins: [babelPluginI18nAuto],
            parserOpts: { plugins: ['jsx', 'typescript'] },
            filename: 'test.tsx',
        })?.code;
    };

    describe('JSX Text Transformation', () => {
        it('should transform simple text nodes', () => {
            const input = `
                function App() {
                    return <div>Hello World</div>;
                }
            `;
            const output = transform(input);
            expect(output).toContain('i18n.t("HELLO_WORLD")');
        });

        it('should handle multiple text nodes', () => {
            const input = `
                function App() {
                    return (
                        <div>
                            <span>Hello</span>
                            <span>World</span>
                        </div>
                    );
                }
            `;
            const output = transform(input);
            expect(output).toContain('i18n.t("HELLO")');
            expect(output).toContain('i18n.t("WORLD")');
        });

        it('should ignore empty or whitespace-only text', () => {
            const input = `
                function App() {
                    return (
                        <div>
                            {" "}
                            <span>  </span>
                            <span>Hello</span>
                        </div>
                    );
                }
            `;
            const output = transform(input);
            expect(output).toContain('i18n.t("HELLO")');
            expect(output).not.toContain('i18n.t(" ")');
        });
    });

    describe('JSX Attribute Transformation', () => {
        it('should transform specific string attributes', () => {
            const input = `
                function App() {
                    return (
                        <input
                            placeholder="Enter your name"
                            title="Name Input"
                            type="text"
                        />
                    );
                }
            `;
            const output = transform(input);
            expect(output).toContain('i18n.t("ENTER_YOUR_NAME")');
            expect(output).toContain('i18n.t("NAME_INPUT")');
            expect(output).not.toContain('i18n.t("TEXT")');
        });
    });

    describe('Import Management', () => {
        it('should add i18n import when translations are used', () => {
            const input = `
                function App() {
                    return <div>Hello</div>;
                }
            `;
            const output = transform(input);
            expect(output).toMatch(/require\(["']react-native-i18n-auto["']\)/);
        });

        it('should not add import when no translations are needed', () => {
            const input = `
                function App() {
                    return <div>{someVar}</div>;
                }
            `;
            const output = transform(input);
            expect(output).not.toMatch(/require\(["']react-native-i18n-auto["']\)/);
        });
    });

    describe('Custom Component Transformation', () => {
        it('should transform text in custom components', () => {
            const input = `
                function App() {
                    return (
                        <div>
                            <CustomButton>Click me</CustomButton>
                            <StyledText>Welcome</StyledText>
                            <Layout.Header>Site Title</Layout.Header>
                        </div>
                    );
                }
            `;
            const output = transform(input);
            expect(output).toContain('i18n.t("CLICK_ME")');
            expect(output).toContain('i18n.t("WELCOME")');
            expect(output).toContain('i18n.t("SITE_TITLE")');
        });

        it('should handle nested custom components', () => {
            const input = `
                function App() {
                    return (
                        <Card>
                            <Card.Header>Profile Info</Card.Header>
                            <Card.Body>
                                <CustomText>Hello User</CustomText>
                            </Card.Body>
                        </Card>
                    );
                }
            `;
            const output = transform(input);
            expect(output).toContain('i18n.t("PROFILE_INFO")');
            expect(output).toContain('i18n.t("HELLO_USER")');
        });

        it('should transform custom component attributes', () => {
            const input = `
                function App() {
                    return (
                        <CustomInput
                            label="Your Name"
                            placeholder="Enter name here"
                            helperText="This will be displayed publicly"
                        />
                    );
                }
            `;
            const output = transform(input);
            expect(output).toContain('i18n.t("YOUR_NAME")');
            expect(output).toContain('i18n.t("ENTER_NAME_HERE")');
            expect(output).toContain('i18n.t("THIS_WILL_BE_DISPLAYED_PUBLICLY")');
        });
    });
});
