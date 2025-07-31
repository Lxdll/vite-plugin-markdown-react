import { ResolvedOptions } from './type'
import matter from 'gray-matter'
import { transformSync } from '@babel/core'
import { TransformResult } from 'vite'
import { parse } from './parse'
import { process } from './process'

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

    html = parse(html)
    html = process(html)

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
