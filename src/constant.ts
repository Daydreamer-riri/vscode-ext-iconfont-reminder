export const getPROP_NAME_RE = (compName: string) =>
  new RegExp(`<${compName}[\\s\\n\\t][\\s\\S^>]*?name={?['"][\\w-]*$`)
export const getPROP_NAME_TERNARY_RE = (compName: string) =>
  [
    new RegExp(
    `<${compName}[\\s\\n\\t][\\s\\S^>]*?name={[\\s\\S^'^"^}]*?\\?[\\s\\n\\t]*['"][\\w-]*$`,
    ),
    new RegExp(
    `<${compName}[\\s\\n\\t][\\s\\S^>]*?name={[\\s\\S^'^"^}]*?\\?[\\s\\n\\t]*['"][\\w-]*?['"][\\s\\n\\t]*:[\\s\\n\\t]*['"][\\w-]*$`,
    ),
  ]
export const LANGUAGE_IDS = [
  'vue',
  'typescript',
  'javascript',
  'javascriptreact',
  'typescriptreact',
]
export const CODE_RE = /&#.*?;/gi
export const DARK_COLOR = '9db1d5'
export const LIGHT_COLOR = '657289'
