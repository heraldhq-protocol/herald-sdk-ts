# Changelog

All notable changes to the `@herald-protocol/sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] (2026-04-11)

### Features
* **billing:** properly set `isSubscription: true` flag in Helio checkouts.
* **billing:** support for using pre-existing Helio Paylink templates via `templateId`.

## [1.1.2] (2026-04-11)

### Features
* **idl:** synchronize Anchor `herald_privacy_registry` IDL definitions with on-chain PDA extensions.

## [1.1.1] (2026-04-11)

### Bug Fixes
* **core:** resolve Web Crypto `BufferSource` TS type mismatch in `verifyWebhookSignature` method, standardizing input to `Uint8Array`.
* **deps:** register dependency definitions for Helio checkout wrappers.

### Chores
* **build:** correctly handle TypeScript DOM declarations resolving duplicate package exports.

## [1.1.0](https://github.com/heraldhq-protocol/herald-sdk-ts/compare/v1.0.0...v1.1.0) (2026-03-24)


### Features

* **billing:** implement subscription and payment modules ([e8d10ef](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/e8d10effcd2ca47777fccbeb3c7e0405376c86d9))
* implement Herald Protocol TypeScript SDK ([ec099a2](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/ec099a210d76541eea3cfee766bc82db23af7595))

## [1.0.0] - 2026-03-19

### Features
* **feat:** implement Herald Protocol TypeScript SDK ([ec099a2](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/ec099a210d76541eea3cfee766bc82db23af7595))
* **chore:** initial project setup and first commit ([4956ce1](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/4956ce1d47f509da63f5391c708a124eaca2e0b4))

### Documentation
* **docs(sdk):** add JSDoc, examples, changelog, and release-it tooling ([9a9d3db](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/9a9d3dbb63e628a352637fd8bff1c6e5b65d32b3))
* **docs(sdk):** add comprehensive JSDoc, README, and examples ([623340c](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/623340c922e6936cbfd61730b10f24d62204f4ee))
  * Provide exhaustive parameter and return type annotations to all SDK methods.
  * Standalone integration examples added under `examples/user-flow.ts` and `examples/protocol-flow.ts`.
  * Complete overhaul of the `README.md` to detail typical usage for backend Node and frontend wallet providers.
  * Added `release-it` and `@release-it/conventional-changelog` to standardise release flow.

### Tests
* **test:** Introduce E2E integration tests for user and authority client functionalities and add a corresponding test script ([6f90ba2](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/6f90ba298223c2794f38e7dfd73aef8d414a04a3))
* **test:** stabilize and complete comprehensive SDK test suite ([9fd97fe](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/9fd97fe4785a6ef884d0114d97b2867c038ccb64))
* **test:** implement full SDK test suite ([43623a2](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/43623a28baee802e18d38717e6828910e1e4898a))

### Chores
* **chore:** relocate unit tests in unit directory ([34fbed2](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/34fbed2fa9a77b382a4e1c7b63a8c8ae259300e4))
