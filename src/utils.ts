import { Options, ResolvedOptions } from './type'

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
