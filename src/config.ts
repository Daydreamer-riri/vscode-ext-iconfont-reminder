import { existsSync } from 'fs'
import { window } from 'vscode'
import { getConfiguredProperty, resolveRoot, tryResolveFile } from './utils'

export interface Config {
  mapFile: string
  fontFamily: string
  root: string
  svgPath: string
}

export function setConfig() {
  let activeEditor = window.activeTextEditor

  const mapFilePath = getConfiguredProperty(activeEditor, 'mapFilePath', null)
  const fontFamily = getConfiguredProperty(activeEditor, 'fontFamily', null)
  const svgPath = getConfiguredProperty(activeEditor, 'svgPath', null)
  if (!mapFilePath || !fontFamily || !svgPath) return null

  const mapFile = tryResolveFile(mapFilePath)
  const root = resolveRoot()
  if (!mapFile || !root) return null

  return {
    svgPath,
    root,
    mapFile,
    fontFamily,
  } as Config
}
