# @jellychoco/react-i18n-auto

Automatic internationalization (i18n) management tool for React applications with TypeScript support.

## Features

- 🔄 Automatic translation key extraction and JSX transformation
- 🎯 Type-safe with full TypeScript support
- 🧩 Custom component support including nested components
- 💾 Built-in caching system for performance
- 🔍 Comprehensive CLI tools for i18n management
- 📱 Follows Apple's Human Interface Guidelines for UI components

## Installation

```bash
npm install @jellychoco/react-i18n-auto
```

### Initialize Configuration

```bash
npx react-i18n-auto init
```

Add to `.babelrc` or `babel.config.js`:

```json
{
    "plugins": ["@jellychoco/react-i18n-auto/babel"]
}
```

## Quick Start

### 1. Basic Usage

```typescript
import { i18n } from '@jellychoco/react-i18n-auto';

// Simple text translation
function Welcome() {
    return <h1>{i18n.t("HELLO")}</h1>;
}

// With parameters
function UserGreeting({ name, count }) {
    return (
        <div>
            <h1>{i18n.t('WELCOME_BACK', { name })}</h1>
            <p>{i18n.t('NEW_MESSAGES', { count })}</p>
        </div>
    );
}
```

### 2. Language Management

```typescript
// i18nContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { i18n } from '@jellychoco/react-i18n-auto';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );

  const setLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    i18n.setLanguage(lang);
    setCurrentLanguage(lang);
  };

  return (
    <I18nContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

// Usage
function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useI18n();
  return (
    <select value={currentLanguage} onChange={(e) => setLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="ko">한국어</option>
    </select>
  );
}
```

## CLI Commands

| Command            | Description                            | Options                                                                                                                                                                      |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init`             | Initialize project configuration       | `-y, --yes`: Skip prompts and use defaults                                                                                                                                   |
| `extract`          | Extract translations from source files | `-n, --namespace`: Namespace for translations<br>`-f, --format`: Output format (flat/nested)<br>`-b, --backup`: Create backup of existing files                              |
| `check-duplicates` | Find duplicate translation keys        |                                                                                                                                                                              |
| `check-unused`     | Find unused translation keys           |                                                                                                                                                                              |
| `clean`            | Remove unused translations             | `-d, --dry-run`: Show what would be removed without making changes                                                                                                           |
| `status`           | Show translation status                |                                                                                                                                                                              |
| `exclusion`        | Manage translation exclusion rules     | `-a, --add <pattern>`: Add exclusion pattern<br>`-r, --remove <pattern>`: Remove pattern<br>`-l, --list`: List all patterns<br>`--reason <reason>`: Add reason for exclusion |

## Configuration Options

| Option           | Description                 | Default         |
| ---------------- | --------------------------- | --------------- |
| sourceDir        | Source code directory       | "./src"         |
| localesDir       | Translation files directory | "./src/locales" |
| defaultLocale    | Default language            | "en"            |
| supportedLocales | Supported languages         | ["en"]          |
| keyGeneration    | Key generation method       | "text"          |
| outputFormat     | Output format style         | "flat"          |
| ignorePatterns   | Patterns to ignore          | []              |

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

Issues and feature requests: [GitHub Issues](https://github.com/jellychoco/react-i18n-transformer/issues)
