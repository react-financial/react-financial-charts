# Contributing

We welcome all contributions!

Before creating a PR, please raise an issue to discuss it.

## Commits

We use [convention commits](https://www.conventionalcommits.org) style of commit messages.

## Style

The codebase is written in typescript, this is set to be strict with all warnings and errors turned on. We also use ts-lint. Both are run as part of the build.

You can run `npm run lint` to show any style issues separate from the build.

### Guidelines

* Use Promises instead callbacks
* Files should be 100 lines or less

## Tests

Tests are using storybook, please see existing tests for recommended formatting.
