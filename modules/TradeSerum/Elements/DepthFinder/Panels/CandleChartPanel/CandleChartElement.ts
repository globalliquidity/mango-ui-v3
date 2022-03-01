import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { Scene } from '@/modules/SceneGraph/Scene'
import { CandleElement } from './CandleElement'
import Logger from '@/modules/SceneGraph/Logger'
import { AssetManager } from '@/modules/SceneGraph/AssetManager'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'
import { GLSGColor, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { CandleChartPresenter } from './CandleChartPresenter'

export class CandleChartElement extends SceneElement {
  candles: Array<CandleElement> = new Array<CandleElement>()

  candleMesh?: bjs.Mesh

  candleBodyMesh?: bjs.Mesh
  candleWickMesh?: bjs.Mesh

  candleBodyMaterial?: SolidParticleMaterial
  candleWickMaterial?: SolidParticleMaterial

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene,
    /*sampler : MarketDataSampler,*/
    public candleCount: number,
    public presenter: CandleChartPresenter
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  async create() {
    Logger.log('CandleChart : Creating Candles')
    //await this.loadModel();
    super.create()

    this.candleMesh = AssetManager.Instance(this.scene.title).getMesh('candle')

    if (this.candleMesh) {
      const childMeshes = this.candleMesh.getChildMeshes()

      this.candleBodyMesh = childMeshes[1] as bjs.Mesh
      this.candleWickMesh = childMeshes[0] as bjs.Mesh

      // console.log('bounding info:', this.candleBodyMesh.getBoundingInfo());
      this.candleBodyMaterial = new SolidParticleMaterial(
        'Candle Body Material',
        this.scene
      )
      this.candleBodyMaterial.roughness = 0.15
      this.candleBodyMaterial.metallic = 0.35
      this.candleBodyMaterial.freeze()

      this.candleWickMaterial = new SolidParticleMaterial(
        'Candle Wick Material',
        this.scene
      )
      this.candleWickMaterial.roughness = 0.15
      this.candleWickMaterial.metallic = 0.35
      this.candleWickMaterial.freeze()

      this.configCandleMeshes()

      // this.candleMesh.parent = this;
    }

    this.init()
  }

  public init() {
    if (this.candleBodyMesh && this.candleWickMesh) {
      for (let i = 0; i < this.candleCount; i++) {
        const bodyMeshInst: bjs.InstancedMesh =
          this.candleBodyMesh.createInstance('candleBody-' + i.toString())
        const wickMeshInst: bjs.InstancedMesh =
          this.candleWickMesh.createInstance('candleWick-' + i.toString())

        const candle = new CandleElement(
          'candle-' + i.toString(),
          0,
          0,
          0,
          this.scene,
          bodyMeshInst,
          wickMeshInst
        )
        candle.setEnabled(false)

        this.candles.push(candle)
        this.addChild(candle)
      }
    }
  }

  public configCandleMeshes() {
    if (this.candleBodyMesh && this.candleBodyMaterial) {
      // Config Candle Body Mesh
      this.configMesh(this.candleBodyMesh, this.candleBodyMaterial)
    }

    if (this.candleWickMesh && this.candleWickMaterial) {
      // Config Candle Wick Mesh
      this.configMesh(this.candleWickMesh, this.candleWickMaterial)
    }
  }

  public configMesh(mesh: bjs.Mesh, mat: SolidParticleMaterial) {
    mesh.material = mat
    mesh.material['disableLighting'] = true
    // mesh.rotation.x = -Math.PI/2;
    mesh.isVisible = false
    mesh._scene = this.scene.bjsScene
    mesh.alwaysSelectAsActiveMesh = true
    mesh.registerInstancedBuffer('uv', 4)
    mesh.instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(
      GLSGColor.Purple
    )
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      // this.scaling.z = 3;
      // this.rotation.x = -Math.PI / 9;
    } else {
      // this.scaling.z = 1;
      // this.rotation.x = 0;
    }
  }

  protected onPreRender() {
    // super.onPreRender();
    if (this.presenter.isReady) {
      const len = Math.min(this.presenter.candles.length, this.candleCount)

      for (let i = 0; i < len; i++) {
        this.candles[i].init(this.presenter.candles[i])
        this.candles[i].setEnabled(true)
      }

      // this.presenter.isReady = false;
    }
  }

  protected onRender() {}
}
