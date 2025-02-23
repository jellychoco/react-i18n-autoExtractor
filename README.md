# react-i18n-auto

Automatic internationalization (i18n) management tool for React applications.

## Features

- Automatic translation key extraction from source code
- Automatic JSX text node transformation
- Custom component support
- Props (attributes) auto-translation
- Built-in caching system
- TypeScript support

## Installation

```bash
npm install react-i18n-auto
```

## Usage

### 1. Initialize Configuration

```bash
npx react-i18n-auto init
```

This command creates a `config/i18n.json` configuration file:

```json
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

### 2. Babel Plugin Setup

Add the plugin to your `.babelrc` or `babel.config.js`:

```json
{
    "plugins": ["react-i18n-auto/babel"]
}
```

### 3. Extract Translation Keys

```bash
npx react-i18n-auto extract
```

### 4. Usage in Code

```typescript
import { i18n } from 'react-i18n-auto';

// Basic usage
function Welcome() {
    return <h1>{i18n.t("HELLO")}</h1>;
}

// Using parameters
function UserProfile({ name, role, lastLogin }) {
    return (
        <div>
            <h2>{i18n.t("WELCOME_USER", { name })}</h2>
            <p>{i18n.t("USER_ROLE", { role })}</p>
            <span>{i18n.t("LAST_LOGIN", { date: lastLogin })}</span>
        </div>
    );
}

// Before transformation:
function UserGreeting({ name, count }) {
    return (
        <div>
            <h1>Welcome back, {{name}}!</h1>
            <p>You have {{count}} new messages</p>
            <span>Last visited: {{date}}</span>
        </div>
    );
}

// After transformation:
function UserGreeting({ name, count }) {
    return (
        <div>
            <h1>{i18n.t('WELCOME_BACK', { name })}</h1>
            <p>{i18n.t('NEW_MESSAGES', { count })}</p>
            <span>{i18n.t('LAST_VISITED', { date: new Date().toLocaleDateString() })}</span>
        </div>
    );
}

// Translation file (ko.json):
{
    "WELCOME_BACK": "다시 오셨네요, {{name}}님!",
    "NEW_MESSAGES": "{{count}}개의 새로운 메시지가 있습니다",
    "LAST_VISITED": "마지막 방문: {{date}}"
}

// Translation file (en.json):
{
    "WELCOME_BACK": "Welcome back, {{name}}!",
    "NEW_MESSAGES": "You have {{count}} new messages",
    "LAST_VISITED": "Last visited: {{date}}"
}

// Change language
i18n.setLanguage('ko');

// Event listener
i18n.onLanguageChange(() => {
    console.log('Language changed to:', i18n.getLanguage());
});
```

### Automatic Transformation Example

Source code:

```jsx
function App() {
    return (
        <div>
            <h1>Hello World</h1>
            <CustomButton>Click me</CustomButton>
            <input placeholder="Enter your name" />
        </div>
    );
}
```

Transformed code:

```jsx
function App() {
    return (
        <div>
            <h1>{i18n.t('HELLO_WORLD')}</h1>
            <CustomButton>{i18n.t('CLICK_ME')}</CustomButton>
            <input placeholder={i18n.t('ENTER_YOUR_NAME')} />
        </div>
    );
}
```

## CLI Commands

- `init`: Initialize project
- `extract`: Extract translation keys
- `sync`: Synchronize translation files
- `check`: Check for missing translations
- `check-duplicates`: Check for duplicate keys
- `check-unused`: Check for unused keys
- `exclusion`: Manage translation exclusion rules
- `clean`: Remove unused translations

## Features

- Automatic text node transformation
- Custom component support
- Nested component support (e.g., `<Card.Header>`)
- Automatic attribute translation
- Performance optimization with caching
- Type safety with TypeScript

## Configuration Options

| Option           | Description                        | Default         |
| ---------------- | ---------------------------------- | --------------- |
| sourceDir        | Source code directory              | "./src"         |
| localesDir       | Translation files directory        | "./src/locales" |
| defaultLocale    | Default language                   | "en"            |
| supportedLocales | Supported languages                | ["en"]          |
| keyGeneration    | Key generation ("text" \| "hash")  | "text"          |
| outputFormat     | Output format ("flat" \| "nested") | "flat"          |
| ignorePatterns   | Patterns to ignore                 | []              |

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/react-i18n-auto.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Issues

If you find any bugs or have feature requests, please create an issue in the [Issues](https://github.com/yourusername/react-i18n-auto/issues) section.
