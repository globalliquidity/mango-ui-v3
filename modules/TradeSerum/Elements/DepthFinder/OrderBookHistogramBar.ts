import * as bjs from '@babylonjs/core/Legacy/legacy'
import { MarketSide } from '@/modules/TradeSerum/Enums'
import { Scene } from '@/modules/SceneGraph/Scene'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'
import { GLSGColor } from '@/modules/SceneGraph/Enums'

/**
 * OrderBookHistogramBar has a collection of Block Mesh Instances.
 *
 * @export
 * @class OrderBookHistogramBar
 * @extends {SceneElement}
 */
export class OrderBookHistogramBar extends SceneElement {
  private blocks: Array<bjs.InstancedMesh> = new Array<bjs.InstancedMesh>()

  private falloffRate = 0.2
  private currentHeight = 0
  private targetHeight = 0

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene,
    public mesh: bjs.Mesh,
    public blocksPerBar: number,
    public blockWidth: number,
    public blockHeight: number,
    public blockDepth: number,
    public blockMeshScaleFactor: number,
    public side: MarketSide = MarketSide.Bid,
    public rowDepthMultiplier: number = 0
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  async onCreate() {
    this.buildBar()
  }

  private buildBar(): void {
    for (let i = 0; i < this.blocksPerBar; i++) {
      const block: bjs.InstancedMesh = this.mesh.createInstance('Block' + i)
      block.parent = this
      block.setEnabled(true)
      const blockPositionY = this.blockHeight * i + this.blockHeight * 0.5
      block.scaling = new bjs.Vector3(
        this.blockWidth,
        this.blockHeight,
        this.blockDepth
      )
      block.position.set(0, blockPositionY, 0)
      this.blocks.push(block)
    }
  }

  public setHeight(height: number): void {
    if (this.currentHeight === 0) {
      this.currentHeight = height
      this.targetHeight = height
    } else {
      if (height > this.blocksPerBar) {
        height = this.blocksPerBar
      }
      this.targetHeight = height
    }

    this.currentHeight = this.targetHeight

    this.setBars()
  }

  public setVisible(visible: boolean) {
    for (let i = 0; i < this.blocksPerBar; i++) {
      this.blocks[i].setEnabled(visible)
      this.blocks[i].isVisible = visible
    }
  }

  public setUVColor(color: GLSGColor) {
    for (let i = 0; i < this.blocksPerBar; i++) {
      this.blocks[i].instancedBuffers.uv =
        SolidParticleMaterial.getUVSforColor(color)
    }
  }

  private setBars() {
    const topBlockIndex: number = Math.floor(this.targetHeight)

    //Logger.log("OrderBookHistogram  |   setBars     | targetHeight : " + this.targetHeight);

    for (let i = 0; i < this.blocksPerBar; i++) {
      const block: bjs.InstancedMesh = this.blocks[i]

      if (this.currentHeight === 0) {
        this.blocks[i].setEnabled(false)
      } else {
        if (i <= topBlockIndex) {
          const blockYScaleFactor = this.blockHeight * (1 / this.blockHeight)

          if (i === topBlockIndex) {
            const heightRemainder: number = this.currentHeight - topBlockIndex
            block.scaling.y = Math.max(
              0.01,
              heightRemainder * blockYScaleFactor
            )
            block.position.y =
              blockYScaleFactor / 2 +
              (i - 1) * blockYScaleFactor +
              blockYScaleFactor / 2 +
              (heightRemainder * blockYScaleFactor) / 2
          } else {
            block.scaling.y = blockYScaleFactor
            block.position.y = blockYScaleFactor / 2 + i * blockYScaleFactor
          }

          block.scaling.z = Math.max(
            0.001,
            this.rowDepthMultiplier * this.blockDepth
          )
          block.position.z =
            (this.blockDepth / 2) * this.blockMeshScaleFactor -
            this.rowDepthMultiplier *
              ((this.blockDepth / 2) * this.blockMeshScaleFactor)
          block.setEnabled(true)

          /*
                    Logger.log("OrderBookHistogram  |   setBars     | Set Bar : " + i);
                    Logger.log("OrderBookHistogram  |   setBars     | Bar Position Y : " +  block.position.y);
                    Logger.log("OrderBookHistogram  |   setBars     | Bar Scaling Y : " +  block.scaling.y);
                    Logger.log("OrderBookHistogram  |   setBars     | Block Height : " +  this.blockHeight);
                    */
        } else {
          this.blocks[i].setEnabled(false)
        }
      }
    }
  }

  protected onPreRender() {}
}
