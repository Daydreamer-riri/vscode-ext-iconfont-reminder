import type { ExtensionContext } from 'vscode'
import { registerDecorations } from './decorations'
import { registerCompletions } from './completions'
import { registerHover } from './hover'
import { type Config, resolveConfig } from './config'

let config: Config | null = null

export function activate(context: ExtensionContext) {
  config = resolveConfig()
  if (config == null)
    return

  registerDecorations(context, config)
  registerCompletions(context, config)
  registerHover(context, config)
}

export function deactivate() {
  config = null
}
