# 🎮 Business Card Breakout

Transform your business card into an interactive breakout game! A fun and creative way to showcase your contact information on your website or portfolio.

[![npm version](https://img.shields.io/npm/v/business-card-breakout.svg)](https://www.npmjs.com/package/business-card-breakout)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **Interactive Breakout Game** - Classic arcade gameplay with your business card
- 🎨 **Three Layout Styles** - Professional, Standard, and Minimal
- 🌐 **Multi-language Support** - Works with Japanese, English, and other languages
- 📱 **Responsive Design** - Adapts to any screen size
- ⚡ **Lightweight** - Only ~24KB (minified UMD)
- 🔧 **Highly Customizable** - Adjust game physics, colors, and behavior
- 🚀 **Easy Integration** - One line of code to get started

## 🚀 Quick Start

### Via CDN (Easiest)

```
<div id="game-container"></div>

<script src="https://cdn.jsdelivr.net/npm/business-card-breakout@latest/dist/index.umd.js"></script>
<script>
  const engine = BusinessCardBreakout.initializeGame(
    'game-container',
    {
      name: 'Your Name',
      title: 'Your Title',
      company: 'Your Company',
      email: 'your@email.com'
    },
    BusinessCardBreakout.DEFAULT_GAME_CONFIG,
    'standard',
    false
  );
  
  engine.start();
</script>
```

### Via npm

```
npm install business-card-breakout
```

```
import { initializeGame, DEFAULT_GAME_CONFIG } from 'business-card-breakout';

const engine = initializeGame(
  'game-container',
  {
    name: 'Your Name',
    title: 'Your Title',
    company: 'Your Company',
    email: 'your@email.com'
  },
  DEFAULT_GAME_CONFIG,
  'standard',
  false
);

engine.start();
```

## 📖 Documentation

### Business Card Configuration

```
{
  name: string;           // Required: Your name
  nameEn?: string;        // Optional: English name (for non-English names)
  title: string;          // Required: Your job title
  tagline?: string;       // Optional: Personal tagline or catchphrase
  company: string;        // Required: Company name
  email: string;          // Required: Email address
  phone?: string;         // Optional: Phone number
  sns?: string;           // Optional: SNS handle or URL
  website?: string;       // Optional: Website URL
}
```

### Layout Options

- `'professional'` - Full layout with all fields including SNS
- `'standard'` - Traditional business card layout
- `'minimal'` - Clean, essential information only

### Game Configuration

```
{
  ballSpeed: number;           // Ball movement speed (default: 10)
  ballRadius: number;          // Ball size in pixels (default: 12)
  paddleSpeed: number;         // Paddle movement speed (default: 12)
  paddleWidthRatio: number;    // Paddle width ratio (default: 0.2)
  paddleHeight: number;        // Paddle height in pixels (default: 4)
  blockRecoveryTime: number;   // Block respawn time in ms (default: 10000)
  effectDuration: number;      // Effect animation duration in ms (default: 5000)
  destructionRadius: number;   // Destruction area radius (default: 30)
  gravity: number;             // Vertical acceleration (default: 0)
  friction: number;            // Ball velocity retention (default: 1.0)
}
```

## 🎨 Examples

### Japanese Business Card (Full)

```
const engine = initializeGame('game', {
  name: '山田 太郎',
  nameEn: 'Taro Yamada',
  title: 'シニアソフトウェアエンジニア',
  tagline: '未来を創るコードを書く',
  company: 'テックコーポレーション',
  email: 'taro.yamada@example.com',
  phone: '+81-90-1234-5678',
  sns: '@taroy_dev',
  website: 'yamada-tech.example'
}, DEFAULT_GAME_CONFIG, 'professional', false);

engine.start();
```

### English Business Card (Minimal)

```
const engine = initializeGame('game', {
  name: 'Jane Smith',
  title: 'Product Manager',
  company: 'Innovation Labs',
  email: 'jane@example.com'
}, DEFAULT_GAME_CONFIG, 'minimal', false);

engine.start();
```

## 🛠️ API Reference

### `initializeGame(containerId, businessCard, gameConfig, layout, autoStart)`

- **containerId** `string` - DOM element ID for the game container
- **businessCard** `Partial<BusinessCardInfo>` - Your business card information
- **gameConfig** `Partial<GameConfig>` - Game configuration (use `DEFAULT_GAME_CONFIG` for defaults)
- **layout** `'professional' | 'standard' | 'minimal'` - Card layout style
- **autoStart** `boolean` - Whether to start automatically (recommended: `false`)

### Game Engine Methods

```
engine.start();     // Start the game
engine.stop();      // Stop the game
engine.pause();     // Pause the game
engine.resume();    // Resume the game
```

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Package Size

- **UMD (CDN)**: ~24.9 KB
- **ES Module**: ~51.6 KB
- **TypeScript Types**: Included

## 📄 License

MIT © [Curion Lab](https://github.com/curionlab)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [GitHub Repository](https://github.com/curionlab/business-card-breakout)
- [npm Package](https://www.npmjs.com/package/business-card-breakout)
- [CDN (jsDelivr)](https://cdn.jsdelivr.net/npm/business-card-breakout@latest/)
- [Examples](https://github.com/curionlab/business-card-breakout/tree/main/examples)

## 🎯 Use Cases

Perfect for:
- 💼 Portfolio websites
- 🎪 Networking events
- 🎨 Creative presentations
- 📧 Email signatures (with link)
- 🌐 Personal branding

---

Made with ❤️ by [Curion Lab](https://www.curionlab.com/)

