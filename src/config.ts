import * as fs from 'node:fs'
import type { ExtensionContext } from 'vscode'
import { window, workspace } from 'vscode'
import jiti from 'jiti'
import { getConfiguredProperty, resolveRoot, tryResolveFile } from './utils'
import { parseIconfont } from './svg'

type UnPromisify<T> = T extends Promise<infer U> ? U : never

type MapGraph = NonNullable<UnPromisify<ReturnType<typeof createMapGraph>>>

export interface Config {
  mapFile: string
  root: string
  svgPath: string
  codeMap: ReturnType<typeof parseIconfont>
  mapGraph: MapGraph
  compName: string
}
export const configRef: { value: Config | null } = { value: null }

export async function resolveConfig(context: ExtensionContext) {
  const activeEditor = window.activeTextEditor

  const mapFilePath = getConfiguredProperty(activeEditor, 'mapFilePath', null)
  const svgPath = getConfiguredProperty(activeEditor, 'svgPath', null)
  if (!mapFilePath || !svgPath)
    return null

  const mapFile = tryResolveFile(mapFilePath)
  const root = resolveRoot()
  if (!mapFile || !root)
    return null
  const mapGraph = await createMapGraph(mapFile)
  if (!mapGraph)
    return null

  const codeMap = parseIconfont(svgPath)
  const compName = getConfiguredProperty(activeEditor, 'componentName', 'Icon')
  configRef.value = {
    codeMap,
    svgPath,
    root,
    mapFile,
    mapGraph,
    compName,
  } as Config

  context.subscriptions.push(
    workspace.onDidSaveTextDocument((e) => {
      console.log('e.fileName', e.fileName)
      console.log('mapFile', mapFile)
    }),
  )

  return configRef.value
}

async function createMapGraph(mapFile: string) {
  // if (!mapFile.endsWith('.json'))
  //   return null
  if (!fs.existsSync(mapFile))
    return null

  const originMap: Record<string, string> = await jiti(mapFile, {
    interopDefault: true,
    cache: false,
    requireCache: false,
    v8cache: false,
    esmResolve: true,
  })(mapFile)
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
