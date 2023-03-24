import type { DecorationOptions, ExtensionContext, TextEditor } from 'vscode'
import { DecorationRangeBehavior, Range, Uri, window, workspace } from 'vscode'

import { configRef, getNAME_RE } from './config'
import { getIconMarkDown } from './markdown'
import { getSvgColor, isTruthy } from './utils'

export interface DecorationMatch extends DecorationOptions {
  key: string
}

export function registerAnnotations(context: ExtensionContext) {
  const config = configRef.value!

  const InlineIconDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; opacity: 0.6 !important;',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const HideTextDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // a hack to inject custom style
  })

  let decorations: DecorationMatch[] = []
  let editor: TextEditor | undefined

  async function updateDecorations() {
    if (!editor)
      return
    if (!config.annotations) {
      editor.setDecorations(InlineIconDecoration, [])
      editor.setDecorations(HideTextDecoration, [])
    }
    if (editor.document.fileName === config.mapFile)
      return

    const text = editor.document.getText()
    let match
    const regex = getNAME_RE()
    regex.lastIndex = 0
    const keys: [Range, string][] = []

    while ((match = regex.exec(text))) {
      const key = match[1]
      if (!key)
        continue

      const startPos = editor.document.positionAt(match.index + 1)
      const endPos = editor.document.positionAt(match.index + key.length + 1)
      keys.push([new Range(startPos, endPos), key])
    }

    decorations = (keys.map(([range, key]) => {
      const name = config.mapGraph.getCodeByName(key)
      if (!name)
        return

      const svg = config.codeMap[name]
      const url = Uri.parse(
        `data:image/svg+xml;utf8,${svg(getSvgColor()).replace('#', '%23')}`,
      )

      const item: DecorationMatch = {
        range,
        renderOptions: {
          before: {
            contentIconPath: url,
            margin: `-${configRef.value!.fontSize}px 2px; transform: translate(1px, 1px) scale(1.4)`,
            width: `${configRef.value!.fontSize * 1.1}px`,
          },
        },
        hoverMessage: getIconMarkDown(name),
        key,
      }
      return item
    })).filter(isTruthy)

    refreshDecorations()
  }

  function refreshDecorations() {
    if (!editor)
      return

    if (!config.annotations) {
      editor.setDecorations(InlineIconDecoration, [])
      editor.setDecorations(HideTextDecoration, [])
      return
    }

    if (config.inplace) {
      editor.setDecorations(InlineIconDecoration, decorations)
      editor.setDecorations(
        HideTextDecoration,
        decorations
          .map(({ range }) => range)
          .filter(i => i.start.line !== editor!.selection.start.line),
      )
    }
    else {
      editor.setDecorations(HideTextDecoration, [])
    }
  }

  function updateEditor(_editor?: TextEditor) {
    if (!_editor || editor === _editor)
      return
    editor = _editor
    decorations = []
  }

  let timeout: NodeJS.Timer | undefined
  function triggerUpdateDecorations(_editor?: TextEditor) {
    updateEditor(_editor)

    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
    timeout = setTimeout(() => {
      updateDecorations()
    }, 200)
  }

  window.onDidChangeActiveTextEditor((e) => {
    triggerUpdateDecorations(e)
  }, null, context.subscriptions)

  workspace.onDidChangeTextDocument((event) => {
    if (window.activeTextEditor && event.document === window.activeTextEditor.document)
      triggerUpdateDecorations(window.activeTextEditor)
  }, null, context.subscriptions)

  workspace.onDidChangeConfiguration(async () => {
    triggerUpdateDecorations()
  }, null, context.subscriptions)

  window.onDidChangeVisibleTextEditors((editors) => {
    triggerUpdateDecorations(editors[0])
  }, null, context.subscriptions)

  window.onDidChangeTextEditorSelection((e) => {
    updateEditor(e.textEditor)
    refreshDecorations()
  })

  // on start up
  updateEditor(window.activeTextEditor)
  triggerUpdateDecorations()
}
