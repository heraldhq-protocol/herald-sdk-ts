# Changelog

All notable changes to the `@herald-protocol/sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1](https://github.com/heraldhq-protocol/herald-sdk-ts/compare/v1.3.0...v1.3.1) (2026-05-01)


### Bug Fixes

* update HERALD_AUTHORITY to new program authority key ([96c94bd](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/96c94bd15e9cb07588101c222a24e3863ec1b3a7))
* update IDL from anchor build ([e0aa08f](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/e0aa08fcef3e6391c47073cd6275946086aa44a3))

## [1.3.0](https://github.com/heraldhq-protocol/herald-sdk-ts/compare/v1.2.2...v1.3.0) (2026-04-25)


### Features

* add notification keys feature for encrypted notifications ([90f013f](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/90f013f56a7af5f08f68c85ebbd1f2749027d1d7))
* **billing:** implement subscription and payment modules ([e8d10ef](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/e8d10effcd2ca47777fccbeb3c7e0405376c86d9))
* complete Phase 7 SDK enhancements ([5a6f5ba](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/5a6f5ba9c9ea5fd8dcbbe2329cc6610522868e7e))
* implement Herald Protocol TypeScript SDK ([ec099a2](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/ec099a210d76541eea3cfee766bc82db23af7595))
* **sdk:** Encryption - Notification Key Client and Tests ([b67e3fb](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/b67e3fba87a00140bd35b653bc635d643aca23e1))
* **sdk:** refactor helio billing to use native @heliofi/sdk and template-based checkouts ([7564332](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/7564332555357da4fc08dedc0eaae497f20a94fc))


### Bug Fixes

* **billing:** add cancel subscription to helio billing wrapper ([2ca430c](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/2ca430c3adfc60f642275d6143c95d95b48bf5ff))
* **ci:** remove provenance from npm publish for private repo ([ea4bd02](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/ea4bd027e05c78926e4f23a9810c6be205cbf058))
* **rpc:** add ENV variable support for custom Solana RPC URLs ([22bfdbc](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/22bfdbcaa9165f2eba872c1f25d1d941f2e3491c))
* **sdk:** resolve Buffer source type mismatch in verifyWebhookSignature ([12ac990](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/12ac990543f7898cf3163932b083fdacd1123daa))
* **sdk:** resolve unconstructable HelioSDK signature ([eb6108f](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/eb6108f4539823c1f3a398e853d7824bc45ea770))
* update the herald_privacy_registry program IDL ([1b42b28](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/1b42b28f9a0fbfac4a5f103b2f8b5d28a31bc665))

## [1.2.3](https://github.com/heraldhq-protocol/herald-sdk-ts/compare/v1.2.2...v1.2.3) (2026-04-18)


### Bug Fixes

* **billing:** add cancel subscription to helio billing wrapper ([2ca430c](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/2ca430c3adfc60f642275d6143c95d95b48bf5ff))
* update the herald_privacy_registry program IDL ([1b42b28](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/1b42b28f9a0fbfac4a5f103b2f8b5d28a31bc665))

## [1.2.2](https://github.com/heraldhq-protocol/herald-sdk-ts/compare/v1.2.1...v1.2.2) (2026-04-18)

### Features
* **billing:** add `cancelSubscription` method to the Helio billing wrapper, falling back to REST API if native is missing.

## [1.2.1](https://github.com/heraldhq-protocol/herald-sdk-ts/compare/v1.2.0...v1.2.1) (2026-04-17)


### Bug Fixes

* **ci:** remove provenance from npm publish for private repo ([ea4bd02](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/ea4bd027e05c78926e4f23a9810c6be205cbf058))

## [1.2.1](https://github.com/heraldhq-protocol/herald-sdk-ts/compare/v1.2.0...v1.2.1) (2026-04-17)

### Features
* **channels:** expose `ChannelUserClient` with `registerTelegram`, `registerSms`, `buildTelegramRegistrationTx`, and `buildSmsRegistrationTx` methods for multi-channel registration.

### Bug Fixes
* **channels:** fix SDK method exposure - `buildTelegramRegistrationTx` was implemented but not exported properly in the root index.

## [1.2.0](https://github.com/heraldhq-protocol/herald-sdk-ts/compare/v1.1.0...v1.2.0) (2026-04-12)


### Features

* complete Phase 7 SDK enhancements ([5a6f5ba](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/5a6f5ba9c9ea5fd8dcbbe2329cc6610522868e7e))
* **sdk:** refactor helio billing to use native @heliofi/sdk and template-based checkouts ([7564332](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/7564332555357da4fc08dedc0eaae497f20a94fc))


### Bug Fixes

* **sdk:** resolve Buffer source type mismatch in verifyWebhookSignature ([12ac990](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/12ac990543f7898cf3163932b083fdacd1123daa))
* **sdk:** resolve unconstructable HelioSDK signature ([eb6108f](https://github.com/heraldhq-protocol/herald-sdk-ts/commit/eb6108f4539823c1f3a398e853d7824bc45ea770))

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
