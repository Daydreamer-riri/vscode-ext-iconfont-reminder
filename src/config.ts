import * as fs from 'node:fs'
import { window } from 'vscode'
import { getConfiguredProperty, resolveRoot, tryResolveFile } from './utils'
import { parseIconfont } from './svg'

type MapGraph = NonNullable<ReturnType<typeof createMapGraph>>

export interface Config {
  mapFile: string
  root: string
  svgPath: string
  codeMap: ReturnType<typeof parseIconfont>
  mapGraph: MapGraph
  compName: string
}

export function resolveConfig() {
  const activeEditor = window.activeTextEditor

  const mapFilePath = getConfiguredProperty(activeEditor, 'mapFilePath', null)
  const svgPath = getConfiguredProperty(activeEditor, 'svgPath', null)
  if (!mapFilePath || !svgPath)
    return null

  const mapFile = tryResolveFile(mapFilePath)
  const root = resolveRoot()
  if (!mapFile || !root)
    return null
  const mapGraph = createMapGraph(mapFile)
  if (!mapGraph)
    return null

  const codeMap = parseIconfont(svgPath)
  const compName = getConfiguredProperty(activeEditor, 'componentName', 'Icon')
  return {
    codeMap,
    svgPath,
    root,
    mapFile,
    mapGraph,
    compName,
  } as Config
}

function createMapGraph(mapFile: string) {
  if (!mapFile.endsWith('.json'))
    return null
  if (!fs.existsSync(mapFile))
    return null

  const originMap: Record<string, string> = JSON.parse(
    fs.readFileSync(mapFile, 'utf-8'),
  )
  const entries = Object.entries(originMap)
  const names = Object.keys(originMap)
  const codes = Object.values(originMap)

  const nameToCodeMap = new Map(entries)
  const codeToNameMap = new Map(entries.map(entry => [entry[1], entry[0]]))

  function getNameByCode(code: string) {
    return codeToNameMap.get(code)
  }

  function getCodeByName(name: string) {
    return nameToCodeMap.get(name)
  }

  const mapGraph = { originMap, getCodeByName, getNameByCode, names, codes }

  return mapGraph
}
