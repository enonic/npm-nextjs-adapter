# Release Procedure

Releases are published by `.github/workflows/release.yml` when a Git tag matching `v*` is pushed. The workflow installs dependencies, publishes to npm using trusted publishing, and creates a GitHub release.

## Prepare the release

1. Update dependencies and the lockfile. Use released dependencies for a stable release; the adapter currently depends on `@enonic/react-components` 7.1.0.
2. Review `README.md` and `UPGRADE.md` for compatibility requirements, API changes and migration instructions.
3. Validate a clean install and run the release checks:

   ```sh
   npm ci
   npm run check:types
   npm pack
   ```

   The `prepack` hook runs tests, lint and the production build. Test the resulting tarball in a consuming Next.js application before publishing.
4. Commit and push the changes. Wait for the Build & Test workflow to pass on the exact release commit.
5. If releasing from a maintenance branch, create or update that branch from the tested commit and check it out before tagging.

## Tag and publish

Do not manually change the checked-in `package.json` version from `0.0.0`. The `prepublishOnly` hook runs `setversion.js`, which derives the published version from the nearest Git tag, stripping its leading `v`.

For example, to release stable version 6.0.0 from the selected release branch:

```sh
git tag -a v6.0.0 -m "Release v6.0.0"
git push origin v6.0.0
```

For a beta, use an unused prerelease tag such as `v6.0.0-beta.12` instead. Confirm the version is not already published and the tag does not already exist before pushing it. Do not move an existing release tag to a different commit.

The workflow chooses the npm dist-tag from the Git tag:

- `vMAJOR.MINOR.PATCH` publishes to `latest`.
- Prerelease versions publish to `beta`.

A commit message alone does not trigger publication. `npm pack` also does not invoke `prepublishOnly`, so a locally packed tarball normally has version `0.0.0` unless explicitly stamped for testing.

## Verify the release

1. Confirm both the Build & Test and Release workflows passed for the tag.
2. Check the GitHub release and add release notes explaining changes and migration considerations.
3. Verify the package version, dependency versions and npm dist-tags:

   ```sh
   npm view @enonic/nextjs-adapter@6.0.0 version dependencies peerDependencies
   npm view @enonic/nextjs-adapter dist-tags
   ```

4. Install the published package in a consumer and validate its build and runtime behavior.

Registry metadata can take a few minutes to reflect a new publication. If it remains stale, refresh the npm cache before retrying. Do not republish or move tags just because the package is not immediately visible.
