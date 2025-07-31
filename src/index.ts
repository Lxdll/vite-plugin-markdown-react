import { type Plugin, createFilter } from 'vite'
import { resolveOptions } from './option'
import { Options } from './type'
import { createMarkdownToReact } from './markdown'

export default function (options: Options = {}): Plugin {
  const resolvedOptions = resolveOptions(options)
  const markdownToReact = createMarkdownToReact(resolvedOptions)
  const filter = createFilter(resolvedOptions.include, resolvedOptions.exclude)

  return {
    name: 'vite-plugin-markdown-react',

    async transform(raw: string, id: string) {
      if (!filter(id)) return

      try {
        return await markdownToReact(raw, id)
      } catch (error) {
        console.error(error)
      }
    },

    // TODO
    handleHotUpdate(ctx) {
      if (!filter(ctx.file)) return

      const defaultRead = ctx.read
      ctx.read = async function () {
        return (await markdownToReact(ctx.file, await defaultRead())).code
      }
    },
  }
}
