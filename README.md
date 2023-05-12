<h1 align="center">Iconfont reminder <sup>VS Code</sup></h1>

<p align="center">
The preview of the iconfont icon component for VS Code.<br>
</p>

## Preview

<p align="center">
  <img 
    src="https://github.com/Daydreamer-riri/vscode-ext-iconfont-reminder/blob/main/screenshots/main.svg?raw=true"
    alt="preview"
    width="900"
  >
</p>

- map file

<p align="center">
  <img 
    src="https://github.com/Daydreamer-riri/vscode-ext-iconfont-reminder/blob/main/screenshots/map.svg?raw=true"
    alt="preview"
    width="600"
  >
</p>

## Config

| properties | description | type | default |
| --- | --- | --- | --- |
| mapFilePath | File describing the iconfont mapping | `string` | - |
| svgPath | Svg file | `string` | - |
|componentName| Component name | `string` | 'Icon' |

## Commands
```json
[{
  "command": "iconfont-reminder.toggle-annotations",
  "category": "iconfont-reminder",
  "title": "Toggle Annotations"
},
{
  "command": "iconfont-reminder.reload",
  "category": "iconfont-reminder",
  "title": "Reload"
},
{
  "command": "iconfont-reminder.toggle-inplace",
  "category": "iconfont-reminder",
  "title": "Toggle In-place Mode"
}]
```


### Example 
```json
// .vscode/settings.json
{
  "iconfontReminder.mapFilePath": "../map.ts",
  "iconfontReminder.svgPath": "../fonts/crn_font_custom_ctrip.svg"
}
```

### SvgRule

```svg
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <font id="crn_font_custom_ctrip" horiz-adv-x="1024">
      <font-face
        ...
      />
      <missing-glyph horiz-adv-x="0"/>
        <glyph
          unicode="&#xe945;"
          d=" ..." />
        <glyph
          unicode="&#xe946;"
          d=" ..." />
        <glyph
          unicode="&#xebb9;"
          d=" ..." />
  ...
```
