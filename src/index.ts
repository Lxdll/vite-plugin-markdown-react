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

    async handleHotUpdate(ctx) {
      if (!filter(ctx.file)) return

      // markdown 文件变更后，强制页面刷新
      ctx.server.ws.send({
        type: 'full-reload',
        path: '*',
      })

      // 不返回任何模块，阻止 Vite HMR 递归传染 React 组件
      return []
    },
  }
}
