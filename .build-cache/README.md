# Build Cache

This directory contains pre-built packages that are not yet published to npm.

## @enonic/react-components

The `enonic-react-components-0.0.0.tgz` file is a pre-built version of the `@enonic/react-components` package from the `issue-285` branch:
- Source: https://github.com/enonic/npm-react-components/tree/issue-285
- Commit: ba566891a8bbb5e516ab618b8d0da7cfe71deb35
- Built with: npm run build (production mode)
- Built on: 2025-12-16

This package includes support for Next.js 16 and React 19.

### Why is this needed?

The `issue-285` branch contains the updated code for React 19 and Next.js 16 compatibility, but:
1. It hasn't been published to npm yet
2. The branch doesn't include built files (dist folder is gitignored)
3. npm doesn't build packages when installing directly from GitHub

### How to update

When a new version of this branch is needed:
1. Clone the repository: `git clone --branch issue-285 https://github.com/enonic/npm-react-components.git`
2. Install dependencies: `npm install`
3. Build the package: `npm pack`
4. Copy the generated tarball to this directory
5. Update package.json if the filename changed

### Future

Once the `issue-285` branch is merged and published to npm as an official release, this directory and the file reference in package.json can be removed, and the dependency can be updated to the published version (e.g., `^7.0.0`).
