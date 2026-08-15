# Anvil

## Installation

1. Clone/download repo
2. Run `yarn install` from the cloud-services repository root

## Usage

### Development

- `yarn run storybook` To view storybook on the browser and to experiment with the components.
- `yarn test` to run all tests.

New icons can be added to the component library whenever they're needed. Currently https://phosphoricons.com is being used as the icon library. Use the `Icon` component from `@dittolive/anvil` with any Phosphor icon passed as the `svg` prop.

### Production

- `yarn build` to generate a production build.

## Importing @dittolive/anvil

### From inside the monorepo

If you're developing another project in this repository, add
`@dittolive/anvil` as a dependency in the project's `package.json`:

```json
...
"dependencies": {
    "@dittolive/anvil": "^0.0.0",
}
```

And yarn workspaces will link it inside the node_modules folder. You can then import it and use normally inside your project as any other dependency. However bear in mind that since the library is linked, you'll have to tweak the webpack configuration with an alias, so that the dependency is resolved correctly:

```js
  ...
  alias: {
      '@dittolive/anvil': path.resolve(
        '../node_modules/@dittolive/anvil/src/index.ts',
     ),
   },
   ....
```

Typescript projects also need to be tweaked to resolve the correct path on `@dittolive/component` imports. Ie. the `tsconfig.ts` compilerOptions should include:

```json
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@dittolive/anvil": ["../../node_modules/@dittolive/anvil/src/index.ts"]
    }
  }
```

### From outside the monorepo

External projects using the monorepo have to add `@dittolive/anvil` as any other project dependency. Therefore for external projects, such as the DQL Editor `@dittolive/anvil` should be published to a company npm registry.

#### Syncing a local copy of @dittolive/anvil to an external project during development

During the development of external projects, if we want to extend the component library and see results immediately on the external project's dev environment, we can:

1. update the external project's `package.json` so that the `@dittolive/anvil` points to the local distribution of `@dittolive/anvil` , eg.;

```json
"dependencies": {
    ...
    "@dittolive/anvil": "link:../../anvil",
    ...
}
```

2. Run `yarn run build:watch`, which will automatically generate a new distribution of the project inside the `dist` folder, when the code changes.
3. Publish the new @dittolive/anvil version when we're happy with the changes.
4. Restore the dependencies on the external project's `package.json` before pushing it to Github

## IMPORTANT

Given that `@dittolive/anvil` is placed inside of the monorepo, changes done to the project will impact **ALL** of the web projects inside of the monorepo that are using/importing it. This will not be the case for external projects which will be tied to a specific npm release of the component library.
