import { ResolvedOptions } from './type'
import matter from 'gray-matter'
import { parseDocument } from 'htmlparser2'
import { transformSync } from '@babel/core'
import render from 'dom-serializer'
import { TransformResult } from 'vite'
import parse from 'html-react-parser'
import { transformCodeTags } from './utils'

export const createMarkdownToReact = (options: ResolvedOptions) => {
  const { wrapperDiv, wrapperComponent, wrapperClasses } = options

  const setupMarkdownItPromise = (async () => {
    const { default: MarkdownIt } = await import('markdown-it-async')

    const mdIt = MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })

    mdIt.linkify.set({ fuzzyLink: false })

    await options.markdownItSetup(mdIt)

    return mdIt
  })()

  return async (raw: string, id: string): Promise<TransformResult> => {
    const markdownIt = await setupMarkdownItPromise

    const grayMatterFile = matter(raw)
    // console.log(
    //   '%c [ grayMatterFile ]',
    //   'font-size:13px; background:pink; color:#bf2c9f;',
    //   grayMatterFile,
    // )
    let html = await markdownIt.renderAsync(grayMatterFile.content || '')
    // html = html.replace(/<code(.*?)>/g, '<code$1 v-pre>')

    const parsedDocument = parseDocument(html, {
      lowerCaseTags: false,
      xmlMode: true,
    })
    html = render(parsedDocument, { selfClosingTags: true, xmlMode: true })

    // transformCodeTags(parsedDocument)

    console.log(
      '%c [ html ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      html,
    )

    // html = `<>${html}</>`

    html = `<div dangerouslySetInnerHTML={{__html: \`${html}\`}}></div>`
    console.log(
      '%c [ hddddddtml ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      html,
    )

    if (wrapperDiv) {
      const resolvedWrapperClasses =
        typeof wrapperClasses === 'function'
          ? wrapperClasses(id, html)
          : Array.isArray(wrapperClasses)
            ? wrapperClasses.join(' ')
            : wrapperClasses

      if (resolvedWrapperClasses) {
        html = `<div className="${resolvedWrapperClasses}">${html}</div>`
      } else {
        html = `<div>${html}</div>`
      }
    } else {
      html = `<>${html}</>`
    }

    const wrapperComponentName =
      typeof wrapperComponent === 'function'
        ? wrapperComponent(id, html)
        : wrapperComponent

    if (wrapperComponentName) {
      html = `<${wrapperComponentName} frontmatter={${JSON.stringify(grayMatterFile.data)}}>${html}</${wrapperComponentName}>`
    }

    const transformResult = transformSync(html, {
      ast: false,
      presets: [
        ['@babel/preset-react', { runtime: options.babelConfig.runtime }],
      ],
    })
    console.log(
      '%c [ renderStr ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      transformResult,
    )

    // return {
    //   code: `
    //   import React from 'react'
    //   export default function () {
    //     const frontmatter = ${grayMatterFile.data ? JSON.stringify(grayMatterFile.data) : '{}'}
    //     return <div dangerouslySetInnerHTML={{__html:${transformResult?.code}}}></div>
    //     }
    //     `,
    //   map: null,
    // }

    const code = `
      import React from 'react'
      export default function () {
        const frontmatter = ${grayMatterFile.data ? JSON.stringify(grayMatterFile.data) : '{}'}
        return ${transformResult?.code || ''}
        }
        `
    console.log(
      '%c [ code ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      code,
    )

    return {
      code,
      map: null,
    }
  }
}
