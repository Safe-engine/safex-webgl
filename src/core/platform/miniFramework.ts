import { sys } from '../../helper/sys'

/**
 * the dollar sign, classic like jquery, this selector add extra methods to HTMLElement without touching its prototype</br>
 * it is also chainable like jquery
 * @param {HTMLElement|String} x pass in a css selector in string or the whole HTMLElement
 * @function
 * @return {$}
 */
export const $ = function (x) {
  /** @lends $# */
  const parent = document

  const el = x instanceof HTMLElement ? x : parent.querySelector(x)

  if (el) {
    /**
     * find and return the child wth css selector (same as jquery.find)
     * @lends $#
     * @function
     * @param {HTMLElement|String} x pass in a css selector in string or the whole HTMLElement
     * @return {$}
     */
    el.find = el.find || $
    /**
     * check if a DOMNode has a specific class
     * @lends $#
     * @function
     * @param {String} cls
     * @return {Boolean}
     */
    el.hasClass =
      el.hasClass ||
      function (cls) {
        return this.className.match(new RegExp(`(\\s|^)${cls}(\\s|$)`))
      }
    /**
     * add a class to a DOMNode, returns self to allow chaining
     * @lends $#
     * @function
     * @param {String} cls
     * @return {$}
     */
    el.addClass =
      el.addClass ||
      function (cls) {
        if (!this.hasClass(cls)) {
          if (this.className) {
            this.className += ' '
          }
          this.className += cls
        }
        return this
      }
    /**
     * remove a specific class from a DOMNode, returns self to allow chaining
     * @lends $#
     * @function
     * @param {String} cls
     * @return {$}
     */
    el.removeClass =
      el.removeClass ||
      function (cls) {
        if (this.hasClass(cls)) {
          this.className = this.className.replace(cls, '')
        }
        return this
      }
    /**
     * detach it self from parent
     * @lends $#
     * @function
     */
    el.remove =
      el.remove ||
      function () {
        if (this.parentNode) this.parentNode.removeChild(this)
        return this
      }

    /**
     * add to another element as a child
     * @lends $#
     * @function
     * @param {HTMLElement|$} x
     * @return {$}
     */
    el.appendTo =
      el.appendTo ||
      function (x) {
        x.appendChild(this)
        return this
      }

    /**
     * add to another element as a child and place on the top of the children list
     * @lends $#
     * @function
     * @param {HTMLElement|$} x
     * @return {$}
     */
    el.prependTo =
      el.prependTo ||
      function (x) {
        x.childNodes[0] ? x.insertBefore(this, x.childNodes[0]) : x.appendChild(this)
        return this
      }

    /**
     * helper function for updating the css transform
     * @lends $#
     * @function
     * @return {$}
     */
    el.transforms =
      el.transforms ||
      function () {
        this.style[$.trans] = $.translate(this.position) + $.rotate(this.rotation) + $.scale(this.scale) + $.skew(this.skew)
        return this
      }

    el.position = el.position || { x: 0, y: 0 }
    el.rotation = el.rotation || 0
    el.scale = el.scale || { x: 1, y: 1 }
    el.skew = el.skew || { x: 0, y: 0 }

    /**
     * move the element
     * @memberOf $#
     * @name translates
     * @function
     * @param {Number} x in pixel
     * @param {Number} y in pixel
     * @return {$}
     */
    el.translates = function (x, y) {
      this.position.x = x
      this.position.y = y
      this.transforms()
      return this
    }

    /**
     * rotate the element
     * @memberOf $#
     * @name rotate
     * @function
     * @param {Number} x in degrees
     * @return {$}
     */
    el.rotate = function (x) {
      this.rotation = x
      this.transforms()
      return this
    }

    /**
     * resize the element
     * @memberOf $#
     * @name resize
     * @function
     * @param {Number} x
     * @param {Number} y
     * @return {$}
     */
    el.resize = function (x, y) {
      this.scale.x = x
      this.scale.y = y
      this.transforms()
      return this
    }

    /**
     * skews the element
     * @memberOf $#
     * @name setSkew
     * @function
     * @param {Number} x in degrees
     * @param {Number} y
     * @return {$}
     */
    el.setSkew = function (x, y) {
      this.skew.x = x
      this.skew.y = y
      this.transforms()
      return this
    }
  }
  return el
}
//getting the prefix and css3 3d support
switch (sys.browserType) {
  case sys.BROWSER_TYPE_FIREFOX:
    $.pfx = 'Moz'
    $.hd = true
    break
  case sys.BROWSER_TYPE_CHROME:
  case sys.BROWSER_TYPE_SAFARI:
    $.pfx = 'webkit'
    $.hd = true
    break
  case sys.BROWSER_TYPE_OPERA:
    $.pfx = 'O'
    $.hd = false
    break
  case sys.BROWSER_TYPE_IE:
    $.pfx = 'ms'
    $.hd = false
    break
  default:
    $.pfx = 'webkit'
    $.hd = true
}
//cache for prefixed transform
$.trans = `${$.pfx}Transform`
//helper function for constructing transform strings
$.translate = $.hd
  ? function (a) {
      return `translate3d(${a.x}px, ${a.y}px, 0) `
    }
  : function (a) {
      return `translate(${a.x}px, ${a.y}px) `
    }
$.rotate = $.hd
  ? function (a) {
      return `rotateZ(${a}deg) `
    }
  : function (a) {
      return `rotate(${a}deg) `
    }
$.scale = function (a) {
  return `scale(${a.x}, ${a.y}) `
}
$.skew = function (a) {
  return `skewX(${-a.x}deg) skewY(${a.y}deg)`
}

/**
 * Creates a new element, and adds $ methods
 * @param {String} x name of the element tag to create
 * @return {$}
 */
export const $new = function (x) {
  return $(document.createElement(x))
}
$.findpos = function (obj) {
  let curleft = 0
  let curtop = 0
  do {
    curleft += obj.offsetLeft
    curtop += obj.offsetTop
  } while ((obj = obj.offsetParent))
  return { x: curleft, y: curtop }
}
