import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { Scene } from '@/modules/SceneGraph/Scene'
import Logger from '@/modules/SceneGraph/Logger'
import { CandleType } from '@/modules/TradeSerum/Enums'
import { CandleStickItem } from './CandleStickItem'
import { GLSGColor } from '@/modules/SceneGraph/Enums'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'

export class CandleElement extends SceneElement {
  public bodyColor?: GLSGColor
  public wickColor?: GLSGColor

  public candleStickItem?: CandleStickItem

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene,
    public bodyMesh: bjs.InstancedMesh,
    public wickMesh: bjs.InstancedMesh
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  async create() {
    Logger.log('Candle : Creating ')

    // Initialize candle body mesh
    this.bodyMesh.setEnabled(true)
    this.bodyMesh.isVisible = true
    this.bodyMesh.parent = this
    this.bodyMesh._scene = this.scene.bjsScene
    // this.bodyMesh.position.y = 2;
    // this.bodyMesh.scaling = new bjs.Vector3(3,3,3);
    this.setBodyColor(GLSGColor.Green)

    // Initialize candle wick mesh
    this.wickMesh.setEnabled(true)
    this.wickMesh.isVisible = true
    this.wickMesh.parent = this
    this.wickMesh._scene = this.scene.bjsScene
    // this.wickMesh.scaling = new bjs.Vector3(1,3,1);
    this.setWickColor(GLSGColor.DarkGreen)
  }

  public init(candleStickItem: CandleStickItem) {
    this.candleStickItem = candleStickItem

    if (this.candleStickItem.candleType === CandleType.Bullish) {
      this.setBodyColor(GLSGColor.Green)
      this.setWickColor(GLSGColor.DarkGreen)
    } else {
      this.setBodyColor(GLSGColor.Red)
      this.setWickColor(GLSGColor.DarkRed)
    }

    this.bodyMesh.scaling = new bjs.Vector3(1, candleStickItem.bodyScale, 1)
    this.bodyMesh.position = candleStickItem.bodyPosition

    this.wickMesh.scaling = new bjs.Vector3(1, candleStickItem.wickScale, 1)
    this.wickMesh.position = candleStickItem.wickPosition

    this.position.x = candleStickItem.candlePosition.x
    this.position.z = -0.1
  }

  public setBodyColor(color: GLSGColor) {
    this.bodyColor = color
    this.bodyMesh.instancedBuffers.uv =
      SolidParticleMaterial.getUVSforColor(color)
  }

  public setWickColor(color: GLSGColor) {
    this.wickColor = color
    this.wickMesh.instancedBuffers.uv =
      SolidParticleMaterial.getUVSforColor(color)
  }

  protected onRender() {}

  protected onDisposing() {
    if (this.bodyMesh != null) this.bodyMesh.dispose()
    if (this.wickMesh != null) this.wickMesh.dispose()
  }
}
