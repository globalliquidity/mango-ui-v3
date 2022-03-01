import * as bjs from '@babylonjs/core/Legacy/legacy'
import { GLSGColor } from '@/modules/SceneGraph/Enums'
import OnlineAssets from '@/assets/OnlineAssets'
import Logger from '@/modules/SceneGraph/Logger'
import { VectorField } from '@/modules/SceneGraph/VectorField'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'
import { DepthFinderPresenter } from './DepthFinderPresenter'
import { VectorFieldLayerType } from '@/modules/SceneGraph/Enums'
import { VectorFieldCell } from '@/modules/SceneGraph/VectorFieldCell'
import { DepthFinderRow } from './DepthFinderRow'
import { VectorFieldLayer } from '@/modules/SceneGraph/VectorFieldLayer'
import { BaseTexture } from '@babylonjs/core/Legacy/legacy'
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
// import { OrderBookHistogram } from './OrderBookHistogram';

export class OrderBookVectorField extends VectorField {
  public isResetting = false
  public rowDepthMultiplier = 0
  public maxCellHeight = 20

  firstDraw = true
  buildMeshNextFrame = false
  setParticlesNextFrame = false
  settingParticles = false
  framesSinceSetParticles = 0

  spsHolder: bjs.TransformNode = new bjs.TransformNode(
    'Sps Holder',
    this.scene.bjsScene
  )

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public mesh: bjs.Mesh,
    public rowCount: number,
    public columnCount: number,
    public layerCount: number,
    public cellWidth: number,
    public cellHeight: number,
    public cellDepth: number,
    public cellMeshScaleFactor: number,
    public presenter: DepthFinderPresenter,
    public orderBookRig: bjs.TransformNode
  ) {
    super(
      name,
      x,
      y,
      z,
      scene,
      mesh,
      rowCount,
      columnCount,
      layerCount,
      cellWidth,
      cellHeight,
      cellDepth,
      cellMeshScaleFactor,
      presenter
    )
    Logger.log('OrderBookHistogramValueField :  constructor()')
    // console.log('OrderBookHistogramValueField :  creating OrderBookHistogramValueField with ' + rowCount + ' rows, and ' + columnCount + ' columns.');
    Logger.log(
      'OrderBookHistogramValueField :  constructor() - calling this.create()'
    )

    this.create()
  }

  async create() {
    super.create()
    this.mesh.material = this.material
    this.material.albedoColor = bjs.Color3.White()
    const texture = new bjs.Texture(
      OnlineAssets.Images.pngTwentyColorPaletteBlack,
      this.scene.bjsScene
    )
    this.material.albedoTexture = texture
    this.material.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<BaseTexture>
    this.material.roughness = 0.45
    this.material.metallic = 0.11
    //this.mesh.hasVertexAlpha = true;
    //this.material.alpha = .1;
    //this.material.clearCoat.isEnabled = true;
    //this.material.clearCoat.roughness = 0.99;
    //this.material.clearCoat.indexOfRefraction = 1.5;
    //this.mesh.doNotSyncBoundingInfo = true;
    this.spsHolder.parent = this
    this.scene.glowLayer.addIncludedOnlyMesh(this.sps.mesh)
  }

  public reset() {
    this.isResetting = true
    this.firstDraw = true
    this.buildMeshNextFrame = false
    this.settingParticles = false
    // this.sps.setParticles();
  }

  protected onPreRender() {
    if (this.firstDraw) {
      this.sps.setParticles()
      this.firstDraw = false
    } else {
      if (this.rowDepthMultiplier === 0) {
        this.sps.setParticles()
      }
      /*    else if (this.setParticlesNextFrame)
            {
                this.sps.setParticles();
                //this.setParticlesNextFrame = false;
               
            }
            */
    }
  }

  protected onSetInitialParticlePosition = (particle: bjs.SolidParticle) => {
    particle.isVisible = false
  }

  protected onRender() {
    /*
        if (this.setParticlesNextFrame)
        {
            if(this.framesSinceSetParticles < 3)
            {
                this.framesSinceSetParticles++;
            }
            else
            {
                this.setParticlesNextFrame = false;
                this.framesSinceSetParticles = 0;
            }
        }
        */
  }

  protected onUpdateParticle = (particle: bjs.SolidParticle) => {
    particle.isVisible = false

    if (this.presenter.isReady && this.presenter.currentGeneration > 0) {
      const particleRow: number =
        Math.floor(particle.idx / this.columnCount) + 1

      if (particleRow <= this.presenter.currentGeneration) {
        const currentColumn: number = particle.idx % this.columnCount

        const presenterRow: DepthFinderRow = this.presenter.getRow(
          particleRow
        ) as DepthFinderRow

        if (presenterRow) {
          const presenterLayer: VectorFieldLayer | undefined =
            presenterRow.getLayer(VectorFieldLayerType.OrderBook)

          if (presenterLayer) {
            const orderBookCell: VectorFieldCell | undefined =
              presenterLayer.getCellByIndex(
                presenterLayer.startingIndex + currentColumn
              )

            if (orderBookCell) {
              let particlePositionX: number =
                (presenterRow.positionOffsetX +
                  orderBookCell.positionOffset.x) *
                  this.cellWidth +
                this.cellWidth / 2

              if (
                Math.abs(this.orderBookRig.position.x + particlePositionX) >=
                (this.columnCount - 1) * this.cellWidth
              ) {
                particle.isVisible = false

                // if (!this.setParticlesNextFrame)
                //     this.setParticlesNextFrame = true;
              } else {
                if (orderBookCell.height > 0) {
                  particle.isVisible = true

                  let particlePositionY = 0
                  let particlePositionZ = 0

                  if (orderBookCell.color === GLSGColor.SkyBlue) {
                    particlePositionX -= this.cellWidth
                  } else {
                    particlePositionX += this.cellWidth
                  }

                  particle.uvs = SolidParticleMaterial.getUVSforColor(
                    orderBookCell.color
                  )

                  if (particleRow === 0) {
                    //particle.scaling.z = this.rowDepthMultiplier * this.cellDepth * this.cellMeshScaleFactor;
                    //particlePositionZ = ((this.cellDepth/2) * this.cellMeshScaleFactor) - (this.rowDepthMultiplier * ((this.cellDepth/2)* this.cellMeshScaleFactor));

                    particle.scaling.z =
                      this.rowDepthMultiplier * this.cellDepth * 0.9
                    particlePositionZ =
                      (-this.rowDepthMultiplier * this.cellDepth) / 2

                    particle.isVisible = false
                  } else {
                    particlePositionY =
                      orderBookCell.height * 0.5 * this.cellHeight
                    particle.scaling.z =
                      this.cellDepth * this.cellMeshScaleFactor
                    particlePositionZ = particleRow * this.cellDepth
                    particle.scaling.y = orderBookCell.height * this.cellHeight
                  }

                  particle.scaling.x = this.cellWidth
                  particlePositionY =
                    orderBookCell.height * 0.5 * this.cellHeight
                  particle.scaling.y = Math.max(
                    0.1,
                    orderBookCell.height * this.cellHeight
                  )

                  const proposedPosition: bjs.Vector3 = new bjs.Vector3(
                    particlePositionX,
                    particlePositionY,
                    particlePositionZ
                  )

                  if (particle.position !== proposedPosition) {
                    //if ( Math.abs(this.orderBookRig.position.x + particlePositionX) < (60 * this.cellWidth))
                    //  {
                    particle.position.set(
                      particlePositionX,
                      particlePositionY,
                      particlePositionZ
                    )
                    //   }
                    //  else
                    //  {
                    //       particle.isVisible = false;
                    //   this.settingParticles = true;
                    // }
                  } else {
                    //particle.isVisible = false;
                  }
                }
              }
            } else {
              particle.isVisible = false
            }
          }
        } else {
          particle.isVisible = false
        }
      }
    } else {
      particle.isVisible = false
    }

    return particle
  }
}
