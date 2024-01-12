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
pnpm exec nx run core:publish --args=--ver=x.x.x --tag=<latest/next>
```

This is an Nx monorepo. You can run build/test tasks using the CLI commands
(such as the ones above), but I recommend using the VSCode extension:
https://nx.dev/core-features/integrate-with-editors.

## License

[MIT License](https://github.com/xgi/tiyo/blob/main/LICENSE.txt)
