import { Position, Range, Uri, window, workspace } from 'vscode'
import type {
  DecorationOptions,
  DecorationRenderOptions,
  ExtensionContext,
  TextDocument,
  TextEditor,
  TextEditorDecorationType,
} from 'vscode'
import { findEditorsForDocument } from './utils'
import { configRef } from './config'
import { CODE_RE, DARK_COLOR, LIGHT_COLOR } from './constant'

export function registerDecorations(context: ExtensionContext) {
  // const { mapFile, codeMap } = config
  const disposes: (() => void)[] = []

  const throttleIds: Record<string, NodeJS.Timeout> = {}

  const throttledScan = (document: TextDocument, timeout = 0) => {
    if (document && document.uri) {
      const lookupKey = document.uri.toString()
      if (throttleIds[lookupKey])
        clearTimeout(throttleIds[lookupKey])
      throttleIds[lookupKey] = setTimeout(() => {
        scan(document)
        delete throttleIds[lookupKey]
      }, timeout)
    }
  }

  const decorate = (editor: TextEditor) => {
    const config = configRef.value!

    const text = editor.document.getText()

    let match
    while ((match = CODE_RE.exec(text))) {
      const startPos = new Position(
        editor.document.positionAt(match.index).line,
        2,
      ) // 开始位置
      const endPos = editor.document.positionAt(
        match.index + match[0].length + 1,
      ) // 结束位置

      const svg = config.codeMap[match[0]]
      if (!svg)
        continue

      const decorations: DecorationOptions[] = [
        {
          range: new Range(startPos, endPos),
          hoverMessage: '',
        },
      ]
      const decorationRenderOptions: DecorationRenderOptions = {
        light: {
          gutterIconPath: Uri.parse(
            `data:image/svg+xml;utf8,${svg(LIGHT_COLOR).replace('#', '%23')}`,
          ),
          gutterIconSize: 'contain',
        },
        dark: {
          gutterIconPath: Uri.parse(
            `data:image/svg+xml;utf8,${svg(DARK_COLOR).replace('#', '%23')}`,
          ),
          gutterIconSize: 'contain',
        },
      }
      const textEditorDecorationType: TextEditorDecorationType
        = window.createTextEditorDecorationType(<any>decorationRenderOptions)
      disposes.push(textEditorDecorationType.dispose)
      editor.setDecorations(textEditorDecorationType, decorations)
    }
  }

  const refreshAllVisibleEditors = () => {
    window.visibleTextEditors
      .map(p => p.document)
      .filter(p => p != null)
      .forEach(doc => throttledScan(doc))
  }

  function scan(document: TextDocument) {
    const config = configRef.value!

    if (document.fileName !== config.mapFile)
      return
    const editors = findEditorsForDocument(document)
    if (editors.length === 0)
      return

    disposes.forEach(d => d())
    disposes.length = 0

    editors.forEach((editor) => {
      decorate(editor)
    })
  }

  context.subscriptions.push(
    workspace.onDidChangeTextDocument((e) => {
      if (e)
        throttledScan(e.document)
    }),
  )
  context.subscriptions.push(
    window.onDidChangeActiveTextEditor((e) => {
      if (e)
        throttledScan(e.document)
    }),
  )
  context.subscriptions.push(
    window.onDidChangeTextEditorVisibleRanges((event) => {
      if (event && event.textEditor && event.textEditor.document) {
        const document = event.textEditor.document
        throttledScan(document, 50)
      }
    }),
  )
  context.subscriptions.push(
    workspace.onDidChangeWorkspaceFolders(() => {
      refreshAllVisibleEditors()
    }),
  )
  context.subscriptions.push(
    workspace.onDidOpenTextDocument((e) => {
      if (e)
        throttledScan(e)
    }),
  )

  refreshAllVisibleEditors()
}
