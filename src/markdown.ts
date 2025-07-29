import { ResolvedOptions } from './type'
import matter from 'gray-matter'
import { parseDocument } from 'htmlparser2'
import { transformSync } from '@babel/core'
import render from 'dom-serializer'
import { TransformResult } from 'vite'

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
    let html = await markdownIt.renderAsync(grayMatterFile.content || '')

    const parsedDocument = parseDocument(html, {
      lowerCaseTags: false,
      xmlMode: true,
    })
    html = render(parsedDocument, { selfClosingTags: true, xmlMode: true })

    html = `<div dangerouslySetInnerHTML={{__html: \`${html}\`}}></div>`

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

    const code = `
      import React from 'react'
      export default function () {
        const frontmatter = ${grayMatterFile.data ? JSON.stringify(grayMatterFile.data) : '{}'}
        return ${transformResult?.code || ''}
        }
        `

    return {
      code,
      map: null,
    }
  }
}
