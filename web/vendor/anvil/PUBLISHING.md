# Publishing Anvil

This document records the intended production shape for the Anvil package and
its documentation site. It deliberately leaves organization-owned identifiers
as decisions instead of embedding placeholder infrastructure in CI.

## Target architecture

- Publish the React library as a scoped package from a dedicated Anvil
  repository.
- Build the package with `yarn build` and validate its consumer tarball with
  `yarn pack:check`.
- Build the documentation as a static Storybook with
  `yarn build-storybook`.
- Deploy `storybook-static/` to an S3 bucket fronted by CloudFront.
- Point `design.ditto.com` at the CloudFront distribution with a Route 53 alias
  record and an ACM certificate issued in `us-east-1`.
- Deploy immutable hashed assets with a long cache lifetime, HTML and Storybook
  metadata with a short cache lifetime, then invalidate CloudFront after each
  production deployment.

The existing Ditto AWS and GitHub OIDC conventions make S3 and CloudFront a
better fit than coupling the site to the source host. Storybook is a static
site, so no application runtime is required.

## Release flow

Use Changesets in the dedicated repository so pull requests describe whether a
change is patch, minor, or major. A release pull request should update the
version and changelog. Merging it should:

1. install from the lockfile;
2. run lint, tests, the package build, the Storybook build, and the package
   tarball check;
3. publish the package using registry trusted publishing or a short-lived
   credential;
4. create the Git tag and GitHub release;
5. deploy that exact commit's Storybook output to `design.ditto.com`.

Documentation from `main` and the package release should stay atomic. A
documentation-only change can still deploy the site without publishing a new
package version.

## Decisions required before enabling release CI

1. **Registry and audience.** Publish the selected package name,
   `@dittolive/anvil`, through public npm, private npm, or GitHub
   Packages. The current `publishConfig.access` is `restricted`, which assumes
   authenticated consumers.
2. **Repository visibility.** This is independent from package visibility and
   should reflect the commercial license and desired contribution model.
3. **AWS ownership.** Select the account, deployment role, S3 bucket,
   CloudFront distribution, Route 53 hosted zone, and alerting owner.
4. **Preview policy.** Decide whether pull requests receive ephemeral
   Storybook URLs (for example through a `pull/<number>/` CloudFront path) or
   only downloadable build artifacts.
5. **Font distribution rights.** Confirm that every bundled font may be
   redistributed to the selected package audience and from the public
   documentation domain.

## Repository extraction checklist

- Move the entire `anvil/` directory into the new repository root.
- Copy the applicable lint, TypeScript, test, and formatting configuration.
- Replace workspace dependency ranges in cloud-services consumers with a
  released version.
- Add Changesets and release/deployment workflows only after the identifiers
  above are resolved.
- Protect `main`, require package and Storybook checks, and require review for
  release workflow or infrastructure changes.
