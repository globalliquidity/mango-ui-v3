import * as bjs from '@babylonjs/core/Legacy/legacy'
import currency from 'currency.js'
//import * as currency from 'currency.js';
import { GLSGColor } from './Enums'
import { VectorFieldLayerType } from './Enums'

export class VectorFieldCell {
  public isVisible = false
  public positionOffset: bjs.Vector2 = new bjs.Vector2(0, 0)
  public width = 0
  public height = 0
  public color: GLSGColor = GLSGColor.Blue
  public price: currency = currency(0)

  constructor(public layerType: VectorFieldLayerType) {}

  public initialize() {
    this.isVisible = false
    this.positionOffset.set(0, 0)
    this.width = 0
    this.height = 0
    this.color = GLSGColor.Blue
  }
}
