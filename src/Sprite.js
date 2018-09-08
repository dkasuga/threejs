/* global THREE: false */

export default class Sprite {
  constructor (texture, depth = 1, fog = false) {
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: texture, fog}))
    this.sprite.position.set(0, 0, depth)
    this.sprite.x = 0
    this.sprite.y = 0
    this.sprite.center.set(0.5, 0.5)
    const screenAspect = window.innerWidth / window.innerHeight
    this.sprite.initScreenAspect = screenAspect
    this.sprite.scale.set(texture.image.width, texture.image.height * screenAspect, depth)
    this.sprite.depth = depth
    this.sprite.setPos = this.setPos
    this.sprite.setSize = this.setSize
    this.sprite.setDepth = this.setDepth
    this.sprite.onResizeWindow = this.onResizeWindow
    return this.sprite
  }

  setPos = (x, y, align = {left: false, top: false, bottom: false, right: false, center: true}) => {
    if (align.center) {
      this.sprite.center.set(0.5, 0.5)
    } else if (align.left && align.top) {
      this.sprite.center.set(0, 0)
    } else if (align.left && align.bottom) {
      this.sprite.center.set(0, 1)
    } else if (align.right && align.top) {
      this.sprite.center.set(1, 0)
    } else if (align.right && align.bottom) {
      this.sprite.center.set(0, 1)
    }
    const width = window.innerWidth / 2
    const height = window.innerHeight / 2
    this.sprite.x = x
    this.sprite.y = y
    this.sprite.position.set(width * x, height * y, this.sprite.depth)
  }

  setSize = (w, h) => {
    this.sprite.w = w
    this.sprite.h = h
    const screenAspect = window.innerWidth / window.innerHeight
    this.sprite.scale.set(this.sprite.w, this.sprite.h * screenAspect / this.sprite.initScreenAspect, this.sprite.depth)
  }

  setDepth = (depth) => {
    this.sprite.depth = depth
  }

  onResizeWindow = () => {
    const screenAspect = window.innerWidth / window.innerHeight
    this.sprite.scale.set(this.sprite.w, this.sprite.h * screenAspect / this.sprite.initScreenAspect, this.sprite.depth)
  }

}