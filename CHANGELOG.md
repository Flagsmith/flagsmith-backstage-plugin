# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1](https://github.com/Flagsmith/flagsmith-backstage-plugin/compare/v0.2.0...v0.2.1) (2026-02-06)


### Bug Fixes

* **ci:** install dependencies in publish job for prepack script ([#15](https://github.com/Flagsmith/flagsmith-backstage-plugin/issues/15)) ([b03c1bd](https://github.com/Flagsmith/flagsmith-backstage-plugin/commit/b03c1bdefc38f26cf9b2364d98a3ea87754fc0c0))
* **ci:** use Node.js 24 for OIDC trusted publishing support ([#17](https://github.com/Flagsmith/flagsmith-backstage-plugin/issues/17)) ([5fd108e](https://github.com/Flagsmith/flagsmith-backstage-plugin/commit/5fd108eaf67e46cdf082f8b6a97d8257ee58d7d5))

## [0.2.0](https://github.com/Flagsmith/flagsmith-backstage-plugin/compare/v0.1.0...v0.2.0) (2026-02-05)


### Features

* **release:** add NPM publishing workflow ([#7](https://github.com/Flagsmith/flagsmith-backstage-plugin/issues/7)) ([c356cce](https://github.com/Flagsmith/flagsmith-backstage-plugin/commit/c356cce4864138c80911fc9b97498b50e32e0316))
* **ui:** UI/UX improvements and component refactoring ([#5](https://github.com/Flagsmith/flagsmith-backstage-plugin/issues/5)) ([9568e53](https://github.com/Flagsmith/flagsmith-backstage-plugin/commit/9568e5302a7091bcf83f6c18af68f2a9e358bbb2))
* **ui:** UX improvements for feature flags ([#9](https://github.com/Flagsmith/flagsmith-backstage-plugin/issues/9)) ([#12](https://github.com/Flagsmith/flagsmith-backstage-plugin/issues/12)) ([0561651](https://github.com/Flagsmith/flagsmith-backstage-plugin/commit/0561651e7595f0355a977fb574dfada11ace74bd))


### Tests

* add unit and integration tests for Backstage plugin ([#6](https://github.com/Flagsmith/flagsmith-backstage-plugin/issues/6)) ([ab332c7](https://github.com/Flagsmith/flagsmith-backstage-plugin/commit/ab332c7de0a8f7e71db0a14e698056a4d14574ac))

## [Unreleased]

## [0.1.0] - 2025-01-27

### Added

- Initial release of the Flagsmith Backstage plugin
- **FlagsTab** - Full-page feature flags view with:
  - Searchable table with pagination (10/25/50/100 items per page)
  - Environment status columns with toggle switches (up to 6 environments)
  - Tags column with overflow indicator (+N for >3 tags)
  - Expandable rows with detailed feature information
  - Usage analytics chart per environment (last 30 days)
  - Version info, ownership details, and scheduled changes indicators
- **FlagsmithOverviewCard** - Compact card showing flag statistics
- **FlagsmithUsageCard** - Usage metrics chart for the last 30 days
- Proxy-based API architecture for secure Flagsmith API access
- Support for Backstage new frontend system
- Comprehensive test coverage for hooks and utilities

### Technical

- `FlagsmithClient` - API client with lazy loading for feature details
- Shared components: `LoadingState`, `ErrorState`, `EmptyState`, `SearchInput`, `FlagsmithLink`
- Utility functions for date formatting, flag type detection, and pagination
- TypeScript strict mode compliance

[Unreleased]: https://github.com/Flagsmith/flagsmith-backstage-plugin/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Flagsmith/flagsmith-backstage-plugin/releases/tag/v0.1.0
