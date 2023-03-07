import { resolve } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { ExtensionContext, window, commands, StatusBarAlignment } from 'vscode'
import { parseIconfont } from './utils'
import { decorator } from './decorator'
import { Config, setConfig } from './config'
import { transpileModule } from 'typescript'

let config: Config | null = null

export function activate(context: ExtensionContext) {
  console.log(
    'Congratulations, your extension "iconfont-display" is now active!'
  )
  config = setConfig()
  if (config == null) return
  const status = window.createStatusBarItem(StatusBarAlignment.Left, 0)

  window.showInformationMessage('Hello World from iconfont-display!')

  let disposable = commands.registerCommand('iconfontDisplay.start', () => {
    // window.showInformationMessage('Iconfont-display start!')
    if (config == null) return
  })

  context.subscriptions.push(disposable)

  // activeEditor是当前活跃（展示）的文档编辑器实例
  let activeEditor = window.activeTextEditor

  const codeMap = parseIconfont(config.svgPath, status)

  decorator(context, config, codeMap)
}

export function deactivate() {
  config = null
}
