import { Options, ResolvedOptions } from './type'
import type {
  AnyNode,
  Node as DomNode,
  Element as DomElement,
  Document,
} from 'domhandler'
import serialize from 'dom-serializer'
import { getInnerHTML } from 'domutils'

const includeRE = /\.md$/
const cssIdRE = /\.(css|postcss|sass|scss|less|stylus|styl)($|\?)/
const excludeRE = cssIdRE

export const resolveOptions = (options: Options): ResolvedOptions => {
  const defaultOptions: ResolvedOptions = {
    include: includeRE,
    exclude: excludeRE,

    babelConfig: {
      runtime: 'classic' as 'automatic' | 'classic',
    },
    markdownItSetup: () => {},
    wrapperDiv: true,
    wrapperClasses: '',
    wrapperComponent: null,
  }

  return {
    ...defaultOptions,
    ...options,
  }
}

// export const handleCode = (node: DomHandlerNode) => {
//   console.log(node, Object.keys(node))
//   if (node instanceof Element) {
//     // transformAttribs(node.attribs)
//     if (node.tagName === 'code') {
//       const codeContent = serialize(node.children)
//       node.attribs['dangerouslySetInnerHTML'] =
//         `vfm{{ __html: \`${escapeForTemplate(codeContent)}\`}}vfm`
//       node.childNodes = []
//     }
//     // 递归处理子节点
//     if (node.children && node.children.length > 0) {
//       for (const child of node.children) {
//         handleCode(child)
//       }
//     }
//   }
// }

/**
 * 对模板字符串中的特殊字符进行转义
 */
function escapeForTemplate(str: string): string {
  return str
    .replace(/\\/g, '\\\\') // 先转义反斜杠
    .replace(/`/g, '\\`') // 再转义反引号
    .replace(/\$/g, '\\$') // 防止 $ 被模板字面量误解
}

/**
 * 转义 HTML 属性值中的特殊字符
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 处理 HTML 字符串中 <code> 元素，把内容提到 data-dangerously-html 上
 */
export function transformCodeTags(document: Document): void {
  function walk(node: DomNode): void {
    if (node.type === 'tag') {
      const el = node as DomElement

      if (el.name === 'code') {
        const inner = getInnerHTML(el, { decodeEntities: true })
        el.attribs ||= {}
        el.attribs['data-dangerously-html'] = escapeHTML(inner)
        el.children = [] // 清空原来的 code 内容
      }

      // 遍历子节点
      if (el.children?.length) {
        for (const child of el.children) {
          walk(child)
        }
      }
    }
  }

  for (const child of Array.from(document.children)) {
    walk(child as unknown as DomNode)
  }

  // return serialize(document);
}
