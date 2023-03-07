import {
  TextDocument,
  window,
  workspace,
  type TextEditorDecorationType,
  type TextEditor,
} from 'vscode'
import { join, resolve } from 'node:path'
import { readFileSync } from 'node:fs'

export function formatIconCode(codeStr: string) {
  if (typeof codeStr != 'string') {
    return codeStr
  }
  const code = codeStr.replace(/&#x([0-9a-fA-F]+);/g, function (all, hex) {
    return String.fromCodePoint(parseInt(hex, 0x10))
  })
  return code
}

export function findEditorsForDocument(document: TextDocument) {
  // return window.visibleTextEditors.filter(p => p.document.uri === document.uri)
  return [...window.visibleTextEditors]
}

export const clearEditorDecorations = (
  document: TextDocument,
  decorations: TextEditorDecorationType[]
) => {
  const editors: TextEditor[] = findEditorsForDocument(document)
  if (editors) {
    decorations.forEach(decoration => {
      decoration.dispose()
      editors.forEach(editor => editor.setDecorations(decoration, []))
    })
  }
}

export function resolveRoot() {
  const root = getWorkspaceFolderPath(window.activeTextEditor)
  return root ?? null
}

export function tryResolveFile(path: string) {
  const root = resolveRoot()
  if (!root) return null
  let basePath: string
  if (path.startsWith('.')) {
    basePath = join(root, '.vscode')
  } else if (path.startsWith('/')) {
    basePath = root
  } else {
    return null
  }
  return resolve(basePath, path)
}

export function getConfiguredProperty<T>(
  documentOrEditor: TextDocument | TextEditor | undefined,
  property: string,
  fallback: T
): T {
  const document = !documentOrEditor
    ? void 0
    : isEditor(documentOrEditor)
    ? documentOrEditor.document
    : documentOrEditor
  const config = workspace.getConfiguration(
    'iconfontDisplay',
    document ? document.uri : undefined
  )
  return config.get(property.toLowerCase(), config.get(property, fallback))
}

export function getWorkspaceFolderPath(
  documentOrEditor?: TextDocument | TextEditor
) {
  if (!documentOrEditor) return
  const document = isEditor(documentOrEditor)
    ? documentOrEditor.document
    : documentOrEditor
  return workspace.getWorkspaceFolder(document.uri)?.uri.fsPath
}

function isEditor(
  documentOrEditor: TextDocument | TextEditor
): documentOrEditor is TextEditor {
  return (documentOrEditor as any).document != null
}
