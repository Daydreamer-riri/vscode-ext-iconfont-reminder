import { MarkdownString, Uri } from 'vscode'
import { configRef } from './config'
import { getSvgColor } from './utils'

export function getIconMarkDown(name: string) {
  const config = configRef.value
  const code = config?.mapGraph.getCodeByName(name)
  const svg = config?.codeMap[code ?? '']
  if (!code || !svg)
    return ''
  const url = Uri.parse(
        `data:image/svg+xml;utf8,${svg(getSvgColor()).replace('#', '%23')}`,
  )
  const icon = `<img height="64" src="${url.toString(true)}" >`
  const markdownString = new MarkdownString(
    `<p align="center">${icon}</p> \n <p align="center"><code>${name}: ${code.slice(3, code.length - 1)}</code></p> \n`,
  )

  markdownString.supportHtml = true
  return markdownString
}
