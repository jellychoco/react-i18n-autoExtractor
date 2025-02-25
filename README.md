# react-i18n-autoextractor

🌍 Instant i18n for React: Transform your entire application into a multi-language ready state with a single command. No more manual text extraction, no more forgotten strings, no more i18n headaches.

> Turn 100+ hours of manual internationalization work into a 30-second automated process.

## 0. Transform Example

```jsx
// Before
function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <CustomTitle>Welcome to React</CustomTitle>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <InfoBox>
                    You have 3 new messages
                    <StyledLink href="/messages">Check your inbox</StyledLink>
                </InfoBox>
                <div>
                    <CustomButton>Click me</CustomButton>
                </div>
            </header>
        </div>
    );
}

// After
import { i18n } from 'react-i18n-autoextractor';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt={i18n.t('LOGO')} />
                <CustomTitle>{i18n.t('WELCOME_TO_REACT')}</CustomTitle>
                <p>
                    {i18n.t('EDIT')} <code>{i18n.t('SRC_APP_JS')}</code> {i18n.t('AND_SAVE_TO_RELOAD')}
                </p>
                <InfoBox>
                    {i18n.t('YOU_HAVE_NEW_MESSAGES', { count: 3 })}
                    <StyledLink href="/messages">{i18n.t('CHECK_YOUR_INBOX')}</StyledLink>
                </InfoBox>
                <div>
                    <CustomButton>{i18n.t('CLICK_ME')}</CustomButton>
                </div>
            </header>
        </div>
    );
}
```

## Features

- 🔄 Automatic translation key extraction and JSX transformation
- 🎯 Type-safe with full TypeScript support
- 🧩 Custom component support including nested components
- 💾 Built-in caching system for performance
- 🔍 Comprehensive CLI tools for i18n management
- 📱 Follows Apple's Human Interface Guidelines for UI components

## Installation

```bash
npm install --save-dev react-i18n-autoextractor
```

### Initialize Configuration

```bash
npx i18n-extract init
```

## 🛠 Setup

### Babel Configuration

Create or modify your project's `babel.config.js`:

```javascript
module.exports = {
    plugins: [
        // Our plugin should be after JSX transformations
        'react-i18n-autoextractor/babel',
        // Other plugins can follow
    ],
};
```

Or if you're using `.babelrc`:

```json
{
    "plugins": ["react-i18n-autoextractor/babel"]
}
```

> **Note**: The order of plugins matters. Place `react-i18n-autoextractor/babel` after any JSX transformation plugins but before other code transformation plugins.

## Quick Start

### 1. Basic Usage

```typescript
import { i18n } from 'react-i18n-autoextractor';

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
import { i18n } from 'react-i18n-autoextractor';

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

### 1. Initialize Project

```bash
# Initialize project configuration
npx i18n-extract init

# This will create:
#   - config/i18n.json
#   - src/locales/en.json
#   - src/locales/ko.json

# Default config (config/i18n.json):
{
    "sourceDir": "./src",
    "localesDir": "./src/locales",
    "defaultLocale": "en",
    "supportedLocales": ["en", "ko"],
    "keyGeneration": "text",
    "outputFormat": "flat",
    "ignorePatterns": []
}
```

### 2. Extract Translations

```bash
# Extract all translations from your React components
npx i18n-extract extract

# Generated translation files (src/locales/en.json):
{
    "WELCOME_TO_REACT": "Welcome to React",
    "EDIT": "Edit",
    "SRC_APP_JS": "src/App.js",
    "AND_SAVE_TO_RELOAD": "and save to reload",
    "YOU_HAVE_NEW_MESSAGES": "You have {count} new messages",
    "CHECK_YOUR_INBOX": "Check your inbox",
    "CLICK_ME": "Click me"
}

# Korean translations will be created with empty strings (src/locales/ko.json):
{
    "WELCOME_TO_REACT": "",
    "EDIT": "",
    "SRC_APP_JS": "",
    "AND_SAVE_TO_RELOAD": "",
    "YOU_HAVE_NEW_MESSAGES": "",
    "CHECK_YOUR_INBOX": "",
    "CLICK_ME": ""
}
```

### 3. Additional Commands

```bash
# Check for duplicate translation keys
npx i18n-extract check-duplicates

# Find unused translation keys
npx i18n-extract check-unused

# Show translation status
npx i18n-extract status

# Clean up unused translations
npx i18n-extract clean
```

### How It Works

1. The extract command scans your React components for text content
2. Automatically transforms JSX text nodes into i18n.t() calls
3. Generates translation keys based on the text content
4. Creates or updates translation files for all supported languages
5. Preserves existing translations when updating files

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
