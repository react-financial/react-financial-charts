# React Financial Charts

[![CircleCI](https://circleci.com/gh/reactivemarkets/react-financial-charts/tree/master.svg?style=shield)](https://circleci.com/gh/reactivemarkets/react-financial-charts/tree/master)
[![codecov](https://codecov.io/gh/reactivemarkets/react-financial-charts/branch/master/graph/badge.svg)](https://codecov.io/gh/reactivemarkets/react-financial-charts)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=reactivemarkets/react-financial-charts)](https://dependabot.com) [![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/reactivemarkets/react-financial-charts/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/react-financial-charts.svg?style=flat)](https://www.npmjs.com/package/react-financial-charts)

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

[Stories](https://reactivemarkets.github.io/react-financial-charts/)

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
- [x] Add all typings
- [x] Move examples to storybook
- [ ] Correct all class props
- [ ] Fix issues with empty datasets
- [ ] Migrate to new React Context API
- [ ] Remove all UNSAFE methods
- [ ] Add all series' to storybook
- [ ] Add documentation to storybook
- [ ] Add full test suite
- [ ] Split project into multiple packages

## LICENSE

[MIT](./LICENSE)
