import { window } from 'vscode'
import { getConfiguredProperty, resolveRoot, tryResolveFile } from './utils'
import { parseIconfont } from './svg'

export interface Config {
  mapFile: string
  root: string
  svgPath: string
  codeMap: ReturnType<typeof parseIconfont>
}

export function resolveConfig() {
  let activeEditor = window.activeTextEditor

  const mapFilePath = getConfiguredProperty(activeEditor, 'mapFilePath', null)
  const svgPath = getConfiguredProperty(activeEditor, 'svgPath', null)
  if (!mapFilePath || !svgPath) return null

  const mapFile = tryResolveFile(mapFilePath)
  const root = resolveRoot()
  if (!mapFile || !root) return null

  const codeMap = parseIconfont(svgPath)

  return {
    codeMap,
    svgPath,
    root,
    mapFile,
  } as Config
}
