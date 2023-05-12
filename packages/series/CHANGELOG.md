# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.3.2...v2.0.0) (2023-05-12)

### Bug Fixes

-   **core:** fixing chart flickering ([9fe8cc7](https://github.com/reactivemarkets/react-financial-charts/commit/9fe8cc7ec212949db46f14664e6ebe1272aa752d))
-   Data updates cause chart to immediately render with correct scale and data ([729d3c3](https://github.com/reactivemarkets/react-financial-charts/commit/729d3c3ddbec63c18b8f6f56a780cc51a31c9b01))

-   feat!: removing type module from package config ([c6be298](https://github.com/reactivemarkets/react-financial-charts/commit/c6be298ef6e556a30644fdcad4faaf3b77a25599))

### Features

-   Eliminated unsafe lifecycle methods, rewrote GenericComponent and GenericChartComponent ([7841001](https://github.com/reactivemarkets/react-financial-charts/commit/7841001b3c88df621361f638411f359af9cbab92))
-   Migrated to new React context API ([bec345b](https://github.com/reactivemarkets/react-financial-charts/commit/bec345b62153ecdf5c01380a8e29ad7398daaafd))

### BREAKING CHANGES

-   no need for extensions in imports now

## [1.3.2](https://github.com/reactivemarkets/react-financial-charts/compare/v1.3.1...v1.3.2) (2021-10-17)

### Bug Fixes

-   **series:** fixing bug in CandlestickSeries ([b7201f8](https://github.com/reactivemarkets/react-financial-charts/commit/b7201f882b36671400bae6ab79d6ef3ef65b9b69)), closes [#594](https://github.com/reactivemarkets/react-financial-charts/issues/594)
-   do not round offset anymore ([2dc53ee](https://github.com/reactivemarkets/react-financial-charts/commit/2dc53ee59056a617dd9c95b114c36ed7f0d89ab1))
-   remove rounding of x-axis location ([5cf2c13](https://github.com/reactivemarkets/react-financial-charts/commit/5cf2c1389c5d7364d6241f3c83b0a37ba445cf5f))
-   remove rounding of x-axis location ([64e893f](https://github.com/reactivemarkets/react-financial-charts/commit/64e893fb3a2d1c2b3f430b90572784f5c8fe02fa))
-   stop rounding offset ([7944b2d](https://github.com/reactivemarkets/react-financial-charts/commit/7944b2d4dd66ccfda459011f33ba08c01db1b561))

## [1.3.1](https://github.com/reactivemarkets/react-financial-charts/compare/v1.3.0...v1.3.1) (2021-06-16)

**Note:** Version bump only for package @react-financial-charts/series

# [1.3.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.2.2...v1.3.0) (2021-05-23)

### Bug Fixes

-   adding module to type property in package.json ([1359ac6](https://github.com/reactivemarkets/react-financial-charts/commit/1359ac6e93d9638792c7bb478bba5fe1e5484a82)), closes [#520](https://github.com/reactivemarkets/react-financial-charts/issues/520)

### Features

-   **series:** provide a fillStyle factory option for the AreaSeries ([b1249fa](https://github.com/reactivemarkets/react-financial-charts/commit/b1249fabbd8b96f120901ba2454cdb569c38a314))

# [1.2.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.1.0...v1.2.0) (2021-04-26)

### Features

-   **series:** adding connectNulls to AreaSeries ([d800dc5](https://github.com/reactivemarkets/react-financial-charts/commit/d800dc5289387d29bc4b194a57b85c62b2ff18ed)), closes [#497](https://github.com/reactivemarkets/react-financial-charts/issues/497)

# [1.1.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.1...v1.1.0) (2021-02-26)

### Bug Fixes

-   **series:** fixing volume profile series ([584dd26](https://github.com/reactivemarkets/react-financial-charts/commit/584dd26a074756685d13ac2085667491d3b30899)), closes [#418](https://github.com/reactivemarkets/react-financial-charts/issues/418)

### Features

-   adding react 17 as peer dependency ([569209b](https://github.com/reactivemarkets/react-financial-charts/commit/569209b6eb00f3c93eae1b5a9e4f014c055c93c7)), closes [#468](https://github.com/reactivemarkets/react-financial-charts/issues/468)

## [1.0.1](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0...v1.0.1) (2021-01-01)

**Note:** Version bump only for package @react-financial-charts/series

# [1.0.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.16...v1.0.0) (2020-12-30)

### Features

-   **deps:** moving to d3 v6 ([8d371d2](https://github.com/reactivemarkets/react-financial-charts/commit/8d371d240bc7ac3db3e2f0037b3c0807e05b4749))

# [1.0.0-alpha.16](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.15...v1.0.0-alpha.16) (2020-09-04)

### Bug Fixes

-   **series:** fixing AlternateDataSeries filtering ([65e31c4](https://github.com/reactivemarkets/react-financial-charts/commit/65e31c47844a25c9e10ec2f116e3e82867a37416))

# [1.0.0-alpha.15](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.14...v1.0.0-alpha.15) (2020-09-03)

### Bug Fixes

-   **series:** filtering plotData on AlternateDataSeries ([2c435bf](https://github.com/reactivemarkets/react-financial-charts/commit/2c435bf7f1dca36a6775c3628bbeb41f77eddd5f))

# [1.0.0-alpha.14](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.13...v1.0.0-alpha.14) (2020-09-02)

### Bug Fixes

-   **series:** don't stroke markers by default ([f564a8c](https://github.com/reactivemarkets/react-financial-charts/commit/f564a8c7824412f5d3d2e4cc605e9351ea332f25))

### Features

-   **series:** adding AlternateDataSeries component ([03fbb00](https://github.com/reactivemarkets/react-financial-charts/commit/03fbb00f15dfd6487e7f92aa6e1517c99d7c1d1c))

# [1.0.0-alpha.13](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.12...v1.0.0-alpha.13) (2020-09-01)

### Bug Fixes

-   **series:** correcting props & dealing with undefined data ([99664ba](https://github.com/reactivemarkets/react-financial-charts/commit/99664ba609692aab7b56edb81c0fec31a4922422))
-   **series:** small performance improvments in bar and candles ([98c06ea](https://github.com/reactivemarkets/react-financial-charts/commit/98c06eab5cb9809d7f1cabff131b698c4404339d))
-   removing canvas gradients ([2205163](https://github.com/reactivemarkets/react-financial-charts/commit/220516356300c6c1c8528de3ca43e7ddaf8e5e66))

# [1.0.0-alpha.12](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.11...v1.0.0-alpha.12) (2020-08-28)

### Bug Fixes

-   **series:** BarSeries should have opacity ([7d6e414](https://github.com/reactivemarkets/react-financial-charts/commit/7d6e41441ff292a0a899cf4b84738b14c0b5aa24))

# [1.0.0-alpha.10](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.9...v1.0.0-alpha.10) (2020-08-28)

### Bug Fixes

-   correcting more props ([2b3c1e0](https://github.com/reactivemarkets/react-financial-charts/commit/2b3c1e093b12131b7a4bc1ed12fd8ea4c541ac4b))

# [1.0.0-alpha.9](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.8...v1.0.0-alpha.9) (2020-08-24)

### Features

-   adding more prop types across all components ([efefd4d](https://github.com/reactivemarkets/react-financial-charts/commit/efefd4dc3000ffe5ad5e63380ab324ab1e232a67))

# [1.0.0-alpha.8](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2020-08-17)

### Bug Fixes

-   correcting prop types and docs ([198f0a5](https://github.com/reactivemarkets/react-financial-charts/commit/198f0a54dae54075383c25dca67ff48d5e5a1b2a))
-   removing explict returns ([999b5ac](https://github.com/reactivemarkets/react-financial-charts/commit/999b5acb8d1669406e3d8be813d831e20151c87f))

### Features

-   exporting props from components for docs ([fbdaea5](https://github.com/reactivemarkets/react-financial-charts/commit/fbdaea506730b091f4f8f6da52fc030b44d1a6e1))

# [1.0.0-alpha.7](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2020-07-26)

### Bug Fixes

-   updating prop types ([425b0b4](https://github.com/reactivemarkets/react-financial-charts/commit/425b0b459de229770e7608aff4f397b9bb00de5e))

# [1.0.0-alpha.1](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2020-07-10)

### Bug Fixes

-   **core:** fixing issues with empty data sets ([23c2458](https://github.com/reactivemarkets/react-financial-charts/commit/23c2458bfe55e97eef96f80030fe32b9cf5ac1e1))

# [1.0.0-alpha.0](https://github.com/reactivemarkets/react-financial-charts/compare/v0.5.1...v1.0.0-alpha.0) (2020-07-08)

-   feat!: separating code into packages ([670537f](https://github.com/reactivemarkets/react-financial-charts/commit/670537fa280dddfbe921639a8e22a7c11d14e5f3))

### BREAKING CHANGES

-   first stage of refactor breaking the code down.
