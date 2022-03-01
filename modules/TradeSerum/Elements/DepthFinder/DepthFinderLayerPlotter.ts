import * as bjs from '@babylonjs/core/Legacy/legacy'
import { BaseTexture, Nullable } from '@babylonjs/core/Legacy/legacy'
import { GLSGColor, VectorFieldLayerType } from '@/modules/SceneGraph/Enums'
import { Scene } from '@/modules/SceneGraph/Scene'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'
import { VectorFieldCell } from '@/modules/SceneGraph/VectorFieldCell'
import { VectorFieldLayer } from '@/modules/SceneGraph/VectorFieldLayer'
import { VectorFieldPlotter } from '@/modules/SceneGraph/VectorFieldPlotter'
import { DepthFinderPresenter } from './DepthFinderPresenter'
import OnlineAssets from '@/assets/OnlineAssets'
import { DepthFinderRow } from './DepthFinderRow'
import Logger from '@/modules/SceneGraph/Logger'

export class DepthFinderLayerPlotter extends VectorFieldPlotter {
  public isResetting = false
  public rowDepthMultiplier = 0
  public maxCellHeight = 20
  public active = 2

  firstDraw = true
  setParticlesRange = 0
  particlesAdded = false
  framesSinceParticlesAdded = 0
  buildMeshNextFrame = false
  currentCellIndex = 0
  removeRowRequested = false
  framesSinceRemoveRowRequest = 0
  removeRowNextFrame = false
  numCellsToRemove = 0
  particleStore: Array<bjs.SolidParticle> = new Array<bjs.SolidParticle>()

