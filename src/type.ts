import { type MarkdownItAsync } from 'markdown-it-async'

type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp

export type Options = {
  include?: FilterPattern
  exclude?: FilterPattern

  /**
   * Setup function for MarkdownIt instance.
   * This function can be used to add custom plugins or modify the MarkdownIt instance.
   */
  markdownItSetup?: (MarkdownIt: MarkdownItAsync) => void | Promise<void>

  /**
   * Wrap the rendered html in a div
   *
   * @default true
   */
  wrapperDiv?: boolean

  /**
   * Class names for wrapper div
   *
   * This option will be ignored if `wrapperDiv` is set to `false`
   *
   * @default 'markdown-body'
   */
  wrapperClasses?:
    | string
    | string[]
    | undefined
    | null
    | ((id: string, code: string) => string | string[] | undefined | null)

  /**
   * Component name to wrapper with
   *
   * @default undefined
   */
  wrapperComponent?:
    | string
    | undefined
    | null
    | ((id: string, code: string) => string | undefined | null)
}

export interface ResolvedOptions extends Required<Options> {
  babelConfig: BabelConfig
}

export type BabelConfig = {
  runtime: 'automatic' | 'classic'
}
