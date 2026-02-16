# Ownership Boundaries (v1.x)

`al-folio` is a starter kit. Runtime/component ownership lives in gems.

## Runtime ownership

- `al-folio` (starter): example content, wiring, docs, integration harness.
- `al_folio_core`: shared layouts/includes/runtime primitives and upgrade contracts.
- `al_folio_distill`: Distill templates/runtime assets.
- `al_cookie`: cookie consent runtime assets and consent logic.
- Other `al-*` gems: feature-specific assets, tags, filters, and runtime behavior.

## Test ownership

- `al-folio` tests:
  - Visual regression/parity (`test/visual/**`)
  - Cross-gem integration checks (plugin toggles, compat wiring, upgrade smoke tests)
  - Starter wiring contracts only
- Gem-local tests (`al-folio-core`, `al-folio-distill`, `al-*`):
  - Component correctness (tags, filters, generators)
  - Runtime asset packaging contracts
  - Feature edge cases
  - Migration/upgrade contract logic in the owning gem

## Prohibited pattern

- Do not duplicate gem-owned component correctness tests in `al-folio`.
- Do not add local starter copies of gem-owned runtime files unless intentionally overriding behavior.
