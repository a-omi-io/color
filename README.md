# Nx library monorepo template (`@omi-io/template`)

Monorepo starter on [**Nx**](https://nx.dev) (see root `package.json` for the exact version — currently **19.5.x**), [**Yarn 4.1**](https://yarnpkg.com) (pinned via `packageManager` and `.yarn/releases`), and [**Node**](https://nodejs.org) **≥ 20** (see `engines` and `.nvmrc`), in the spirit of `general-core`: Yarn workspaces, shared build tooling from **`@omi-io/pkg-scripts`** (`omi-io-pkg` CLI), Husky, Commitlint, CI, and releases from branches `release/<package-folder>/<semver>`.

## What’s inside

A private root **`@omi-io/template`** (not published to npm) and one starter library under **`packages/`**:

- **`@omi-io/example-lib`** — sample TypeScript package with a typical `clean → omi-io-pkg build → tsc (types) → omi-io-pkg alias` flow, **Jest** tests, and ESLint. Remove or replace it after you bootstrap your own packages.

**`@omi-io/pkg-scripts`** is installed from npm (see `packages/example-lib/package.json`); it is **not** checked in under `packages/` here. Add more libraries as new folders under `packages/` and wire them in Yarn workspaces as usual.

## Bootstrapping a new repository

1. Copy this `nx-lib-template` folder into your new repo root (or use this folder as the repo root).
2. Update metadata: root `package.json` `name` (`@omi-io/template` → your scope/name), and for each package under `packages/` set `name`, `description`, and `repository` as needed.
3. From the repo root:

```bash
corepack enable
yarn install
```

Yarn is pinned via `.yarn/releases` and the `packageManager` field; you do not need to run `yarn set version` separately.

If you embed the template **inside** another Yarn workspace without its own root, Yarn may report that it is “not part of the project”. Run `touch yarn.lock` once at this template root, then `yarn install` again.

After copying into a **new** repository, keep the committed `yarn.lock` and refresh dependencies with `yarn` when you need updates. CI installs with **`yarn install --immutable`**.

4. Smoke check:

```bash
yarn lint
yarn test
yarn build
```

## Releasing a package (template workflow)

- Branch name: **`release/<folder-under-packages>/<x.y.z>`** (regex-enforced in GitHub Actions).  
  Example: **`@omi-io/example-lib`** in **`packages/example-lib`** → **`release/example-lib/1.2.3`**.
- The workflow resolves the Nx project as **`@omi-io/<folder>`** — keep `package.json` `name` in sync with that pattern or adjust `.github/workflows/release.yml`.
- In GitHub repository secrets, set **`NPM_TOKEN`** for npm publishes (workflow uses provenance).
- The starter package **`@omi-io/example-lib`** is intentionally marked as **`private: true`** to prevent accidental publishes from the template.  
  Before your first real release, replace/remove `example-lib` and set `private: false` only for packages you actually want to publish.

## Act (local GitHub Actions debugging)

For `release`, you can pass your own event file; **`.act-release-event.json`** at the repo root is usually gitignored.
