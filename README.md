# React Financial Charts

> **Note:** this repo is a fork of [react-stockcharts](https://github.com/rrag/react-stockcharts), renamed, converted to typescript and bug fixes applied due to the original project being unmaintained.

Charts dedicated to finance.

The aim with this project is create financial charts that work out of the box.

## Features

- integrates multiple chart types
- over 60 technical indicators and overlays
- drawing objects

### Chart types

- Scatter
- Area
- Line
- Candlestick
- OHLC
- HeikenAshi
- Renko
- Kagi
- Point & Figure

### Indicators

- EMA, SMA, WMA, TMA
- Bollinger band
- SAR
- MACD
- RSI
- ATR
- Stochastic (fast, slow, full)
- ForceIndex
- ElderRay
- Elder Impulse

### Interactive Indicators

- Trendline
- Fibonacci Retracements
- Gann Fan
- Channel
- Linear regression channel

---

## Installation

```sh
npm install react-financial-charts
```

## Documentation

> **TODO**: The examples are currently serving as docs.

## Contributing

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md)

This project is a mono-repo that uses [Lerna](https://lernajs.io/) to manage dependencies between packages.

To get started run:

```bash
git clone https://github.com/reactivemarkets/react-financial-charts.git
cd react-financial-charts
npm ci
npm run build
```

To start up a development server run:

```bash
npm start
```

## Roadmap

- [x] Convert to typescript
- [x] Bump dependencies to latest
- [x] Remove React 16 warnings
- [x] Add CI
- [x] Fix passive scrolling issues
- [x] Implement PRs from react-stockcharts
- [ ] Add all typings
- [ ] Fix issues with empty datasets
- [ ] Remove all UNSAFE methods
- [ ] Add full test suite
- [ ] Expand examples
- [ ] Generate documentation from typings
- [ ] Split project into multiple

## LICENSE

[MIT](./LICENSE)
