import {
  CompletionItem,
  CompletionItemKind,
  Position,
  Range,
  languages,
} from 'vscode'
import type { CompletionItemProvider, ExtensionContext } from 'vscode'
import { LANGUAGE_IDS, getPROP_NAME_RE, getPROP_NAME_TERNARY_RE } from './constant'
import { configRef } from './config'
import { getIconMarkDown } from './markdown'

export function registerCompletions(context: ExtensionContext) {
  const config = configRef.value!
  // const { mapGraph, codeMap, compName } = config
  const PROP_NAME_RE = getPROP_NAME_RE(config.compName)
  const PROP_NAME_TERNARY_RE = getPROP_NAME_TERNARY_RE(config.compName)

  const iconProvider: CompletionItemProvider = {
    provideCompletionItems(document, position) {
      const line = document.getText(
        new Range(
          new Position(Math.max(0, position.line - 5), 0),
          new Position(position.line, position.character),
        ),
      )

      if (!PROP_NAME_RE.test(line) && !PROP_NAME_TERNARY_RE.some(reg => reg.test(line)))
        return null

      const { names } = config.mapGraph

      const completionItems: CompletionItem[] = names.map((icon: string) => {
        const item = new CompletionItem(icon, CompletionItemKind.Color)
        item.detail = icon
        return item
      })

      return completionItems
    },

    resolveCompletionItem(completionItem) {
      const name = completionItem.label as string
      return {
        ...completionItem,
        documentation: getIconMarkDown(name),
      }
    },
  }

  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      LANGUAGE_IDS,
      iconProvider,
      '"', '\'',
    ),
  )
}
