import type { ExtensionContext } from 'vscode'
import { registerDecorations } from './decorations'
import { registerCompletions } from './completions'
import { registerHover } from './hover'
import { registerCommands } from './commands'
import { registerAnnotations } from './annotation'
import { type Config, resolveConfig } from './config'

let config: Config | null = null

export async function activate(context: ExtensionContext) {
  config = await resolveConfig(context)
  if (config == null)
    return
  registerDecorations(context)
  registerCompletions(context)
  registerHover(context)
  registerCommands(context)
  registerAnnotations(context)
}

export function deactivate() {
  config = null
}
