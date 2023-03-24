import type { DecorationOptions, ExtensionContext } from 'vscode'
import { commands } from 'vscode'
import { configRef } from './config'

export interface DecorationMatch extends DecorationOptions {
  key: string
}

export function registerCommands(ctx: ExtensionContext) {
  // ctx.subscriptions.push(
  //   commands.registerCommand('iconify.toggle-annotations', () => {
  //     config.annotations = !config.annotations
  //   }),
  // )

  // ctx.subscriptions.push(
  //   commands.registerCommand('iconify.toggle-inplace', () => {
  //     config.inplace = !config.inplace
  //   }),
  // )

  ctx.subscriptions.push(
    commands.registerCommand('iconfont-reminder.reload', () => {
      configRef.value?.resetCodeMap()
      configRef.value?.resetMapGraph()
    }),
  )
}
