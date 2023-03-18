import { join, resolve } from 'node:path'
import type { TextDocument, TextEditor } from 'vscode'
import { window, workspace } from 'vscode'
import { DARK_COLOR, LIGHT_COLOR } from './constant'

export function formatIconCode(codeStr: string) {
  if (typeof codeStr != 'string')
    return codeStr

  const code = codeStr.replace(/&#x([0-9a-fA-F]+);/g, (all, hex) => {
    return String.fromCodePoint(parseInt(hex, 0x10))
  })
  return code
}

export function findEditorsForDocument(_document: TextDocument) {
  // return window.visibleTextEditors.filter(p => p.document.uri === document.uri)
  return [...window.visibleTextEditors]
}

export function resolveRoot() {
  const root = getWorkspaceFolderPath(window.activeTextEditor)
  return root ?? null
}

export function tryResolveFile(path: string) {
  const root = resolveRoot()
  if (!root)
    return null
  let basePath: string
  if (path.startsWith('.'))
    basePath = join(root, '.vscode')

  else if (path.startsWith('/'))
    basePath = root

  else
    return null

  return resolve(basePath, path)
}

export function getConfiguredProperty<T>(
  documentOrEditor: TextDocument | TextEditor | undefined,
  property: string,
  fallback: T,
): T {
  const document = !documentOrEditor
    ? undefined
    : isEditor(documentOrEditor)
      ? documentOrEditor.document
      : documentOrEditor
  const config = workspace.getConfiguration(
    'iconfontDisplay',
    document ? document.uri : undefined,
  )
  return config.get(property.toLowerCase(), config.get(property, fallback))
}

export function getWorkspaceFolderPath(
  documentOrEditor?: TextDocument | TextEditor,
) {
  if (!documentOrEditor)
    return
  const document = isEditor(documentOrEditor)
    ? documentOrEditor.document
    : documentOrEditor
  return workspace.getWorkspaceFolder(document.uri)?.uri.fsPath
}

function isEditor(
  documentOrEditor: TextDocument | TextEditor,
): documentOrEditor is TextEditor {
  return (documentOrEditor as any).document != null
}

export function getSvgColor() {
  const { kind } = window.activeColorTheme
  if (kind === 2 || kind === 3)
    return DARK_COLOR
  else return LIGHT_COLOR
}
