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
  annotations: boolean
  inplace: boolean
  fontSize: number
  root: string
  svgPath: string
  codeMap: ReturnType<typeof parseIconfont>
  mapGraph: MapGraph
  compName: string
  resetMapGraph(): Promise<void>
  resetCodeMap(): void
  setConfig(key: string, value: any): void
}
export const configRef: { value: Config | null } = { value: null }

function getConfig<T = any>(key: string): T | undefined {
  return workspace
    .getConfiguration()
    .get<T>(key)
}

async function setConfig(key: string, value: any) {
  return await workspace
    .getConfiguration()
    .update(`iconfontReminder.${key}`, value, false)
}

export async function resolveConfig(context: ExtensionContext): Promise<Config | null> {
  const activeEditor = window.activeTextEditor

  const mapFilePath = getConfiguredProperty(activeEditor, 'mapFilePath', null)
  const svgPath = getConfiguredProperty(activeEditor, 'svgPath', null)
  if (!mapFilePath || !svgPath)
    return null

  const mapFile = tryResolveFile(mapFilePath)
  const svgFile = tryResolveFile(svgPath)
  const root = resolveRoot()
  if (!mapFile || !root || !svgFile)
    return null
  const mapGraph = await createMapGraph(mapFile)
  if (!mapGraph)
    return null

  const fontSize = getConfig('editor.fontSize') ?? 12
  const codeMap = parseIconfont(svgFile, fontSize)
  const compName = getConfiguredProperty(activeEditor, 'componentName', 'Icon')
  configRef.value = {
    annotations: getConfiguredProperty(undefined, 'annotations', true),
    inplace: getConfiguredProperty(undefined, 'inplace', true),
    fontSize,
    codeMap,
    svgPath,
    root,
    mapFile,
    mapGraph,
    compName,
    async resetMapGraph() {
      configRef.value!.mapGraph = (await createMapGraph(mapFile)) ?? configRef.value!.mapGraph
    },
    resetCodeMap() {
      configRef.value!.codeMap = parseIconfont(svgPath, fontSize)
    },
    setConfig,
  }

  context.subscriptions.push(
    workspace.onDidSaveTextDocument(async (e) => {
      if (e.fileName === mapFile)
        configRef.value?.resetMapGraph()
      if (e.fileName === svgFile)
        configRef.value?.resetCodeMap()
    }),
  )

  context.subscriptions.push(
    workspace.onDidCreateFiles((e) => {
      if (
        e.files.some(({ fsPath }) => fsPath === svgPath,
        ))
        configRef.value?.resetCodeMap()
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

export function getNAME_RE() {
  const names = configRef.value?.mapGraph.names ?? []
  return new RegExp(`[^\\w\\d]((?:${names.join('|')}))`, 'g')
}
