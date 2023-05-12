# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.3.2...v2.0.0) (2023-05-12)

### Bug Fixes

-   ChartCanvas no longer uses UNSAFE_componentWillReceiveProps ([a9643a2](https://github.com/reactivemarkets/react-financial-charts/commit/a9643a2441d5d59a9587ef7f489613df6b0907fd))
-   Circular import causing use before initialization ([5921432](https://github.com/reactivemarkets/react-financial-charts/commit/592143285d23b1b0f8f82157ea86e76f296ec73f))
-   **core:** fixing chart flickering ([9fe8cc7](https://github.com/reactivemarkets/react-financial-charts/commit/9fe8cc7ec212949db46f14664e6ebe1272aa752d))
-   **core:** fixing spreading interaction props ([c6a98fb](https://github.com/reactivemarkets/react-financial-charts/commit/c6a98fbed9f3c08a6f912440b056b95e72596ef0))
-   Data updates cause chart to immediately render with correct scale and data ([729d3c3](https://github.com/reactivemarkets/react-financial-charts/commit/729d3c3ddbec63c18b8f6f56a780cc51a31c9b01))
-   Fixed warning from React about using getSnapshotBeforeUpdate without componentDidUpdate ([5da4fd0](https://github.com/reactivemarkets/react-financial-charts/commit/5da4fd0430a916233d3e561f05f99c70266dcfac))
-   Resolved another circular dependency ([8ac704c](https://github.com/reactivemarkets/react-financial-charts/commit/8ac704c8a557413933513a2b69ff608990f168ff))

-   feat!: removing type module from package config ([c6be298](https://github.com/reactivemarkets/react-financial-charts/commit/c6be298ef6e556a30644fdcad4faaf3b77a25599))

### Features

-   Eliminated unsafe lifecycle methods, rewrote GenericComponent and GenericChartComponent ([7841001](https://github.com/reactivemarkets/react-financial-charts/commit/7841001b3c88df621361f638411f359af9cbab92))
-   Migrated to new React context API ([bec345b](https://github.com/reactivemarkets/react-financial-charts/commit/bec345b62153ecdf5c01380a8e29ad7398daaafd))

### BREAKING CHANGES

-   no need for extensions in imports now

## [1.3.1](https://github.com/reactivemarkets/react-financial-charts/compare/v1.3.0...v1.3.1) (2021-06-16)

### Bug Fixes

-   do not capture wheel when pan and zoom disabled ([357383b](https://github.com/reactivemarkets/react-financial-charts/commit/357383bbb823122806f6d7ec398bd885365bd908))

# [1.3.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.2.2...v1.3.0) (2021-05-23)

### Bug Fixes

-   adding module to type property in package.json ([1359ac6](https://github.com/reactivemarkets/react-financial-charts/commit/1359ac6e93d9638792c7bb478bba5fe1e5484a82)), closes [#520](https://github.com/reactivemarkets/react-financial-charts/issues/520)

# [1.1.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.1...v1.1.0) (2021-02-26)

### Features

-   adding react 17 as peer dependency ([569209b](https://github.com/reactivemarkets/react-financial-charts/commit/569209b6eb00f3c93eae1b5a9e4f014c055c93c7)), closes [#468](https://github.com/reactivemarkets/react-financial-charts/issues/468)

## [1.0.1](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0...v1.0.1) (2021-01-01)

### Bug Fixes

-   **core:** bug with panning on mobiles ([db34691](https://github.com/reactivemarkets/react-financial-charts/commit/db34691d2bf8eb00277d6653034b3541bc75940d)), closes [#459](https://github.com/reactivemarkets/react-financial-charts/issues/459)

# [1.0.0](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.16...v1.0.0) (2020-12-30)

### Features

-   **deps:** moving to d3 v6 ([8d371d2](https://github.com/reactivemarkets/react-financial-charts/commit/8d371d240bc7ac3db3e2f0037b3c0807e05b4749))

# [1.0.0-alpha.16](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.15...v1.0.0-alpha.16) (2020-09-04)

### Bug Fixes

-   **core:** removing colors ([ceb8217](https://github.com/reactivemarkets/react-financial-charts/commit/ceb8217e9c8795787565c3baa1cedc3e693dfb4c))

# [1.0.0-alpha.15](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.14...v1.0.0-alpha.15) (2020-09-03)

**Note:** Version bump only for package @react-financial-charts/core

# [1.0.0-alpha.14](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.13...v1.0.0-alpha.14) (2020-09-02)

### Bug Fixes

-   **core:** correcting xExtents type ([d3607fe](https://github.com/reactivemarkets/react-financial-charts/commit/d3607fedccda783badd2214b9d2ec27fa2faca31))
-   **core:** correcting zoom anchor types ([052981a](https://github.com/reactivemarkets/react-financial-charts/commit/052981a9d7462c7c2e9bba4ae9486f1a1db14553))

# [1.0.0-alpha.13](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.12...v1.0.0-alpha.13) (2020-09-01)

### Bug Fixes

-   **core:** correcting xextents props ([ec80146](https://github.com/reactivemarkets/react-financial-charts/commit/ec80146bb171c21fd0daa41ac620b8081d6e6266))
-   fixing scaling when data is discontinuous ([4b20255](https://github.com/reactivemarkets/react-financial-charts/commit/4b20255d05b4590c2a5fc196bf505c95a63431f0))
-   **core:** correcting bar width with continuous scales ([a967a18](https://github.com/reactivemarkets/react-financial-charts/commit/a967a18347be6b8ad11d50da579911c9bd2f97ee))
-   removing canvas gradients ([2205163](https://github.com/reactivemarkets/react-financial-charts/commit/220516356300c6c1c8528de3ca43e7ddaf8e5e66))
-   **core:** displayXAccessor is optional ([d6a5dda](https://github.com/reactivemarkets/react-financial-charts/commit/d6a5dda949c5178a8213cabda23d1178d4ea155a))

### Features

-   **core:** replaced onLoadMore with onLoadBefore & onLoadAfter ([4957c32](https://github.com/reactivemarkets/react-financial-charts/commit/4957c32314db84131d3b34a8759dcc9ab28770c1))

# [1.0.0-alpha.10](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.9...v1.0.0-alpha.10) (2020-08-28)

### Bug Fixes

-   **core:** children can be undefined or null ([17aa844](https://github.com/reactivemarkets/react-financial-charts/commit/17aa844d19d87caf8b763cb07d3ea6ddc7c05d9c))
-   **core:** using type guard to check type of canvas children ([829ccfa](https://github.com/reactivemarkets/react-financial-charts/commit/829ccfacd11da678a5920c37309fc991130b19ea)), closes [#417](https://github.com/reactivemarkets/react-financial-charts/issues/417)
-   correcting more props ([2b3c1e0](https://github.com/reactivemarkets/react-financial-charts/commit/2b3c1e093b12131b7a4bc1ed12fd8ea4c541ac4b))
-   correcting zoomAnchor prop type ([981077b](https://github.com/reactivemarkets/react-financial-charts/commit/981077b1e6e08b7c22d75842c7df90e82711e038))

# [1.0.0-alpha.9](https://github.com/reactivemarkets/react-financial-charts/compare/v1.0.0-alpha.8...v1.0.0-alpha.9) (2020-08-24)

### Bug Fixes

-   adding more prop types ([c3985d5](https://github.com/reactivemarkets/react-financial-charts/commit/c3985d5ee96fcbd5ad5a922df595d31930d0cee5))

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

-   **core:** CanvasContainer is now a PureComponent ([ec4c43e](https://github.com/reactivemarkets/react-financial-charts/commit/ec4c43e2a15dbf50d60d9547633c4dab44398fe5))
-   **core:** fixing issues with empty data sets ([23c2458](https://github.com/reactivemarkets/react-financial-charts/commit/23c2458bfe55e97eef96f80030fe32b9cf5ac1e1))
-   **core:** fixing re-rendering of svg components ([af0f156](https://github.com/reactivemarkets/react-financial-charts/commit/af0f156c66cd302ec8a45ff6c49e4121385b3ca9))

### Features

-   **core:** adding onDoubleClick to Chart ([1b6498b](https://github.com/reactivemarkets/react-financial-charts/commit/1b6498b2fba108d930004ddbaaea6573692a1fb4))

# [1.0.0-alpha.0](https://github.com/reactivemarkets/react-financial-charts/compare/v0.5.1...v1.0.0-alpha.0) (2020-07-08)

### Bug Fixes

-   **core:** only draw canvas if the draw function is defined ([354eb54](https://github.com/reactivemarkets/react-financial-charts/commit/354eb5448b8b09dfea1d4515829af4172da9dcc0))

-   feat!: separating code into packages ([670537f](https://github.com/reactivemarkets/react-financial-charts/commit/670537fa280dddfbe921639a8e22a7c11d14e5f3))

### BREAKING CHANGES

-   first stage of refactor breaking the code down.
