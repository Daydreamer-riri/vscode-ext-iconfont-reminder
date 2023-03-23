import { execSync } from 'node:child_process'
import * as fs from 'fs-extra'

async function build() {
  await fs.remove('./dist')
  execSync('tsup src/extension.ts --format cjs --external vscode --no-shims', { stdio: 'inherit' })

  const files = [
    'LICENSE',
    'README.md',
    // 'snippets',
    '.vscodeignore',
    // 'res',
  ]

  for (const f of files)
    await fs.copy(`./${f}`, `./dist/${f}`)

  const json = await fs.readJSON('./package.json')
  delete json.scripts
  delete json.devDependencies
  json.main = 'extension.js'
  await fs.writeJSON('./dist/package.json', json)
}

build()
