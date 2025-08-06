import { ChildNode } from 'domhandler'
import { filter, getAttributeValue, hasAttrib, isTag } from 'domutils'

// class -> className
export const processClass = (childNodes: ChildNode[]) => {
  const nodesHasClass = filter(
    (node) => {
      return isTag(node) && hasAttrib(node, 'class')
    },
    childNodes,
    true,
  )

  for (const node of nodesHasClass) {
    if (isTag(node)) {
      const classStr = getAttributeValue(node, 'class') || ''

      node.attribs.className = classStr
      delete node.attribs.class
    }
  }
}

export const processStyle = (childNodes: ChildNode[]) => {
  const NodesHasStyle = filter(
    (node) => {
      return isTag(node) && hasAttrib(node, 'style')
    },
    childNodes,
    true,
  )

  for (const node of NodesHasStyle) {
    if (isTag(node)) {
      let styleStr = getAttributeValue(node, 'style') || ''
      const styleObj = parseStyleString(styleStr)
      node.attribs.style = JSON.stringify(styleObj)
    }
  }
}

// tabindex -> tabIndex
export const processTabIndex = (childNodes: ChildNode[]) => {
  const NodesHasTabindex = filter(
    (node) => {
      return isTag(node) && hasAttrib(node, 'tabindex')
    },
    childNodes,
    true,
  )

  for (const node of NodesHasTabindex) {
    if (isTag(node)) {
      let tabindex = getAttributeValue(node, 'tabindex') || ''
      node.attribs.tabIndex = tabindex
      delete node.attribs.tabindex
    }
  }
}

const parseStyleString = (styleStr: string): Record<string, string> => {
  return Object.fromEntries(
    styleStr
      .split(';')
      .filter(Boolean)
      .map((s) => s.split(':').map((part) => part.trim())),
  )
}
