# Anvil

Anvil is the React design system for Ditto web projects.

The component library is based on Tailwind CSS v4 and owns the shared theme,
tokens, and component source detection.

## Getting started

1. Install the component library and Tailwind CSS.
2. Import Tailwind and the design-system theme from your application CSS:

```css
@import 'tailwindcss';
@import '@dittolive/anvil/theme.css';

@source './src';
```

Fonts are available through explicit package subpaths, for example
`@dittolive/anvil/font/inter/inter.css`.

## Documentation

Run `yarn storybook` to browse components locally, or
`yarn build-storybook` to produce the static documentation site.

The production package and site architecture, release flow, and remaining
organization-level decisions are recorded in [PUBLISHING.md](./PUBLISHING.md).

## Extraction boundary

Everything in this root-level directory is intended to move together into the
future Anvil repository. The package build is the contract: consumers use the
exports in `package.json`, while workspace aliases may continue to point those
exports at `src` for local development.

Before publishing from a separate repository, choose the registry, replace the
workspace version ranges in consumers, and add the release workflow.
Application-specific components in `portal/core`,
`portal/frontend`, `portal/forge`, and `portal/self-managed` remain outside this
boundary until they can be made independent of application data and routing.

## Copyright

Anvil is a commercial product. Please consult LICENSE.md within this package
for license details.

Copyright © 2019 - 2021 DittoLive, Inc. All rights reserved.
