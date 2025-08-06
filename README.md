# vite-plugin-markdown-react

[![NPM version](https://img.shields.io/npm/v/vite-plugin-markdown-react?color=a1b858)](https://www.npmjs.com/package/vite-plugin-markdown-react)

Compile Markdown to React component.

- 📚 Use Markdown as React components.
- 💚 Use React components in Markdown.

## Install

```bash
npm i -D vite-plugin-markdown-react
```

Add it to `vite.config.js`

```javascript
// vite.config.js
import react from '@vitejs/plugin-react'
import Markdown from 'vite-plugin-markdown-react'

/** @type {import 'vite'.UserConfig} */
export default defineConfig({
  plugins: [react(), Markdown()],
})
```

And import it as a normal Vue component

## Import Markdown as React components

```typescript
import HelloWorld from './README'

export default function ReactComponent() {
  return <HelloWorld />
}
```

## Use React Components inside Markdown

### Work with [unplugin-auto-import](https://www.npmjs.com/package/unplugin-auto-import)

```javascript
// vite.config.js
import react from '@vitejs/plugin-react'
import Markdown from 'vite-plugin-markdown-react'
import AutoImport from 'unplugin-auto-import/vite'

/** @type {import 'vite'.UserConfig} */
export default defineConfig({
  plugins: [
    react(),
    Markdown(),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.md$/],
      imports: [imports],
      dts: true,
    }),
  ],
})

// imports
const imports = await getAutoImports(['src/components/**/*.tsx']);
type Imports = Record<string, ['default', string][]>;
export const getAutoImports = async (pattern: Pattern[]): Promise<Imports> => {
  const files = await fg(pattern, { absolute: false });

  const map = new Map<string, ['default', string][]>([]);

  for (const file of files) {
    const pathWithoutExt = file.replace(/\.(tsx|jsx)$/, '');
    const importPath = `@/${pathWithoutExt.replace(/^src\//, '')}`;
    const fileName = pathWithoutExt.split('/').pop();
    if (fileName) {
      map.set(importPath, [['default', fileName]]);
    }
  }

  return Object.fromEntries(map);
};
```

Components under `./src/components` can be directly used in markdown components, and markdown components can also be put under `./src/components` to be auto imported.

## Frontmatter

You can use `frontmatter` in `.md`

```markdown
---
name: My Cool App
---

# Hello World

This is {frontmatter.name}
```

Will be rendered as

```html
<h1>Hello World</h1>
<p>This is My React App</p>
```
