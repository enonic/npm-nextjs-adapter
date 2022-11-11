# RELEASE PROCEDURE

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

## How it works

This is a description of necessary steps before the `npm publish` can be performed.
All of these are performed automatically.
Follow them in case of need to create a manual release (**highly not recommended**).

1. Run build task to create necessary `*.js` and `*.d.ts` files in the `./dist` folder:
    ```
    npm run build
    ```
2. Run copy task to copy `package.json` and `README.md` into `./dist`
    ```
    npm run copy
   ```
3. Perform the publish from the `./dist` folder:
    ```
    cd ./dist
   npm publish
   ```
