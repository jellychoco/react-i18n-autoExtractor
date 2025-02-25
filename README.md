# react-i18n-autoextractor

🌍 Instant i18n for React: Transform your entire application into a multi-language ready state with a single command. No more manual text extraction, no more forgotten strings, no more i18n headaches.

> Turn 100+ hours of manual internationalization work into a 30-second automated process.

![react-i18n-autoextractor demo](docs/demo.gif)

## Preview

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

// Extract translations
npx i18n-extract extract

// After few seconds, you can see the generated translation files
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
# Generated translation files (src/locales/en.json):
{
    "LOGO": "logo",
    "WELCOME_TO_REACT": "Welcome to React",
    "EDIT": "Edit",
    "SRC_APP_JS": "src/App.js",
    "AND_SAVE_TO_RELOAD": "and save to reload",
    "YOU_HAVE_NEW_MESSAGES": "You have 3 new messages",
    "CHECK_YOUR_INBOX": "Check your inbox",
    "CLICK_ME": "Click me"
}

# Korean translations will be created with empty strings (src/locales/ko.json):
{
    "LOGO": "",
    "WELCOME_TO_REACT": "",
    "EDIT": "",
    "SRC_APP_JS": "",
    "AND_SAVE_TO_RELOAD": "",
    "YOU_HAVE_NEW_MESSAGES": "",
    "CHECK_YOUR_INBOX": "",
    "CLICK_ME": ""
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

# This will start an interactive setup:
? Choose your default language (en)
? What other languages do you want to support? (ko,ja)
? Where are your source files located? (./src)
? Where do you want to store translation files? (./src/locales)



# After answering the questions, it will create:
#   - config/i18n.json
#   - src/locales/en.json
#   - src/locales/ko.json

# Generated config (config/i18n.json):
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
