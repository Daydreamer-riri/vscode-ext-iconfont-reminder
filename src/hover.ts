import type { ExtensionContext, HoverProvider } from 'vscode'
import { Hover, MarkdownString, Position, Range, Uri, languages } from 'vscode'
import type { Config } from './config'
import { LANGUAGE_IDS, getPROP_NAME_RE } from './constant'
import { getSvgColor } from './utils'

export function registerHover(context: ExtensionContext, config: Config) {
  const { mapGraph, codeMap, compName } = config
  const PROP_NAME_RE = getPROP_NAME_RE(compName)
  const { names } = mapGraph

  const hoverProvider: HoverProvider = {
    provideHover(document, position) {
      const line = document.getText(
        new Range(
          new Position(position.line - 5, 0),
          new Position(position.line, position.character),
        ),
      )

      if (!PROP_NAME_RE.test(line))
        return null

      const word = document.getText(document.getWordRangeAtPosition(position))
      if (!names.includes(word))
        return null

      const code = mapGraph.getCodeByName(word)
      if (!code)
        return null
      const svg = codeMap[code]
      const url = Uri.parse(
        `data:image/svg+xml;utf8,${svg(getSvgColor()).replace('#', '%23')}`,
      )
      const markdownString = new MarkdownString(
        `<p align="center"><img height="64" src="${url.toString(true)}" ></p>
        <p align="center">${word}</p>`,
      )

      markdownString.supportHtml = true

      return new Hover(markdownString)
    },
  }

  context.subscriptions.push(
    languages.registerHoverProvider(LANGUAGE_IDS, hoverProvider),
  )
}
