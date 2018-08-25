# ESDoc Integrate Manual Plugin
## Install
```bash
npm install esdoc-integrate-manual-plugin
```

## Config
```json
{
  "source": "./src",
  "destination": "./doc",
  "plugins": [
    {
      "name": "esdoc-integrate-manual-plugin",
      "option": {
        "index": "./manual/index.md",
        // Manual shource folder, you would probably like to change the manualV2-builder prefixPath option to reflect this.
        "manualFolder": "./manual/"
      }
    }
  ]
}
```

## LICENSE
MIT

## Author
[Ryo Maruyama@h13i32maru](https://github.com/h13i32maru)
