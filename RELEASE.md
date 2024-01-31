# Release Procedure

> It is strictly not recommended to do a manual release. Please, follow the automated release procedure.

## Creating release

This project is using [`npm-publish`](https://github.com/pascalgn/npm-publish-action)
GitHub Action to publish and tag a new version of the package.

#### Step 1

Update the package version in `package.json` file, e.g.:

```diff
{
  "name": "@enonic/nextjs-adapter",
- "version": "1.0.0",
+ "version": "1.0.1",
}
```

#### Step 2 (optional)

Run install task to update the `package-lock.json`

```
npm install
```

#### Step 3

Create and push a new commit message:

```
git commit -am "Release v1.0.1"
git push
```

The commit message must follow the `"^(?:[\w\d]+\s+)?(?:v?)(\S+)"` pattern.
In other words, commit message must contain the **EXACT** same version as in `package.json`.
Say you update the `package.json` to version `1.0.1`. Examples for commit message will be the following:

```
Release 1.0.0
Release v1.0.0
Released 1.0.0
Released v1.0.0
1.0.0
v1.0.0
```

#### Step 4 (optional)

Check that the build was successful and a new version of the package has appeared
on [npm](https://www.npmjs.com/package/@enonic/nextjs-adapter).
