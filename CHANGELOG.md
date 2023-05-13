# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/markmcdowell/react-financial-charts/compare/v2.0.0...v2.0.1) (2023-05-13)

**Note:** Version bump only for package root

# [2.0.0](https://github.com/markmcdowell/react-financial-charts/compare/v1.3.2...v2.0.0) (2023-05-12)

### Bug Fixes

-   ChartCanvas no longer uses UNSAFE_componentWillReceiveProps ([a9643a2](https://github.com/markmcdowell/react-financial-charts/commit/a9643a2441d5d59a9587ef7f489613df6b0907fd))
-   Circular import causing use before initialization ([5921432](https://github.com/markmcdowell/react-financial-charts/commit/592143285d23b1b0f8f82157ea86e76f296ec73f))
-   **core:** fixing chart flickering ([9fe8cc7](https://github.com/markmcdowell/react-financial-charts/commit/9fe8cc7ec212949db46f14664e6ebe1272aa752d))
-   **core:** fixing spreading interaction props ([c6a98fb](https://github.com/markmcdowell/react-financial-charts/commit/c6a98fbed9f3c08a6f912440b056b95e72596ef0))
-   Data updates cause chart to immediately render with correct scale and data ([729d3c3](https://github.com/markmcdowell/react-financial-charts/commit/729d3c3ddbec63c18b8f6f56a780cc51a31c9b01))
-   Fixed warning from React about using getSnapshotBeforeUpdate without componentDidUpdate ([5da4fd0](https://github.com/markmcdowell/react-financial-charts/commit/5da4fd0430a916233d3e561f05f99c70266dcfac))
-   make `FibonacciRetracement` appearance prop type the same as `EachFibRetracementProps` ones ([28d324f](https://github.com/markmcdowell/react-financial-charts/commit/28d324f5f52baeb71481ccf59e1d6be0b8853c05))
-   Resolved another circular dependency ([8ac704c](https://github.com/markmcdowell/react-financial-charts/commit/8ac704c8a557413933513a2b69ff608990f168ff))
-   **utils:** bump auto sizer to resolve react 18 issues ([009d42e](https://github.com/markmcdowell/react-financial-charts/commit/009d42e67930ae80ef09b69fbdd5ae5e49b30035))

-   feat!: removing type module from package config ([c6be298](https://github.com/markmcdowell/react-financial-charts/commit/c6be298ef6e556a30644fdcad4faaf3b77a25599))

### Features

-   add yAccessor to MouseCoordinateY coordinate ([b1ddee4](https://github.com/markmcdowell/react-financial-charts/commit/b1ddee496481b73eaa35c2936d84f17895c90234))
-   Eliminated unsafe lifecycle methods, rewrote GenericComponent and GenericChartComponent ([7841001](https://github.com/markmcdowell/react-financial-charts/commit/7841001b3c88df621361f638411f359af9cbab92))
-   Migrated to new React context API ([bec345b](https://github.com/markmcdowell/react-financial-charts/commit/bec345b62153ecdf5c01380a8e29ad7398daaafd))

### BREAKING CHANGES

-   no need for extensions in imports now

## [1.3.2](https://github.com/markmcdowell/react-financial-charts/compare/v1.3.1...v1.3.2) (2021-10-17)

### Bug Fixes

-   **series:** fixing bug in CandlestickSeries ([b7201f8](https://github.com/markmcdowell/react-financial-charts/commit/b7201f882b36671400bae6ab79d6ef3ef65b9b69)), closes [#594](https://github.com/markmcdowell/react-financial-charts/issues/594)
-   do not round offset anymore ([2dc53ee](https://github.com/markmcdowell/react-financial-charts/commit/2dc53ee59056a617dd9c95b114c36ed7f0d89ab1))
-   remove rounding of x-axis location ([5cf2c13](https://github.com/markmcdowell/react-financial-charts/commit/5cf2c1389c5d7364d6241f3c83b0a37ba445cf5f))
-   remove rounding of x-axis location ([64e893f](https://github.com/markmcdowell/react-financial-charts/commit/64e893fb3a2d1c2b3f430b90572784f5c8fe02fa))
-   stop rounding offset ([7944b2d](https://github.com/markmcdowell/react-financial-charts/commit/7944b2d4dd66ccfda459011f33ba08c01db1b561))

## [1.3.1](https://github.com/markmcdowell/react-financial-charts/compare/v1.3.0...v1.3.1) (2021-06-16)

### Bug Fixes

-   do not capture wheel when pan and zoom disabled ([357383b](https://github.com/markmcdowell/react-financial-charts/commit/357383bbb823122806f6d7ec398bd885365bd908))

# [1.3.0](https://github.com/markmcdowell/react-financial-charts/compare/v1.2.2...v1.3.0) (2021-05-23)

### Bug Fixes

-   adding module to type property in package.json ([1359ac6](https://github.com/markmcdowell/react-financial-charts/commit/1359ac6e93d9638792c7bb478bba5fe1e5484a82)), closes [#520](https://github.com/markmcdowell/react-financial-charts/issues/520)

### Features

-   **series:** provide a fillStyle factory option for the AreaSeries ([b1249fa](https://github.com/markmcdowell/react-financial-charts/commit/b1249fabbd8b96f120901ba2454cdb569c38a314))

## [1.2.2](https://github.com/markmcdowell/react-financial-charts/compare/v1.2.1...v1.2.2) (2021-04-30)

### Bug Fixes

-   **interactive:** correcting props on TrendLine ([95cbb8e](https://github.com/markmcdowell/react-financial-charts/commit/95cbb8e1a2f075969815d7ecfaaa8f2251fd4f84))
-   **stories:** adding showTicks={false} to XAxis in StockChart ([4966ea7](https://github.com/markmcdowell/react-financial-charts/commit/4966ea75b1eeee3d8f718d2c68a2f7186e210d6d)), closes [#509](https://github.com/markmcdowell/react-financial-charts/issues/509)

## [1.2.1](https://github.com/markmcdowell/react-financial-charts/compare/v1.2.0...v1.2.1) (2021-04-27)

### Bug Fixes

-   **annotations:** fixing svg path annotation ([05cd1ec](https://github.com/markmcdowell/react-financial-charts/commit/05cd1ec00153add3d62ce3ce31bac1ddb78cb427)), closes [#496](https://github.com/markmcdowell/react-financial-charts/issues/496)

# [1.2.0](https://github.com/markmcdowell/react-financial-charts/compare/v1.1.0...v1.2.0) (2021-04-26)

### Features

-   **series:** adding connectNulls to AreaSeries ([d800dc5](https://github.com/markmcdowell/react-financial-charts/commit/d800dc5289387d29bc4b194a57b85c62b2ff18ed)), closes [#497](https://github.com/markmcdowell/react-financial-charts/issues/497)

# [1.1.0](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.1...v1.1.0) (2021-02-26)

### Bug Fixes

-   **series:** fixing volume profile series ([584dd26](https://github.com/markmcdowell/react-financial-charts/commit/584dd26a074756685d13ac2085667491d3b30899)), closes [#418](https://github.com/markmcdowell/react-financial-charts/issues/418)

### Features

-   adding react 17 as peer dependency ([569209b](https://github.com/markmcdowell/react-financial-charts/commit/569209b6eb00f3c93eae1b5a9e4f014c055c93c7)), closes [#468](https://github.com/markmcdowell/react-financial-charts/issues/468)

## [1.0.1](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0...v1.0.1) (2021-01-01)

### Bug Fixes

-   **core:** bug with panning on mobiles ([db34691](https://github.com/markmcdowell/react-financial-charts/commit/db34691d2bf8eb00277d6653034b3541bc75940d)), closes [#459](https://github.com/markmcdowell/react-financial-charts/issues/459)

# [1.0.0](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.16...v1.0.0) (2020-12-30)

### Bug Fixes

-   indexAccessor(d) on discontinuousTimeScaleProvider ([48270a7](https://github.com/markmcdowell/react-financial-charts/commit/48270a7591e526d5315410ba90936a31866f2ecb))

### Features

-   **deps:** moving to d3 v6 ([8d371d2](https://github.com/markmcdowell/react-financial-charts/commit/8d371d240bc7ac3db3e2f0037b3c0807e05b4749))

# [1.0.0-alpha.16](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.15...v1.0.0-alpha.16) (2020-09-04)

### Bug Fixes

-   **core:** removing colors ([ceb8217](https://github.com/markmcdowell/react-financial-charts/commit/ceb8217e9c8795787565c3baa1cedc3e693dfb4c))
-   **series:** fixing AlternateDataSeries filtering ([65e31c4](https://github.com/markmcdowell/react-financial-charts/commit/65e31c47844a25c9e10ec2f116e3e82867a37416))

# [1.0.0-alpha.15](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.14...v1.0.0-alpha.15) (2020-09-03)

### Bug Fixes

-   **coordinates:** adding half a pixel for alignment on crosshair ([d760ae4](https://github.com/markmcdowell/react-financial-charts/commit/d760ae4470d2883a6f5d5049505664ad8debb849))
-   **series:** filtering plotData on AlternateDataSeries ([2c435bf](https://github.com/markmcdowell/react-financial-charts/commit/2c435bf7f1dca36a6775c3628bbeb41f77eddd5f))

### Features

-   **stories:** adding updating data example ([8b39605](https://github.com/markmcdowell/react-financial-charts/commit/8b39605902cb0ae0db75c55bbd8086bc27a8b6be))

# [1.0.0-alpha.14](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.13...v1.0.0-alpha.14) (2020-09-02)

### Bug Fixes

-   **core:** correcting xExtents type ([d3607fe](https://github.com/markmcdowell/react-financial-charts/commit/d3607fedccda783badd2214b9d2ec27fa2faca31))
-   **core:** correcting zoom anchor types ([052981a](https://github.com/markmcdowell/react-financial-charts/commit/052981a9d7462c7c2e9bba4ae9486f1a1db14553))
-   **series:** don't stroke markers by default ([f564a8c](https://github.com/markmcdowell/react-financial-charts/commit/f564a8c7824412f5d3d2e4cc605e9351ea332f25))
-   **stories:** correcting file casing of series examples ([b2bf6d7](https://github.com/markmcdowell/react-financial-charts/commit/b2bf6d7503cb1e7a76341c2bbd0c8c6b6ad6906e))

### Features

-   **series:** adding AlternateDataSeries component ([03fbb00](https://github.com/markmcdowell/react-financial-charts/commit/03fbb00f15dfd6487e7f92aa6e1517c99d7c1d1c))

# [1.0.0-alpha.13](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.12...v1.0.0-alpha.13) (2020-09-01)

### Bug Fixes

-   **core:** correcting xextents props ([ec80146](https://github.com/markmcdowell/react-financial-charts/commit/ec80146bb171c21fd0daa41ac620b8081d6e6266))
-   **series:** small performance improvments in bar and candles ([98c06ea](https://github.com/markmcdowell/react-financial-charts/commit/98c06eab5cb9809d7f1cabff131b698c4404339d))
-   fixing scaling when data is discontinuous ([4b20255](https://github.com/markmcdowell/react-financial-charts/commit/4b20255d05b4590c2a5fc196bf505c95a63431f0))
-   **axes:** correcting tickFormat prop ([f97e9c5](https://github.com/markmcdowell/react-financial-charts/commit/f97e9c57f2a96b5f5f431a160d8fe02dc7a38e27))
-   **core:** correcting bar width with continuous scales ([a967a18](https://github.com/markmcdowell/react-financial-charts/commit/a967a18347be6b8ad11d50da579911c9bd2f97ee))
-   **core:** displayXAccessor is optional ([d6a5dda](https://github.com/markmcdowell/react-financial-charts/commit/d6a5dda949c5178a8213cabda23d1178d4ea155a))
-   **interactive:** correcting exports ([afe3ba9](https://github.com/markmcdowell/react-financial-charts/commit/afe3ba9c38a9300c720895c51b5a0d09631eace9)), closes [#440](https://github.com/markmcdowell/react-financial-charts/issues/440)
-   **series:** correcting props & dealing with undefined data ([99664ba](https://github.com/markmcdowell/react-financial-charts/commit/99664ba609692aab7b56edb81c0fec31a4922422))
-   removing canvas gradients ([2205163](https://github.com/markmcdowell/react-financial-charts/commit/220516356300c6c1c8528de3ca43e7ddaf8e5e66))

### Features

-   **core:** replaced onLoadMore with onLoadBefore & onLoadAfter ([4957c32](https://github.com/markmcdowell/react-financial-charts/commit/4957c32314db84131d3b34a8759dcc9ab28770c1))
-   **indicator:** adding algorithm indicator ([206c6a2](https://github.com/markmcdowell/react-financial-charts/commit/206c6a23061deeddfdd740237ab76ba5abdbfe40))
-   **stories:** adding custom timeFormat to scales stories ([c72b81c](https://github.com/markmcdowell/react-financial-charts/commit/c72b81c8ff4351de3a6ccb1d55c6b2c783cdd000))
-   **stories:** adding scales examples ([5cbcd9d](https://github.com/markmcdowell/react-financial-charts/commit/5cbcd9dc8c7a1624ddd197daab28bb837c9ff698))

# [1.0.0-alpha.12](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.11...v1.0.0-alpha.12) (2020-08-28)

### Bug Fixes

-   **interactive:** missing constructor to initialize state in HoverTextNearMouse ([27f410a](https://github.com/markmcdowell/react-financial-charts/commit/27f410a56a4ab87e758c55965ec162ce0066d509)), closes [#435](https://github.com/markmcdowell/react-financial-charts/issues/435)
-   **series:** BarSeries should have opacity ([7d6e414](https://github.com/markmcdowell/react-financial-charts/commit/7d6e41441ff292a0a899cf4b84738b14c0b5aa24))

# [1.0.0-alpha.11](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.10...v1.0.0-alpha.11) (2020-08-28)

### Bug Fixes

-   **coordinates:** EdgeIndicator yAccessor should allow undefined ([d0896e9](https://github.com/markmcdowell/react-financial-charts/commit/d0896e9a0e0c7de50c63a2995e8635bb8496a71a))

# [1.0.0-alpha.10](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.9...v1.0.0-alpha.10) (2020-08-28)

### Bug Fixes

-   **core:** children can be undefined or null ([17aa844](https://github.com/markmcdowell/react-financial-charts/commit/17aa844d19d87caf8b763cb07d3ea6ddc7c05d9c))
-   **core:** using type guard to check type of canvas children ([829ccfa](https://github.com/markmcdowell/react-financial-charts/commit/829ccfacd11da678a5920c37309fc991130b19ea)), closes [#417](https://github.com/markmcdowell/react-financial-charts/issues/417)
-   **stories:** tts should be date ([4c703bd](https://github.com/markmcdowell/react-financial-charts/commit/4c703bd66c9b6ccaa475f5f650bafa0189781845))
-   **utils:** setting ref to readonly ([8addf91](https://github.com/markmcdowell/react-financial-charts/commit/8addf917a7e2cb193c50521697e8e06dc3850c16))
-   correcting more props ([2b3c1e0](https://github.com/markmcdowell/react-financial-charts/commit/2b3c1e093b12131b7a4bc1ed12fd8ea4c541ac4b))
-   correcting zoomAnchor prop type ([981077b](https://github.com/markmcdowell/react-financial-charts/commit/981077b1e6e08b7c22d75842c7df90e82711e038))

# [1.0.0-alpha.9](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.8...v1.0.0-alpha.9) (2020-08-24)

### Bug Fixes

-   **stories:** correcting props on Axis story ([dc48f12](https://github.com/markmcdowell/react-financial-charts/commit/dc48f128cc006f94087b1641bd3361dfdf174f77))
-   adding more prop types ([c3985d5](https://github.com/markmcdowell/react-financial-charts/commit/c3985d5ee96fcbd5ad5a922df595d31930d0cee5))
-   **interactive:** fixing undefined bug with interactive chart ([50b1ff7](https://github.com/markmcdowell/react-financial-charts/commit/50b1ff75908765b7450b26f46d27f605bdf06f24))
-   **stories:** correcting loading intraday data ([cd7e8bd](https://github.com/markmcdowell/react-financial-charts/commit/cd7e8bd4665f2e358dd89b7de5109929615f3093))

### Features

-   **axes:** allowing tick labels without tick lines ([f0cf6b9](https://github.com/markmcdowell/react-financial-charts/commit/f0cf6b9d49a44a43e498d0d2a998cdb2956c7163))
-   adding more prop types across all components ([efefd4d](https://github.com/markmcdowell/react-financial-charts/commit/efefd4dc3000ffe5ad5e63380ab324ab1e232a67))

# [1.0.0-alpha.8](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2020-08-17)

### Bug Fixes

-   correcting prop types and docs ([198f0a5](https://github.com/markmcdowell/react-financial-charts/commit/198f0a54dae54075383c25dca67ff48d5e5a1b2a))
-   removing explict returns ([999b5ac](https://github.com/markmcdowell/react-financial-charts/commit/999b5acb8d1669406e3d8be813d831e20151c87f))
-   **tooltip:** fixing group tooltip props ([ba43c36](https://github.com/markmcdowell/react-financial-charts/commit/ba43c369d9d73dceb70c05f1fce9bbb2c45044a1))

### Features

-   exporting props from components for docs ([fbdaea5](https://github.com/markmcdowell/react-financial-charts/commit/fbdaea506730b091f4f8f6da52fc030b44d1a6e1))

# [1.0.0-alpha.7](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2020-07-26)

### Bug Fixes

-   updating prop types ([425b0b4](https://github.com/markmcdowell/react-financial-charts/commit/425b0b459de229770e7608aff4f397b9bb00de5e))

# [1.0.0-alpha.6](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.5...v1.0.0-alpha.6) (2020-07-23)

### Bug Fixes

-   **tooltip:** removing generic from SingleValueTooltip ([8035b85](https://github.com/markmcdowell/react-financial-charts/commit/8035b85c5df72f6076b778fb2c3bbef6f3d1d7a6))

# [1.0.0-alpha.5](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2020-07-23)

### Bug Fixes

-   **tooltip:** removing unknown from SingleValueTooltip ([1d6796c](https://github.com/markmcdowell/react-financial-charts/commit/1d6796c96a30f2e127847fb46dae0928a53d74a4))

### Features

-   **tooltip:** adding change to ohlc tooltip ([bc38b73](https://github.com/markmcdowell/react-financial-charts/commit/bc38b7387270837276739ba1e77832053ddf8769))

# [1.0.0-alpha.4](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2020-07-19)

### Bug Fixes

-   **utils:** @types/react-virtualized-auto-sizer is required as a dependency ([fa9e5ed](https://github.com/markmcdowell/react-financial-charts/commit/fa9e5ed801fa464d6efe283aaf4026272e71b352))

# [1.0.0-alpha.3](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2020-07-19)

### Bug Fixes

-   **utils:** re-exporting AutoSizerProps ([3615c6c](https://github.com/markmcdowell/react-financial-charts/commit/3615c6c26892c1692a8b517e321287a6d2b246a5))

# [1.0.0-alpha.2](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2020-07-15)

**Note:** Version bump only for package root

# [1.0.0-alpha.1](https://github.com/markmcdowell/react-financial-charts/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2020-07-10)

### Bug Fixes

-   correcting casing of StockChart.tsx ([0e1b11d](https://github.com/markmcdowell/react-financial-charts/commit/0e1b11d973be5fd0f028fc399cdef95b7c195108))
-   **core:** CanvasContainer is now a PureComponent ([ec4c43e](https://github.com/markmcdowell/react-financial-charts/commit/ec4c43e2a15dbf50d60d9547633c4dab44398fe5))
-   **core:** fixing issues with empty data sets ([23c2458](https://github.com/markmcdowell/react-financial-charts/commit/23c2458bfe55e97eef96f80030fe32b9cf5ac1e1))
-   **core:** fixing re-rendering of svg components ([af0f156](https://github.com/markmcdowell/react-financial-charts/commit/af0f156c66cd302ec8a45ff6c49e4121385b3ca9))

### Features

-   **core:** adding onDoubleClick to Chart ([1b6498b](https://github.com/markmcdowell/react-financial-charts/commit/1b6498b2fba108d930004ddbaaea6573692a1fb4))

# [1.0.0-alpha.0](https://github.com/markmcdowell/react-financial-charts/compare/v0.5.1...v1.0.0-alpha.0) (2020-07-08)

### Bug Fixes

-   **core:** only draw canvas if the draw function is defined ([354eb54](https://github.com/markmcdowell/react-financial-charts/commit/354eb5448b8b09dfea1d4515829af4172da9dcc0))

-   feat!: separating code into packages ([670537f](https://github.com/markmcdowell/react-financial-charts/commit/670537fa280dddfbe921639a8e22a7c11d14e5f3))

### BREAKING CHANGES

-   first stage of refactor breaking the code down.

## [0.5.1](https://github.com/markmcdowell/react-financial-charts/compare/v0.5.0...v0.5.1) (2020-01-08)

### Bug Fixes

-   **charts:** fixing gridlines when the axis is on the left or top ([61d5e7b](https://github.com/markmcdowell/react-financial-charts/commit/61d5e7b0225bb8c317cf04484f9a279341eb1791))

# [0.5.0](https://github.com/markmcdowell/react-financial-charts/compare/v0.4.1...v0.5.0) (2020-01-07)

### Features

-   **charts:** adding showGridLines prop to axis ([2c0f7fe](https://github.com/markmcdowell/react-financial-charts/commit/2c0f7fe14b7afa95bdec4165443c3090db3d0c81))
-   **charts:** default tooltip value can be changed ([f19ec61](https://github.com/markmcdowell/react-financial-charts/commit/f19ec6144024dd8660212d28758ec751e7f4b0f7))
-   **charts:** tweaking default mouse coordinate fill ([ead5c1a](https://github.com/markmcdowell/react-financial-charts/commit/ead5c1a7f85a2d11d10d12a5a45ff4b49d0dfb15))

## [0.4.1](https://github.com/markmcdowell/react-financial-charts/compare/v0.4.0...v0.4.1) (2019-12-17)

### Bug Fixes

-   **charts:** getXTicks is incorrectly doing a greater than ([80e5739](https://github.com/markmcdowell/react-financial-charts/commit/80e5739f3c3c2aff1bfbe310e3f74c71f50a3058))
-   **charts:** including src folder in the package for source maps ([632a699](https://github.com/markmcdowell/react-financial-charts/commit/632a699e003363df8737a7fa5214707b6a70cc24))

# [0.4.0](https://github.com/markmcdowell/react-financial-charts/compare/v0.3.3...v0.4.0) (2019-12-16)

### Bug Fixes

-   **charts:** edge coordinates can now use rectWidth ([5b0a20b](https://github.com/markmcdowell/react-financial-charts/commit/5b0a20b6858f2cbbc915c2980275cdb73f568556))
-   **charts:** fixing coordinates component props ([1fca524](https://github.com/markmcdowell/react-financial-charts/commit/1fca5244173bea5438a19eac061df9e0505fe246))
-   **charts:** modifying axis ticks based on height and width ([94efee1](https://github.com/markmcdowell/react-financial-charts/commit/94efee14467d663caf2f04eddeb52e0cae2701d7))

### Features

-   **charts:** updated zoom buttons styling ([d3c1bbb](https://github.com/markmcdowell/react-financial-charts/commit/d3c1bbb9eea624aead45684ca2cbbfca0cccdb5f))

## [0.3.3](https://github.com/markmcdowell/react-financial-charts/compare/v0.3.2...v0.3.3) (2019-11-27)

### Bug Fixes

-   **charts:** updating default time formats ([6670952](https://github.com/markmcdowell/react-financial-charts/commit/667095253dda726de9de0d93fc71ea830fcecab6))

## [0.3.2](https://github.com/markmcdowell/react-financial-charts/compare/v0.3.1...v0.3.2) (2019-11-21)

### Bug Fixes

-   **docs:** fixing version of find-cache-dir due to breaking change ([ade1051](https://github.com/markmcdowell/react-financial-charts/commit/ade10519c7c10d42e79f3bf744a276ac596c1da8))
-   **docs:** the package-lock.json is incorrect ([3759cc6](https://github.com/markmcdowell/react-financial-charts/commit/3759cc643b0902e20a201091b5b5a8fdd1b456d8)), closes [#131](https://github.com/markmcdowell/react-financial-charts/issues/131)

## [0.3.1](https://github.com/markmcdowell/react-financial-charts/compare/v0.3.0...v0.3.1) (2019-10-14)

### Bug Fixes

-   lineDash was incorrect for canvas when set to None ([5ff3134](https://github.com/markmcdowell/react-financial-charts/commit/5ff3134))
-   **charts:** reversing scroll direction on touch devices and trackpads ([e12ce7c](https://github.com/markmcdowell/react-financial-charts/commit/e12ce7c)), closes [#57](https://github.com/markmcdowell/react-financial-charts/issues/57)
-   **coordinates:** edge coordinates now go right up to the axis ([ba44493](https://github.com/markmcdowell/react-financial-charts/commit/ba44493))

# [0.3.0](https://github.com/markmcdowell/react-financial-charts/compare/v0.2.3...v0.3.0) (2019-10-04)

### Bug Fixes

-   **charts:** arrowWidth was being ignored ([dce50aa](https://github.com/markmcdowell/react-financial-charts/commit/dce50aa)), closes [#75](https://github.com/markmcdowell/react-financial-charts/issues/75)
-   **docs:** storybook requires an ordering to properties ([75186ef](https://github.com/markmcdowell/react-financial-charts/commit/75186ef))
-   **github:** setting stale label to be stale ([4c5a0e1](https://github.com/markmcdowell/react-financial-charts/commit/4c5a0e1))

### Features

-   **types:** adding more types for calculators and indicators ([3d52cf4](https://github.com/markmcdowell/react-financial-charts/commit/3d52cf4))

## [0.2.3](https://github.com/markmcdowell/react-financial-charts/compare/v0.2.2...v0.2.3) (2019-09-26)

### Bug Fixes

-   **interaction:** correcting scroll behavior when interaction is disabled ([1e32380](https://github.com/markmcdowell/react-financial-charts/commit/1e32380))

## [0.2.2](https://github.com/markmcdowell/react-financial-charts/compare/v0.2.1...v0.2.2) (2019-09-19)

### Bug Fixes

-   **ohlc:** Add option to display the last item as default ([c23b676](https://github.com/markmcdowell/react-financial-charts/commit/c23b676))
-   **props:** correcting more props ([4942299](https://github.com/markmcdowell/react-financial-charts/commit/4942299))
-   **props:** correcting more props ([f22fb3c](https://github.com/markmcdowell/react-financial-charts/commit/f22fb3c))

## [0.2.1](https://github.com/markmcdowell/react-financial-charts/compare/v0.2.0...v0.2.1) (2019-09-14)

### Bug Fixes

-   **bollinger:** correcting props ([91d7f60](https://github.com/markmcdowell/react-financial-charts/commit/91d7f60))
-   **ohlc:** correcting props ([86bb4b2](https://github.com/markmcdowell/react-financial-charts/commit/86bb4b2))

# [0.2.0](https://github.com/markmcdowell/react-financial-charts/compare/v0.1.5...v0.2.0) (2019-09-12)

### Bug Fixes

-   **axis:** only allow zoom if the ticks are showing ([fb96940](https://github.com/markmcdowell/react-financial-charts/commit/fb96940))

### Features

-   **elder-ray:** allowing stroke dash to be set on the zero line ([71e9a9b](https://github.com/markmcdowell/react-financial-charts/commit/71e9a9b))

## [0.1.5](https://github.com/markmcdowell/react-financial-charts/compare/v0.1.4...v0.1.5) (2019-09-11)

### Bug Fixes

-   **axis:** adding strokeOpacity and missing props ([7870a36](https://github.com/markmcdowell/react-financial-charts/commit/7870a36)), closes [#29](https://github.com/markmcdowell/react-financial-charts/issues/29)
-   **axis:** axisAt and orient now have defaults ([509fab1](https://github.com/markmcdowell/react-financial-charts/commit/509fab1)), closes [#31](https://github.com/markmcdowell/react-financial-charts/issues/31)
-   **colors:** alpha channel is now used if rgba is used ([0c3e2d5](https://github.com/markmcdowell/react-financial-charts/commit/0c3e2d5)), closes [#27](https://github.com/markmcdowell/react-financial-charts/issues/27)
-   **coordinates:** updating default fill to [#37474](https://github.com/markmcdowell/react-financial-charts/issues/37474)F ([7b8362a](https://github.com/markmcdowell/react-financial-charts/commit/7b8362a)), closes [#30](https://github.com/markmcdowell/react-financial-charts/issues/30)

## [0.1.4](https://github.com/markmcdowell/react-financial-charts/compare/v0.1.3...v0.1.4) (2019-09-10)

### Bug Fixes

-   correcting types from ChartCanvas ([a99551f](https://github.com/markmcdowell/react-financial-charts/commit/a99551f))

## [0.1.3](https://github.com/markmcdowell/react-financial-charts/compare/v0.1.2...v0.1.3) (2019-09-10)

### Bug Fixes

-   ChartCanvas type is now optional ([22365a2](https://github.com/markmcdowell/react-financial-charts/commit/22365a2))
-   correcting and adding types to props ([aa98bd3](https://github.com/markmcdowell/react-financial-charts/commit/aa98bd3))

## [0.1.2](https://github.com/markmcdowell/react-financial-charts/compare/v0.1.1...v0.1.2) (2019-09-10)

### Bug Fixes

-   interfaces from withDeviceRatio need to be public ([6850ab1](https://github.com/markmcdowell/react-financial-charts/commit/6850ab1))

## [0.1.1](https://github.com/markmcdowell/react-financial-charts/compare/v0.1.0...v0.1.1) (2019-09-09)

### Bug Fixes

-   adding missing readme from package ([1f38c35](https://github.com/markmcdowell/react-financial-charts/commit/1f38c35))
-   specifing release branch as master ([acd2982](https://github.com/markmcdowell/react-financial-charts/commit/acd2982))

# 0.1.0 (2019-09-08)

### Bug Fixes

-   correcting color rendering for SAR svg ([660b9f4](https://github.com/markmcdowell/react-financial-charts/commit/660b9f4))
-   correcting sliding window implmentation ([abcd953](https://github.com/markmcdowell/react-financial-charts/commit/abcd953))
-   disabling passive scrolling for mouse wheel ([7efbcba](https://github.com/markmcdowell/react-financial-charts/commit/7efbcba))
-   fixing axis zoom ([afc8778](https://github.com/markmcdowell/react-financial-charts/commit/afc8778))
-   fixing various issues with drawing ([357227c](https://github.com/markmcdowell/react-financial-charts/commit/357227c))
-   **candlestick:** candles should have a minimum height of 1 ([8a37874](https://github.com/markmcdowell/react-financial-charts/commit/8a37874))
-   removing readme from examples package ([079b6c2](https://github.com/markmcdowell/react-financial-charts/commit/079b6c2))

### Features

-   adding support for rgab, color and hex ([df1ad7c](https://github.com/markmcdowell/react-financial-charts/commit/df1ad7c))
-   initial conversion to typescript ([9666923](https://github.com/markmcdowell/react-financial-charts/commit/9666923))
-   moving examples to storybook ([3ce0955](https://github.com/markmcdowell/react-financial-charts/commit/3ce0955))
