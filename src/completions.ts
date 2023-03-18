import {
  CompletionItem,
  CompletionItemKind,
  MarkdownString,
  Position,
  Range,
  Uri,
  languages,
} from 'vscode'
import type { CompletionItemProvider, ExtensionContext } from 'vscode'
import { LANGUAGE_IDS, getPROP_NAME_RE } from './constant'
import type { Config } from './config'
import { getSvgColor } from './utils'

export function registerCompletions(context: ExtensionContext, config: Config) {
  const { mapGraph, codeMap, compName } = config
  const { names } = mapGraph
  const PROP_NAME_RE = getPROP_NAME_RE(compName)

  const iconProvider: CompletionItemProvider = {
    provideCompletionItems(document, position) {
      const line = document.getText(
        new Range(
          new Position(position.line - 5, 0),
          new Position(position.line, position.character),
        ),
      )

      if (!PROP_NAME_RE.test(line))
        return null

      const completionItems: CompletionItem[] = names.map((icon: string) => {
        return new CompletionItem(icon, CompletionItemKind.Field)
      })

      return completionItems
    },

    resolveCompletionItem(completionItem) {
      const name = completionItem.label as string
      const code = mapGraph.getCodeByName(name)
      if (!code)
        return completionItem
      const svg = codeMap[code]
      const url = Uri.parse(
        `data:image/svg+xml;utf8,${svg(getSvgColor()).replace('#', '%23')}`,
      )
      const markdownString = new MarkdownString(`####    Icon: ${name}
<p align="center"><img height="64" src="${url.toString(true)}" ></p>
<div></div>
`)

      markdownString.supportHtml = true

      return {
        ...completionItem,
        documentation: markdownString,
      }
    },
  }

  context.subscriptions.push(
    languages.registerCompletionItemProvider(LANGUAGE_IDS, iconProvider),
  )
}
