import { window, TextEditor, Range, Position, workspace, Uri } from 'vscode'
import type {
  TextDocument,
  TextEditorDecorationType,
  DecorationOptions,
  ExtensionContext,
  DecorationRenderOptions,
} from 'vscode'
import { findEditorsForDocument } from './utils'
import type { Config } from './config'
import { CODE_RE, DARK_COLOR, LIGHT_COLOR } from './constant'

export function registerDecorations(context: ExtensionContext, config: Config) {
  const { mapFile, codeMap } = config

  let throttleIds: Record<string, NodeJS.Timeout> = {}

  let throttledScan = (document: TextDocument, timeout: number = 0) => {
    if (document && document.uri) {
      const lookupKey = document.uri.toString()
      if (throttleIds[lookupKey]) clearTimeout(throttleIds[lookupKey])
      throttleIds[lookupKey] = setTimeout(() => {
        scan(document)
        delete throttleIds[lookupKey]
      }, timeout)
    }
  }

  const decorate = (editor: TextEditor) => {
    const text = editor.document.getText()

    let match
    while ((match = CODE_RE.exec(text))) {
      const startPos = new Position(
        editor.document.positionAt(match.index).line,
        2
      ) // 开始位置
      const endPos = editor.document.positionAt(
        match.index + match[0].length + 1
      ) // 结束位置

      const svg = codeMap[match[0]]
      if (!svg) continue

      const decorations: DecorationOptions[] = [
        {
          range: new Range(startPos, endPos),
          hoverMessage: '',
        },
      ]
      let decorationRenderOptions: DecorationRenderOptions = {
        light: {
          gutterIconPath: Uri.parse(
            `data:image/svg+xml;utf8,${svg(LIGHT_COLOR).replace('#', '%23')}`
          ),
          gutterIconSize: 'contain',
        },
        dark: {
          gutterIconPath: Uri.parse(
            `data:image/svg+xml;utf8,${svg(DARK_COLOR).replace('#', '%23')}`
          ),
          gutterIconSize: 'contain',
        },
      }
      let textEditorDecorationType: TextEditorDecorationType =
        window.createTextEditorDecorationType(<any>decorationRenderOptions)
      editor.setDecorations(textEditorDecorationType, decorations)
    }
  }

  const refreshAllVisibleEditors = () => {
    window.visibleTextEditors
      .map(p => p.document)
      .filter(p => p != null)
      .forEach(doc => throttledScan(doc))
  }

  const scan = (document: TextDocument) => {
    if (document.fileName !== mapFile) return
    const editors = findEditorsForDocument(document)
    if (editors.length === 0) return

    editors.forEach(editor => {
      decorate(editor)
    })
  }

  context.subscriptions.push(
    workspace.onDidChangeTextDocument(e => {
      if (e) {
        throttledScan(e.document)
      }
    })
  )
  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(e => {
      if (e) {
        throttledScan(e.document)
      }
    })
  )
  context.subscriptions.push(
    window.onDidChangeTextEditorVisibleRanges(event => {
      if (event && event.textEditor && event.textEditor.document) {
        const document = event.textEditor.document
        throttledScan(document, 50)
      }
    })
  )
  context.subscriptions.push(
    workspace.onDidChangeWorkspaceFolders(() => {
      refreshAllVisibleEditors()
    })
  )
  context.subscriptions.push(
    workspace.onDidOpenTextDocument(e => {
      if (e) {
        throttledScan(e)
      }
    })
  )

  refreshAllVisibleEditors()
}