  cellHeightOffset = 0.1

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene,
    public mesh: bjs.Mesh,
    public rowCount: number,
    public columnCount: number,
    public cellWidth: number,
    public cellHeight: number,
    public cellDepth: number,
    public cellMeshScaleFactor: number,
    public presenter: DepthFinderPresenter,
    public orderBookRig: bjs.TransformNode,
    public layerType: VectorFieldLayerType
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
      cellWidth,
      cellHeight,
      cellDepth,
      cellMeshScaleFactor,
      presenter
    )
    this.create()
  }

  async create() {
    super.create()

    const particleStoreSize = this.rowCount * this.columnCount
    this.sps.addShape(this.meshBase, particleStoreSize, {
      storage: this.particleStore as [],
    })
    this.sps.updateParticle = this.onUpdateParticle
    //this.sps.mesh.position.z = 0.5;

    this.mesh.material = this.material
    this.meshBase.isVisible = false
    //this.mesh.isVisible = false;
    this.material.albedoColor = bjs.Color3.White()
    const texture = new bjs.Texture(
      OnlineAssets.Images.pngTwentyColorPaletteBlack,
      this.scene.bjsScene
    )
    this.material.albedoTexture = texture
    this.material.reflectionTexture = this.scene
      .hdrTexture as Nullable<BaseTexture>
    this.material.roughness = 0.95
    this.material.metallic = 0.05
    this.material.clearCoat.isEnabled = true
    this.material.clearCoat.roughness = 0.99

    this.presenter.onAddedNewRow.subscribe(() => {
      this.addRow(this.presenter.getCurrentRow() as DepthFinderRow)
    })

    this.presenter.onRemovedLastRow.subscribe((p, r) => {
      this.removeRow(r)
    })

    this.presenter.onClearLayerPlotter.subscribe((p, r) => {
      if (r === this.layerType) {
        this.clearLayer()
      }
    })
  }

  public reset() {
    this.isResetting = true

    this.active = 2
    this.firstDraw = true
    // this.setParticlesRange = 0;
    this.particlesAdded = false
    this.framesSinceParticlesAdded = 0
    this.buildMeshNextFrame = false
    this.currentCellIndex = 0
    this.removeRowRequested = false
    this.framesSinceRemoveRowRequest = 0
    this.removeRowNextFrame = false
    this.numCellsToRemove = 0

    // let removedParticles : Array<bjs.SolidParticle> =  this.sps.removeParticles(0, this.setParticlesRange);
    // this.particleStore.push.apply(this.particleStore,removedParticles);
    // this.setParticlesRange = 0;

    // this.sps.buildMesh();
    // this.sps.setParticles();

    this.onDisposing()
    this.meshBase = bjs.MeshBuilder.CreateBox(
      'tradebox',
      { height: 1, width: 1, depth: 1 },
      this.scene.bjsScene
    )
    this.mesh = this.meshBase

    super.onCreate()
    const particleStoreSize = this.rowCount * this.columnCount
    this.sps.addShape(this.meshBase, particleStoreSize, {
      storage: this.particleStore as [],
    })
    this.sps.updateParticle = this.onUpdateParticle
  }

  public setActive(active: number) {
    this.active = active
  }

  protected onPreRender() {
    if (this.removeRowNextFrame) {
      const removedParticles: Array<bjs.SolidParticle> =
        this.sps.removeParticles(0, this.numCellsToRemove - 1)
      this.particleStore.push(...removedParticles)

      if (this.active === 1) {
        this.active = 2
      }

      this.numCellsToRemove = 0
      this.removeRowNextFrame = false
      this.removeRowRequested = false
      this.framesSinceRemoveRowRequest = 0
    }

    if (this.buildMeshNextFrame) {
      this.sps.buildMesh()
      this.buildMeshNextFrame = false
      this.sps.setParticles()
    } else {
      if (this.setParticlesRange > 0)
        this.sps.setParticles(0, this.setParticlesRange, true)
    }
  }

  protected onPostRender() {
    if (this.removeRowRequested) {
      this.framesSinceRemoveRowRequest = this.framesSinceRemoveRowRequest + 1

      if (this.framesSinceRemoveRowRequest === 2) this.removeRowNextFrame = true
    }

    if (this.particlesAdded) {
      this.particlesAdded = false
      this.buildMeshNextFrame = true
    }
  }

  public addRow(row: DepthFinderRow) {
    if (row) {
      const cellLayer: VectorFieldLayer | undefined = row.getLayer(
        this.layerType
      )

      if (cellLayer) {
        const cellCount: number = cellLayer.numCells
        this.setParticlesRange = cellCount
        this.currentCellIndex = 0

        if (cellCount > 0) {
          if (this.meshBase) {
            const rowParticles: Array<bjs.SolidParticle> =
              this.particleStore.slice(0, cellCount)

            if (rowParticles.length > 0) {
              for (let i = 0; i < rowParticles.length; i++) {
                const particle: bjs.SolidParticle = rowParticles[i]
                particle.id = i
                this.onSetInitialParticlePosition(particle)
              }
              this.sps.insertParticlesFromArray(rowParticles)
              this.particlesAdded = true
            }
          } else {
            Logger.log('DepthFinderPlotter : Null Mesh')
          }
        }
      }
    } else {
      Logger.log('DepthFinderPlotter : Null Row')
    }
  }

  public removeRow(row: DepthFinderRow) {
    const cellLayer: VectorFieldLayer | undefined = row.getLayer(this.layerType)

    if (cellLayer) {
      if (this.active === 2) {
        this.numCellsToRemove = cellLayer.cellsByIndex.size
      } else if (this.active === 0) {
        this.numCellsToRemove =
          this.numCellsToRemove + cellLayer.cellsByIndex.size
      }

      this.removeRowRequested = true
    }
  }

  protected onSetInitialParticlePosition = (particle: bjs.SolidParticle) => {
    particle.isVisible = false

    if (particle.idx > 0) {
      if (this.presenter.currentGeneration > 0) {
        const row: DepthFinderRow =
          this.presenter.getCurrentRow() as DepthFinderRow
        const layer: VectorFieldLayer | undefined = row.getLayer(this.layerType)

        if (layer) {
          const cell: VectorFieldCell = Array.from(layer.cellsByIndex.values())[
            particle.id
          ]

          if (cell != null) {
            ;(particle as any).cell = cell

            let particlePositionX: number =
              (row.positionOffsetX + cell.positionOffset.x) * this.cellWidth +
              this.cellWidth / 2
            let particlePositionY = 0
            let particlePositionZ = 0

            if (cell.color === GLSGColor.Red) {
              particlePositionX -= this.cellWidth
            } else {
              particlePositionX += this.cellWidth
            }

            particlePositionY = cell.positionOffset.y * this.cellHeight
            particle.scaling.z = this.cellDepth * this.cellMeshScaleFactor
            // particlePositionZ = - (this.presenter.currentGeneration * this.cellDepth) + (this.cellDepth);
            particlePositionZ = -1 * this.position.z - this.cellDepth
            particlePositionY +=
              cell.height * 0.5 * this.cellHeight + this.cellHeightOffset

            if (cell.width !== 0) {
              particle.scaling.x =
                this.cellWidth * cell.width * this.cellMeshScaleFactor
            } else {
              particle.scaling.x = this.cellWidth * this.cellMeshScaleFactor
            }
            // particle.scaling.x = this.cellWidth * this.cellMeshScaleFactor;
            particle.scaling.y = cell.height * this.cellHeight

            if (
              Math.abs(this.orderBookRig.position.x + particlePositionX) <=
              this.columnCount * this.cellWidth
            ) {
              particle.isVisible = true
              particle.position.set(
                particlePositionX,
                particlePositionY,
                particlePositionZ
              )
              particle.uvs = SolidParticleMaterial.getUVSforColor(cell.color)
            } else {
              particle.isVisible = false
            }
          } else {
            particle.isVisible = false
          }
        }
      }
    } else {
      particle.isVisible = false
    }
  }

  clearLayer() {
    this.firstDraw = true
    this.particlesAdded = false
    this.sps.removeParticles(0, this.setParticlesRange)
    this.particleStore = new Array<bjs.SolidParticle>()
    this.setParticlesRange = 0
    if (this.meshBase) {
      this.meshBase.dispose()
    }
  }

  protected onUpdateParticle = (particle: bjs.SolidParticle) => {
    particle.isVisible = false

    if (this.presenter.isReady) {
      particle.isVisible = true
      if (
        Math.abs(this.orderBookRig.position.x + particle.position.x) >
        this.columnCount * this.cellWidth
      ) {
        particle.isVisible = false
      } else if (
        Math.abs(particle.position.z) <=
        Math.abs(
          (this.presenter.currentGeneration - this.rowCount * 2) *
            this.cellDepth
        )
      ) {
        if (this.presenter.currentGeneration >= this.rowCount * 2) {
          particle.isVisible = false
        }
      }
    }

    return particle
  }

  protected onDisposing() {
    this.clearLayer()
    super.onDisposing()
  }
}
