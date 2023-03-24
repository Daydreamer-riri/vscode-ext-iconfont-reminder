import type { DecorationOptions, ExtensionContext } from 'vscode'
import { commands } from 'vscode'
import { configRef } from './config'

export interface DecorationMatch extends DecorationOptions {
  key: string
}

export function registerCommands(ctx: ExtensionContext) {
  ctx.subscriptions.push(
    commands.registerCommand('iconfont-reminder.toggle-annotations', () => {
      const config = configRef.value!
      config?.setConfig('annotations', !config.annotations)
      config.annotations = !config.annotations
    }),
  )

  ctx.subscriptions.push(
    commands.registerCommand('iconfont-reminder.toggle-inplace', () => {
      const config = configRef.value!
      config?.setConfig('inplace', !config.inplace)
      config.inplace = !config.inplace
    }),
  )

  ctx.subscriptions.push(
    commands.registerCommand('iconfont-reminder.reload', () => {
      configRef.value?.resetCodeMap()
      configRef.value?.resetMapGraph()
    }),
  )
}
