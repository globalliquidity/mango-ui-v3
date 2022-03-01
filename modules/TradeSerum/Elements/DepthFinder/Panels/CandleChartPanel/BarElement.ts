import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { Scene } from '@/modules/SceneGraph/Scene'
import Logger from '@/modules/SceneGraph/Logger'
import { CandleType } from '@/modules/TradeSerum/Enums'
import { CandleStickItem } from './CandleStickItem'
import { GLSGColor } from '@/modules/SceneGraph/Enums'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'

export class BarElement extends SceneElement {
  public barColor?: GLSGColor

  public candleStickItem?: CandleStickItem

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene,
    public barMeshInst: bjs.InstancedMesh
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  async create() {
    Logger.log('Candle : Creating ')

    // Initialize candle body mesh
    this.barMeshInst.setEnabled(true)
    this.barMeshInst.isVisible = true
    this.barMeshInst.parent = this
    this.barMeshInst._scene = this.scene.bjsScene
    this.setBarColor(GLSGColor.Green)
  }

  public init(candleStickItem: CandleStickItem) {
    this.candleStickItem = candleStickItem

    if (this.candleStickItem.candleType === CandleType.Bullish) {
      this.setBarColor(GLSGColor.Green)
    } else {
      this.setBarColor(GLSGColor.Red)
    }

    this.barMeshInst.scaling = new bjs.Vector3(1, candleStickItem.barScale, 1)
    this.barMeshInst.position = candleStickItem.barPosition

    this.position.x = candleStickItem.candlePosition.x
    this.position.z = -0.1
  }

  public setBarColor(color: GLSGColor) {
    this.barColor = color
    this.barMeshInst.instancedBuffers.uv =
      SolidParticleMaterial.getUVSforColor(color)
  }

  protected onRender() {}

  protected onDisposing() {
    if (this.barMeshInst != null) this.barMeshInst.dispose()
  }
}
