import { parseDocument } from 'htmlparser2'
import serializer from 'dom-serializer'
import { type ChildNode } from 'domhandler'
import { processClass, processStyle, processTabIndex } from './attribs'

export const parse = (htmlStr: string): string => {
  const parsedDocument = parseDocument(htmlStr, {
    lowerCaseTags: false,
    xmlMode: true,
  })

  processAttributes(parsedDocument.children)
  htmlStr = serializer(parsedDocument, { selfClosingTags: true })

  return htmlStr
}

export const processAttributes = (childNodes: ChildNode[]): void => {
  processStyle(childNodes)
  processClass(childNodes)
  processTabIndex(childNodes)
}
