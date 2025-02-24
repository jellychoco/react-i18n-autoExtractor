#!/usr/bin/env node
import { Command } from 'commander';
import { TranslationManager } from '../manager';
import { I18nConfig } from '../types';
import { KeyManager } from '../manager/key-manager';
import { ExclusionManager } from '../manager/exclusion-manager';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { InitAnswers, initQuestions } from './types';
import type { Answers } from 'inquirer';
import { globSync } from 'glob';
const inquirer = require('inquirer');

interface ExclusionRule {
    pattern: string;
    reason?: string;
}

export const program = new Command();

program.name('react-i18n-auto').description('CLI tool for automatic i18n management in React applications');

program
    .command('init')
    .description('Initialize translation files and configuration')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (options) => {
        try {
            // 기본 설정
            const defaultConfig: I18nConfig = {
                sourceDir: './src',
                localesDir: './src/locales',
                defaultLocale: 'en',
                supportedLocales: ['en', 'ko'],
                keyGeneration: 'text',
                outputFormat: 'flat',
                ignorePatterns: [],
            };

            // 이미 config 파일이 있는지 확인
            const configDir = './config';
            const configPath = path.join(configDir, 'i18n.json');

            if (fs.existsSync(configPath)) {
                console.log(chalk.yellow('Configuration file already exists.'));
                return;
            }

            let config = defaultConfig;

            // -y 옵션이 없으면 사용자에게 물어보기
            if (!options.yes) {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'sourceDir',
                        message: 'Source directory:',
                        default: defaultConfig.sourceDir,
                    },
                    {
                        type: 'input',
                        name: 'localesDir',
                        message: 'Locales directory:',
                        default: defaultConfig.localesDir,
                    },
                    {
                        type: 'input',
                        name: 'defaultLocale',
                        message: 'Default locale:',
                        default: defaultConfig.defaultLocale,
                    },
                    {
                        type: 'input',
                        name: 'supportedLocales',
                        message: 'Supported locales (comma-separated):',
                        default: defaultConfig.supportedLocales.join(','),
                        filter: (input: string) => input.split(',').map((locale) => locale.trim()),
                    },
                ]);

                config = { ...defaultConfig, ...answers };
            }

            // config 디렉토리 생성
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            // locales 디렉토리 생성
            if (!fs.existsSync(config.localesDir)) {
                fs.mkdirSync(config.localesDir, { recursive: true });
            }

            // config 파일 저장
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            // 기본 번역 파일 생성
            config.supportedLocales.forEach((locale) => {
                const localePath = path.join(config.localesDir, `${locale}.json`);
                if (!fs.existsSync(localePath)) {
                    fs.writeFileSync(localePath, JSON.stringify({}, null, 2));
                }
            });

            console.log(chalk.green('✨ Initialization completed successfully!'));
            console.log(chalk.cyan('\nCreated files:'));
            console.log(`  ${configPath}`);
            config.supportedLocales.forEach((locale) => {
                console.log(`  ${path.join(config.localesDir, `${locale}.json`)}`);
            });
        } catch (error) {
            console.error(chalk.red('Error during initialization:'), error);
            process.exit(1);
        }
    });

