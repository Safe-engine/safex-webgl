import { isString } from '../../helper/checkType'
import { loader } from '../../helper/loader'
import { path } from '../../helper/path'
import { textureCache } from '../../textures/TextureCache'
import { plistParser } from './SAXParser'

const _txtLoader = {
  load: function (realUrl, url, res, cb) {
    loader.loadTxt(realUrl, cb)
  },
}
loader.register(['txt', 'xml', 'vsh', 'fsh', 'atlas'], _txtLoader)

const _jsonLoader = {
  load: function (realUrl, url, res, cb) {
    loader.loadJson(realUrl, cb)
  },
}
loader.register(['json', 'ExportJson'], _jsonLoader)

// const _jsLoader = {
//   load: function (realUrl, url, res, cb) {
//     loader.loadJs(realUrl, cb)
//   },
// }
// loader.register(['js'], _jsLoader)

const _imgLoader = {
  load: function (realUrl, url, res, cb) {
    let callback
    if (loader.isLoading(realUrl)) {
      callback = function (err, img) {
        if (err) return cb(err)
        const tex = textureCache.getTextureForKey(url) || textureCache.handleLoadedTexture(url, img)
        cb(null, tex)
      }
    } else {
      callback = function (err, img) {
        if (err) return cb(err)
        const tex = textureCache.handleLoadedTexture(url, img)
        cb(null, tex)
      }
    }
    loader.loadImg(realUrl, callback)
  },
}
loader.register(['png', 'jpg', 'bmp', 'jpeg', 'gif', 'ico', 'tiff', 'webp'], _imgLoader)
const _serverImgLoader = {
  load: function (realUrl, url, res, cb) {
    _imgLoader.load(res.src, url, res, cb)
  },
}
loader.register(['serverImg'], _serverImgLoader)

const _plistLoader = {
  load: function (realUrl, url, res, cb) {
    loader.loadTxt(realUrl, function (err, txt) {
      if (err) return cb(err)
      cb(null, plistParser.parse(txt))
    })
  },
}
loader.register(['plist'], _plistLoader)

const _fontLoader = {
  TYPE: {
    '.eot': 'embedded-opentype',
    '.ttf': 'truetype',
    '.ttc': 'truetype',
    '.woff': 'woff',
    '.svg': 'svg',
  },
  _loadFont: function (name, srcs, type) {
    const doc = document
    const TYPE = this.TYPE
    const fontStyle = document.createElement('style')
    fontStyle.type = 'text/css'
    doc.body.appendChild(fontStyle)

    let fontStr = ''
    if (isNaN(name - 0)) fontStr += `@font-face { font-family:${name}; src:`
    else fontStr += '@font-face { font-family:\'" + name + "\'; src:'
    if (srcs instanceof Array) {
      for (let i = 0, li = srcs.length; i < li; i++) {
        const src = srcs[i]
        type = path.extname(src).toLowerCase()
        fontStr += `url('${srcs[i]}') format('${TYPE[type]}')`
        fontStr += i === li - 1 ? ';' : ','
      }
    } else {
      type = type.toLowerCase()
      fontStr += `url('${srcs}') format('${TYPE[type]}');`
    }
    fontStyle.textContent += `${fontStr}}`

    //<div style="font-family: PressStart;">.</div>
    const preloadDiv = document.createElement('div')
    const _divStyle = preloadDiv.style
    _divStyle.fontFamily = name
    preloadDiv.innerHTML = '.'
    _divStyle.position = 'absolute'
    _divStyle.left = '-100px'
    _divStyle.top = '-100px'
    doc.body.appendChild(preloadDiv)
  },
  load: function (realUrl, url, res, cb) {
    // let type = res.type
    let name = res.name
    const srcs = res.srcs
    if (isString(res)) {
      const type = path.extname(res)
      name = path.basename(res, type)
      this._loadFont(name, res, type)
    } else {
      this._loadFont(name, srcs)
    }
    if (document.fonts) {
      document.fonts.load(`1em ${name}`).then(
        function () {
          cb(null, true)
        },
        function (err) {
          cb(err)
        },
      )
    } else {
      cb(null, true)
    }
  },
}
loader.register(['font', 'eot', 'ttf', 'woff', 'svg', 'ttc'], _fontLoader)

// const _binaryLoader = {
//   load: function (realUrl, url, res, cb) {
//     loader.loadBinary(realUrl, cb)
//   },
// }

// const _csbLoader = {
//   load: function (realUrl, url, res, cb) {
//     loader.loadCsb(realUrl, cb)
//   },
// }
// loader.register(['csb'], _csbLoader)
