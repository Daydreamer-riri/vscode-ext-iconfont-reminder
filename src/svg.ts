import { readFileSync } from 'node:fs'

function toSvg(path: string) {
  return (color: string) =>
    `<svg viewBox='0 0 1035 1035' width='256' xmlns='http://www.w3.org/2000/svg' style='transform:rotateX(180deg) scale(.9);transform-origin:center;'><path fill='#${color}' d='${path}'></path></svg>`
}

export function parseIconfont(resolvedSvgPath: string) {
  try {
    if (!resolvedSvgPath)
      return {}
    const str = readFileSync(resolvedSvgPath, 'utf-8')

    // 构建单个 icon 的数据结构
    const singleIconRegx
      = /<glyph[\s\S]*?glyph-name=\"(.*?)\"[\s\S]*?unicode=\"(.*?)\"[\s\S]*?d=\"(.*?)\"[\s\S]*?\/>/g
    const codeMap: Record<string, (color: string) => string> = {}

    let match = singleIconRegx.exec(str)
    while (match) {
      const [, , code, path] = match
      codeMap[code] = toSvg(path)
      match = singleIconRegx.exec(str)
    }

    return codeMap
  }
  catch (error) {
    console.error(error)
    return {}
  }
}