// React 컴포넌트 파일인지 확인하는 함수
function isReactComponentFile(filePath: string, content: string): boolean {
    // 파일 확장자 체크
    if (!/\.(jsx|tsx)$/.test(filePath)) {
        // .js, .ts 파일의 경우 내용을 검사
        if (/\.(js|ts)$/.test(filePath)) {
            // React 컴포넌트의 특징적인 패턴 검사
            const hasJSXPattern =
                /return\s+[(<]/.test(content) || // JSX를 반환하는 패턴
                /render\s*\(\s*\)\s*{/.test(content) || // render 메서드
                /React\.createElement/.test(content) || // React.createElement 사용
                /import\s+.*\s+from\s+['"]react['"]/.test(content); // React import

            return hasJSXPattern;
        }
        return false;
    }
    return true;
}

program
    .command('extract')
    .description('Extract translations from source files')
    .option('-n, --namespace <namespace>', 'Namespace for the translations')
    .option('-f, --format <format>', 'Output format (flat/nested)', 'flat')
    .option('-b, --backup', 'Create backup of existing translation files')
    .action(async (options) => {
        try {
            // 기본 설정값 정의
            const defaultConfig = {
                sourceDir: './src',
                localesDir: './src/locales',
                defaultLocale: 'en',
                supportedLocales: ['en'],
                keyGeneration: 'text',
            };

            // config 파일이 있으면 로드, 없으면 기본값 사용
            let config;
            try {
                config = JSON.parse(fs.readFileSync('./config/i18n.json', 'utf-8'));
            } catch (e) {
                config = defaultConfig;
                console.log(chalk.yellow('No config file found, using default settings'));
            }

            // 1. 먼저 파일 백업 (옵션이 있는 경우)
            if (options.backup) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupDir = path.join('./backup', timestamp);
                fs.mkdirSync(backupDir, { recursive: true });

                // 소스 파일 백업
                const sourceFiles = globSync('./src/**/*.{js,jsx,ts,tsx}');
                for (const file of sourceFiles) {
                    const relativePath = path.relative('./src', file);
                    const backupPath = path.join(backupDir, relativePath);
                    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
                    fs.copyFileSync(file, backupPath);
                }
            }

            // 2. 파일 변환 및 저장
            const sourceFiles = globSync('./src/**/*.{js,jsx,ts,tsx}');
            let transformedCount = 0;

            for (const file of sourceFiles) {
                const code = fs.readFileSync(file, 'utf-8');

                // React 컴포넌트 파일인 경우에만 변환
                if (isReactComponentFile(file, code)) {
                    // CLI 컨텍스트 설정
                    process.env.BABEL_CLI_CONTEXT = 'true';

                    const result = require('@babel/core').transformSync(code, {
                        filename: file,
                        babelrc: false, // 프로젝트의 babel 설정 무시
                        configFile: false, // babel.config.js 무시
                        plugins: ['@babel/plugin-syntax-jsx', '@jellychoco/react-i18n-auto/babel'],
                        presets: [],
                        parserOpts: {
                            plugins: ['jsx'],
                            sourceType: 'module',
                        },
                        retainLines: true,
                        compact: false,
                        comments: true,
                    });

                    // CLI 컨텍스트 초기화
                    process.env.BABEL_CLI_CONTEXT = 'false';

                    if (result?.code) {
                        try {
                            const formatted = await require('prettier').format(result.code, {
                                parser: 'typescript',
                                semi: true,
                                singleQuote: true,
                                tabWidth: 4,
                                jsxSingleQuote: true,
                            });
                            fs.writeFileSync(file, formatted);
                            transformedCount++;
                            console.log(chalk.green(`Transformed: ${file}`));
                        } catch (error) {
                            console.error(chalk.red(`Error formatting ${file}:`, error));
                            // 포맷팅에 실패하면 원본 변환 코드를 저장
                            fs.writeFileSync(file, result.code);
                            transformedCount++;
                            console.log(chalk.yellow(`Transformed without formatting: ${file}`));
                        }
                    }
                } else {
                    console.log(chalk.gray(`Skipped: ${file} (not a React component)`));
                }
            }

            // 3. 번역 키 추출 및 저장
            const manager = new TranslationManager({
                ...config,
                ...(options.backup ? { backupPath: './backup' } : {}),
            });
            await manager.extractAndUpdate();

            console.log(chalk.green(`✨ Successfully transformed ${transformedCount} React component files and extracted translations!`));
        } catch (error) {
            console.error(chalk.red('Error during extraction:'), error);
            process.exit(1);
        }
    });

program
    .command('sync')
    .description('Sync translation keys across all locale files')
    .action(async () => {
        // Implement sync logic
    });

program
    .command('check')
    .description('Check for missing translations')
    .action(async () => {
        // Implement check logic
    });

program
    .command('check-duplicates')
    .description('Find duplicate translation keys')
    .action(async () => {
        const config: I18nConfig = {
            sourceDir: './src',
            localesDir: './src/locales',
            defaultLocale: 'en',
            supportedLocales: ['en', 'ko'],
            keyGeneration: 'text',
            ignorePatterns: [],
        };

        const keyManager = new KeyManager(config);
        const duplicates = await keyManager.findDuplicateKeys();

        if (duplicates.size === 0) {
            console.log(chalk.green('No duplicate keys found.'));
            return;
        }

        console.log(chalk.yellow('Found duplicate keys:'));
        duplicates.forEach((locations, key) => {
            console.log(chalk.cyan(`\nKey: ${key}`));
            locations.forEach((location) => console.log(`  ${location}`));
        });
    });

program
    .command('check-unused')
    .description('Find unused translation keys')
    .action(async () => {
        const config: I18nConfig = {
            sourceDir: './src',
            localesDir: './src/locales',
            defaultLocale: 'en',
            supportedLocales: ['en', 'ko'],
            keyGeneration: 'text',
            ignorePatterns: [],
        };

        const keyManager = new KeyManager(config);
        const unusedKeys = await keyManager.findUnusedKeys();

        if (unusedKeys.length === 0) {
            console.log(chalk.green('No unused keys found.'));
            return;
        }

        console.log(chalk.yellow('Found unused keys:'));
        unusedKeys.forEach((key) => console.log(chalk.cyan(key)));
    });

program
    .command('exclusion')
    .description('Manage translation exclusion rules')
    .option('-a, --add <pattern>', 'Add exclusion pattern')
    .option('-r, --remove <pattern>', 'Remove exclusion pattern')
    .option('-l, --list', 'List all exclusion patterns')
    .option('--reason <reason>', 'Reason for exclusion (with --add)')
    .action(async (options) => {
        const exclusionManager = new ExclusionManager({ configDir: './config' });

        if (options.list) {
            const rules = exclusionManager.getRules();
            console.log(chalk.cyan('Current exclusion rules:'));
            rules.forEach((rule) => {
                console.log(`\nPattern: ${rule.pattern}`);
                if (rule.reason) console.log(`Reason: ${rule.reason}`);
            });
            return;
        }

        if (options.add) {
            exclusionManager.addRule(options.add, options.reason);
            console.log(chalk.green(`Added exclusion rule: ${options.add}`));
            return;
        }

        if (options.remove) {
            exclusionManager.removeRule(options.remove);
            console.log(chalk.green(`Removed exclusion rule: ${options.remove}`));
            return;
        }
    });

program
    .command('status')
    .description('Show translation status')
    .action(async () => {
        const config: I18nConfig = JSON.parse(fs.readFileSync('./config/i18n.json', 'utf-8'));
        const stats: { [key: string]: { total: number; empty: number } } = {};

        for (const locale of config.supportedLocales) {
            const filePath = path.join(config.localesDir, `${locale}.json`);
            if (fs.existsSync(filePath)) {
                const translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const total = Object.keys(translations).length;
                const empty = Object.values(translations).filter((v) => !v).length;
                stats[locale] = { total, empty };
            }
        }

        console.log(chalk.cyan('\nTranslation Status:'));
        for (const [locale, { total, empty }] of Object.entries(stats)) {
            const completed = total - empty;
            const percentage = total ? Math.round((completed / total) * 100) : 0;
            console.log(`\n${locale.toUpperCase()}:`);
            console.log(`Total keys: ${total}`);
            console.log(`Completed: ${completed}`);
            console.log(`Missing: ${empty}`);
            console.log(`Progress: ${percentage}%`);
        }
    });

program
    .command('clean')
    .description('Remove unused translations')
    .option('-d, --dry-run', 'Show what would be removed without making changes')
    .action(async (options) => {
        const config: I18nConfig = JSON.parse(fs.readFileSync('./config/i18n.json', 'utf-8'));
        const keyManager = new KeyManager(config);
        const unusedKeys = await keyManager.findUnusedKeys();

        if (unusedKeys.length === 0) {
            console.log(chalk.green('No unused translations found.'));
            return;
        }

        console.log(chalk.yellow(`Found ${unusedKeys.length} unused translations:`));
        unusedKeys.forEach((key) => console.log(chalk.cyan(key)));

        if (!options.dryRun) {
            for (const locale of config.supportedLocales) {
                const filePath = path.join(config.localesDir, `${locale}.json`);
                if (fs.existsSync(filePath)) {
                    const translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    unusedKeys.forEach((key) => delete translations[key]);
                    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
                }
            }
            console.log(chalk.green('\nUnused translations have been removed.'));
        }
    });

// 테스트 환경이 아닐 때만 parse 실행
if (process.env.NODE_ENV !== 'test') {
    program.parse();
}
