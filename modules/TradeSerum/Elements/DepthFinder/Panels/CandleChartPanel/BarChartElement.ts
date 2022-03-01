import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { Scene } from '@/modules/SceneGraph/Scene'
import Logger from '@/modules/SceneGraph/Logger'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'
import { GLSGColor, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { CandleChartPresenter } from './CandleChartPresenter'
import { BarElement } from './BarElement'

export class BarChartElement extends SceneElement {
  bars: Array<BarElement> = new Array<BarElement>()

  barMesh?: bjs.Mesh
  barMaterial?: SolidParticleMaterial

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

    // this.barMesh = AssetManager.Instance.getMeshClone("simplecube");
    this.barMesh = bjs.MeshBuilder.CreateBox(
      'volumne',
      { height: 1, width: 0.2, depth: 0.2 },
      this.scene.bjsScene
    )

    if (this.barMesh) {
      this.barMaterial = new SolidParticleMaterial(
        'Quote Bar Material',
        this.scene
      )
      this.barMaterial.roughness = 0.15
      this.barMaterial.metallic = 0.35
      this.barMaterial.freeze()

      this.configMesh(this.barMesh, this.barMaterial)

      // this.candleMesh.parent = this;
    }

    this.init()
  }

  public init() {
    if (this.barMesh) {
      for (let i = 0; i < this.candleCount; i++) {
        const barMeshInst: bjs.InstancedMesh = this.barMesh.createInstance(
          'candleBody-' + i.toString()
        )

        const bar = new BarElement(
          'volumebar-' + i.toString(),
          0,
          0,
          0,
          this.scene,
          barMeshInst
        )
        bar.setEnabled(false)

        this.bars.push(bar)
        this.addChild(bar)
      }

      // let barMeshInst: bjs.InstancedMesh = this.barMesh.createInstance("candleBody-1");
      // let bar = new BarElement("volumebar-1", 0, 0, 0, this.scene, barMeshInst);

      // this.addChild(bar);
      // bar.setEnabled(true);
      // bar.testInit();
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
        this.bars[i].init(this.presenter.candles[i])
        this.bars[i].setEnabled(true)
      }

      // this.presenter.isReady = false;
    }
  }

  protected onRender() {}

  protected onDisposing() {
    this.barMesh?.dispose()
  }
}
