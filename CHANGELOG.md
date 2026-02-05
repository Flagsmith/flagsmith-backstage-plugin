# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
