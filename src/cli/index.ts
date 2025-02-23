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
        // 프로젝트 초기화
    });

program
    .command('extract')
    .description('Extract translations from source files')
    .option('-n, --namespace <namespace>', 'Namespace for the translations')
    .option('-f, --format <format>', 'Output format (flat/nested)', 'flat')
    .option('-b, --backup', 'Create backup of existing translation files')
    .action(async (options) => {
        const config = JSON.parse(fs.readFileSync('./config/i18n.json', 'utf-8'));
        const manager = new TranslationManager({
            ...config,
            ...(options.backup ? { backupPath: './backup' } : {}),
        });
        await manager.extractAndUpdate();
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
