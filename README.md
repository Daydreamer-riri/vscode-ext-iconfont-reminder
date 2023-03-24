<h1 align="center">Iconfont reminder <sup>VS Code</sup></h1>

<p align="center">
The preview of the iconfont icon component for VS Code.<br>
</p>

## Config

| properties | description | type | default |
| --- | --- | --- | --- |
| mapFilePath | File describing the iconfont mapping | `string` | - |
| svgPath | Svg file | `string` | - |
|componentName| Component name | `string` | 'Icon' |

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

## Preview

<p align="center">
  <img src="https://github.com/Daydreamer-riri/vscode-ext-iconfont-reminder/blob/main/screenshots/preview.png?raw=true" alt="preview">
</p>

- map file

![map-file](https://github.com/Daydreamer-riri/vscode-ext-iconfont-reminder/blob/main/screenshots/mapfile.png?raw=true)

- hover

![hover](https://user-images.githubusercontent.com/70067449/225299495-4386c5fe-fc46-49d0-88dd-4749213120d5.png)
