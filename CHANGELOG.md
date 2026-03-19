# Changelog

All notable changes to the `@herald-protocol/sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive JSDoc annotations to `UserClient`, `AuthorityClient`, `ReadClient`, `BaseClient`, and instruction types to improve developer intellisense.
- Standalone integration examples in the `examples/` directory:
  - `user-flow.ts`: Walkthrough of identity registration, status checks, and preference updates.
  - `protocol-flow.ts`: Walkthrough for backend node environments to register protocols and emit Light Protocol delivery receipts.
- Initial `CHANGELOG.md` file.

### Changed
- Major overhaul of `README.md` with deep-dive documentation into the three core client architectures (`UserClient`, `AuthorityClient`, `ReadClient`).
