import {
  TextDocument,
  window,
  workspace,
  type TextEditorDecorationType,
  type TextEditor,
  type StatusBarItem,
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

function toSvg(path: string) {
  return (color: string) =>
    `<svg viewBox='0 0 1035 1035' width='256' xmlns='http://www.w3.org/2000/svg' style='transform:rotateX(180deg) scale(.9);transform-origin:center;'><path fill='%23${color}' d='${path}'></path></svg>`
}

export function parseIconfont(svgPath: string, status: StatusBarItem) {
  try {
    const resolvedSvgPath = tryResolveFile(svgPath)
    if (!resolvedSvgPath) return {}
    const str = readFileSync(resolvedSvgPath, 'utf-8')

    // 构建单个 icon 的数据结构
    const singleIconRegx =
      /<glyph[\s\S]*?glyph-name=\"(.*?)\"[\s\S]*?unicode=\"(.*?)\"[\s\S]*?d=\"(.*?)\"[\s\S]*?\/>/g
    const codeMap: Record<string, (color: string) => string> = {}

    let match = singleIconRegx.exec(str)
    while (match) {
      const [, , code, path] = match
      codeMap[code] = toSvg(path)
      match = singleIconRegx.exec(str)
    }

    return codeMap
  } catch (error) {
    status.text = 'iconfont 解析出错'
    status.show()
    console.error(error)
    return {}
  }
}
