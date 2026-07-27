# Contributing to RetailLens

RetailLens is maintained by **LAI ZEYU**.

## Development workflow

1. Fork the repository and create a focused branch.
2. Use Node.js 20.19.x or 22.12.0+ and pnpm 11.9.0.
3. Install with `pnpm install --frozen-lockfile`.
4. Keep deterministic rules separate from optional AI interpretation.
5. Add or update tests for scoring, evidence, gate, API, or schema changes.
6. Run `pnpm test` and `pnpm build`.
7. Open a pull request explaining formula or evidence-rule changes.

## Method changes

Any changed score, weight, threshold, formula, hard gate, or evidence rule must
be:

- versioned and disclosed;
- linked to its source or explicitly labelled as an internal RetailLens rule;
- deterministic for identical inputs;
- tested against unintended narrative-length or AI influence;
- reflected in `docs/METHODOLOGY.md` and `docs/SOURCE_MAP.md`.

## Data and security

Do not submit API keys, populated environment files, customer data, private
business records, copyrighted course files, or real assessment drafts.

## Languages

The supported product languages are Simplified Chinese and English only.
Contributions that change user-facing copy should preserve both versions.
