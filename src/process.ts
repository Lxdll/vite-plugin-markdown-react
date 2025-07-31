export const process = (htmlStr: string): string => {
  htmlStr = getCodeTagContent(htmlStr)
  htmlStr = convertStyleToJSX(htmlStr)

  return htmlStr
}

const getCodeTagContent = (htmlStr: string) => {
  return htmlStr.replace(
    /<code\b[^>]*>([\s\S]*?)<\/code>/g,
    (match, codeContent) => {
      const escaped = codeContent
        .replace(/{/g, '&#123;')
        .replace(/}/g, '&#125;')
      return match.replace(codeContent, escaped)
    },
  )
}

const convertStyleToJSX = (input: string) => {
  return input.replace(/style="([^"]+)"/g, (_, encoded) => {
    try {
      const decoded = decodeHTMLEntities(encoded) // 解码 HTML 实体
      const obj = JSON.parse(decoded) // 转为 JS 对象
      const jsx = Object.entries(obj)
        .map(([k, v]) => `"${k}": "${v}"`)
        .join(', ')
      return `style={{ ${jsx} }}`
    } catch (e) {
      // 如果解码或解析失败，返回原始 style 保底
      return `style="${encoded}"`
    }
  })
}

const decodeHTMLEntities = (str: string) => {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#123;/g, '{')
    .replace(/&#125;/g, '}')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}
