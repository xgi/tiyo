# Tiyo

This is a developer library, and isn't meant for regular users. For a manga reader that
uses Tiyo, see Houdoku: <https://github.com/xgi/houdoku>.

Tiyo is a library for retrieving and processing manga websites ("content sources"). It provides
clients for a multitude of sources, with a standardized interface for searching and retrieving
content. It's easily extendable, and new sources can be added from scratch or with helper methods
for generic websites (like Wordpress templates).

## Development

Prerequisites:

- [Node](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io)

```bash
# Install package dependencies
pnpm install

# Build @tiyo/core, which will also build @tiyo/common
pnpm exec nx run core:build

# Publish package
pnpm exec nx run core:publish --args="--ver=x.x.x --tag=<latest/next>"
```

This is an Nx monorepo. You can run build/test tasks using the CLI commands
(such as the ones above), but I recommend using the VSCode extension:
https://nx.dev/core-features/integrate-with-editors.


### API

Definitions for extension client interfaces and functions, e.g.
[ExtensionClientInterface](https://github.com/xgi/tiyo/blob/main/libs/common/src/lib/interfaces.ts) are in `libs/common` (`@tiyo/common`).

Extensions are implemented in `libs/core` (`@tiyo/core`). When making a new
extension, you should use existing extensions as a reference. The core package
also contains generic client helpers for some common website structures (e.g.
the Madara WordPress theme or FoOlSlide).

### Dependencies

When adding a new package dependency (like jsdom), it should be added both to
this repo's base `package.json` as a devDependency and as a regular dependency
in `libs/core/package.json`. This ensures that the dependency is included
when installed from npm.


## License

[MIT License](https://github.com/xgi/tiyo/blob/main/LICENSE.txt)
