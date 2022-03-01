import * as bjs from '@babylonjs/core/Legacy/legacy'
import { AssetManager } from '@/modules/SceneGraph/AssetManager'
import { Scene } from '@/modules/SceneGraph/Scene'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'
import { DepthFinderPresenter } from './DepthFinderPresenter'
import { OrderBookHistogramBar } from './OrderBookHistogramBar'
import { DepthFinderRow } from './DepthFinderRow'
import { VectorFieldLayer } from '@/modules/SceneGraph/VectorFieldLayer'
import { VectorFieldLayerType } from '@/modules/SceneGraph/Enums'
import { VectorFieldCell } from '@/modules/SceneGraph/VectorFieldCell'
import { GLSGColor } from '@/modules/SceneGraph/Enums'
import OnlineAssets from '@/assets/OnlineAssets'
import { SettingsManager } from '../../SettingsManager'
// import Logger from '@/modules/SceneGraph/Logger';

/**
 *
 *
 * @export
 * @class OrderBookHistogramNew
 * @extends {SceneElement}
 */
export class OrderBookHistogram extends SceneElement {
  public isResetting = false
  public rowDepthMultiplier = 0

  firstDraw = true
  buildMeshNextFrame = false
  settingParticles = false
  setParticlesDuration = 6
  setParticlesCountPerFrame = 0
  framesSinceSettingParticles = 0

  public frameSinceAddedNewRow = 0
  public isAddedNewRow = false

  private particleAlphaFalloff = 0.075
  private material?: SolidParticleMaterial
  private block: bjs.Mesh | undefined
  private bars: Array<OrderBookHistogramBar> =
    new Array<OrderBookHistogramBar>()
  private orderBookRig: bjs.TransformNode

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene,
    public barCount: number,
    public blocksPerBar: number,
    public cellWidth: number,
    public cellHeight: number,
    public cellDepth: number,
    public cellMeshScaleFactor: number,
    public presenter: DepthFinderPresenter,
    orderBookRig: bjs.TransformNode
  ) {
    super(name, x, y, z, scene)
    this.orderBookRig = orderBookRig
    this.create()
  }

  async create() {
    super.create()

    this.material = new SolidParticleMaterial('Block Material', this.scene)
    this.material.albedoColor = bjs.Color3.White()
    const texture = new bjs.Texture(
      OnlineAssets.Images.pngTwentyColorPaletteBlack,
      this.scene.bjsScene
    )
    this.material.albedoTexture = texture
    this.material.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.material.roughness = 0.45
    this.material.metallic = 0.11
    //this.material.clearCoat.isEnabled = true;
    //this.material.clearCoat.roughness = 0.99;
    //this.material.clearCoat.indexOfRefraction = 1.5;
    this.block = AssetManager.Instance(this.scene.title).getMesh(
      'histogramBlock'
    )
    this.block?.registerInstancedBuffer('uv', 4)

    if (this.block) {
      this.block.instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(
        GLSGColor.SkyBlue
      )
      this.block.rotation.x = 0
      this.block.material = this.material
    }

    this.buildHistogram()

    if (this.block) this.block.isVisible = false
  }

  public reset() {
    this.isResetting = true

    this.firstDraw = true
    this.buildMeshNextFrame = false
    this.settingParticles = false
    this.setParticlesDuration = 6
    this.setParticlesCountPerFrame = 0
    this.framesSinceSettingParticles = 0
    this.frameSinceAddedNewRow = 0
    this.isAddedNewRow = false

    // this.setVisible(false);
  }

  /**
   * Build Histogram by creating [barCount] HistogramBars
   * Position the bars so they stretch across the entire order book
   * @private
   * @memberof OrderBookHistogramNew
   */
  private buildHistogram(): void {
    const startingPositionX: number = -((this.barCount / 2) * this.cellWidth)

    for (let i = 0; i < this.barCount; i++) {
      let barPositionX: number = startingPositionX + i * this.cellWidth

      if (this.block) {
        if (i < this.barCount / 2) {
          this.block.instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(
            GLSGColor.SkyBlue
          )
          barPositionX -= this.cellWidth
        } else {
          this.block.instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(
            GLSGColor.HotPink
          )
          barPositionX += this.cellWidth
        }

        const bar: OrderBookHistogramBar = new OrderBookHistogramBar(
          'Bar ' + i,
          0,
          0,
          0,
          this.scene,
          this.block,
          this.blocksPerBar,
          this.cellWidth,
          this.cellHeight,
          this.cellDepth,
          this.cellMeshScaleFactor
        )
        this.addChild(bar)
        bar.position.set(barPositionX, 0, 0)
        bar.setHeight(0)
        this.bars.push(bar)
      }
    }
  }

  public setVisible(visible: boolean) {
    for (let i = 0; i < this.barCount; i++) {
      const histogramBar: OrderBookHistogramBar = this.bars[i]
      histogramBar.setVisible(visible)
    }
  }

  protected onPreRender() {
    if (!this.isAddedNewRow) {
      if (this.presenter.isReady && this.presenter.currentGeneration > 0) {
        const presenterRow: DepthFinderRow =
          this.presenter.getCurrentRow() as DepthFinderRow

        if (presenterRow) {
          const presenterLayer: VectorFieldLayer | undefined =
            presenterRow.getLayer(VectorFieldLayerType.OrderBook)

          if (presenterLayer) {
            for (let i = 0; i < this.barCount; i++) {
              const orderBookCell: VectorFieldCell = Array.from(
                presenterLayer.cellsByIndex.values()
              )[i]
              const histogramBar: OrderBookHistogramBar = this.bars[i]

              if (orderBookCell) {
                let barPositionX: number =
                  (presenterRow.positionOffsetX +
                    orderBookCell.positionOffset.x) *
                    this.cellWidth +
                  this.cellWidth / 2

                if (orderBookCell.color === GLSGColor.SkyBlue) {
                  barPositionX -= this.cellWidth
                } else {
                  barPositionX += this.cellWidth
                }

                if (
                  Math.abs(this.orderBookRig.position.x + barPositionX) >
                  this.barCount * this.cellWidth
                ) {
                  histogramBar.setVisible(false)
                } else {
                  histogramBar.setVisible(true)
                }

                histogramBar.position.set(barPositionX, 0, 0)
                histogramBar.setHeight(orderBookCell.height * this.cellHeight)
                histogramBar.rowDepthMultiplier = this.rowDepthMultiplier
                histogramBar.setUVColor(orderBookCell.color)
              }
            }
          }
        }
      }
    } else {
      for (let i = 0; i < this.barCount; i++) {
        const histogramBar: OrderBookHistogramBar = this.bars[i]

        if (!SettingsManager.Instance.useSteppedMotion)
          histogramBar.setHeight(0)
        //histogramBar.setVisible(false);
        histogramBar.rowDepthMultiplier = this.rowDepthMultiplier
        this.isAddedNewRow = false
      }
    }
  }
}
