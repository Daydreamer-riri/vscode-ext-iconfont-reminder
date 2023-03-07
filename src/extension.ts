import { ExtensionContext, window, commands } from 'vscode'
import { decorator } from './decorator'
import { Config, resolveConfig } from './config'

let config: Config | null = null

export function activate(context: ExtensionContext) {
  console.log(
    'Congratulations, your extension "iconfont-display" is now active!'
  )
  config = resolveConfig()
  if (config == null) return

  window.showInformationMessage('Hello World from iconfont-display!')

  let disposable = commands.registerCommand('iconfontDisplay.start', () => {
    // window.showInformationMessage('Iconfont-display start!')
    if (config == null) return
  })

  context.subscriptions.push(disposable)

  // activeEditor是当前活跃（展示）的文档编辑器实例
  let activeEditor = window.activeTextEditor

  decorator(context, config)
}

export function deactivate() {
  config = null
}
