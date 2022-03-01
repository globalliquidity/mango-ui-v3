import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { UILayer } from '@/modules/SceneGraph/UILayer'
// import { LocalGameSession } from '@/modules/TradeSerum/Elements/LocalGameSession';
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
import { TradeSerumSceneUIControlLayer } from './TradeSerumSceneUIControlLayer'
import { TradeSerumSceneUIDisplayLayer } from './TradeSerumSceneUIDisplayLayer'
// import { TradeSerumSceneUIPanelManager } from './TradeSerumSceneUIPanelManager';
import { LocalTradingSession } from '../LocalTradingSession'
import { TradeSerumSceneUIPanelManager } from './TradeSerumSceneUIPanelManager'

export class TradeSerumSceneUIElement extends SceneElement {
  layers: Map<string, UILayer> = new Map<string, UILayer>()
  distance = 10 //Distance from camera

  topLeft: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  topRight: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  bottomLeft: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  bottomRight: bjs.Vector3 = new bjs.Vector3(0, 0, 0)

  scale = 1
  originMesh?: bjs.Mesh

  tangentRate = 1
  aspectRatio = 1

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public tradingSession: LocalTradingSession,
    public glowLayer: bjs.GlowLayer
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  protected async onCreate() {
    this.parent = this.scene.camera

    // // Create PanelManager Layer
    const panelLayer = new TradeSerumSceneUIPanelManager(
      'Panel Manager',
      0,
      0,
      0,
      this.scene,
      this.glowLayer,
      20
    )
    this.addLayer(panelLayer)

    // // Create ControlLayer
    const controlLayer = new TradeSerumSceneUIControlLayer(
      'Control Layer',
      0,
      0,
      0,
      this.scene,
      this.tradingSession,
      this.glowLayer,
      10
    )
    this.addLayer(controlLayer)

    // Create DisplayLayer
    const displayLayer = new TradeSerumSceneUIDisplayLayer(
      'Display Layer',
      0,
      0,
      0,
      this.scene,
      this.tradingSession,
      this.glowLayer,
      15
    )

    this.addLayer(displayLayer)

    // Define observable for getting corners
    this.scene.bjsScene.onBeforeRenderObservable.add(() => {
      this.getTagentRate()
      this.setLayerParams()
    })

    this.setEnabled(false)
  }

  public addLayer(layer: UILayer) {
    this.layers.set(layer.name, layer)
    this.addChild(layer)
  }

  public removeLayer(name: string) {
    this.layers.delete(name)
  }

  public show() {
    this.setEnabled(true)
  }

  public hide() {
    this.setEnabled(false)
  }

  public reset() {
    // const panelLayer = this.layers.get("Panel Manager") as TradeSerumSceneUIPanelManager;
    // panelLayer.reset();

    const displayLayer = this.layers.get(
      'Display Layer'
    ) as TradeSerumSceneUIDisplayLayer
    displayLayer.reset()

    // const controlLayer = this.layers.get("Control Layer") as TradeSerumSceneUIControlLayer;
    // controlLayer.reset();
  }

  private getTagentRate() {
    const fov = this.scene.camera.fov
    this.tangentRate = Math.tan(fov / 2)
    this.aspectRatio = this.scene.bjsScene
      .getEngine()
      .getAspectRatio(this.scene.camera)

    /*
        let y = this.distance * tangentRate;
        let x = y * aspectRatio;

        this.topLeft = new bjs.Vector3(-x, y, this.distance);
        this.topRight = new bjs.Vector3(x, y, this.distance);
        this.bottomLeft = new bjs.Vector3(-x, -y, this.distance);
        this.bottomRight = new bjs.Vector3(x, -y, this.distance);
        */

    // this.originMesh = bjs.MeshBuilder.CreateSphere("sphere", {diameter: 1}, this.scene.bjsScene); //default sphere
    // this.addChild(this.originMesh);
    // this.originMesh.parent = this;

    // this.originMesh.position = new bjs.Vector3(-x + 3, -y + 3, 0);
    // this.position = new bjs.Vector3(-x, -y, this.distance);

    // let distFromTarget = this.position.subtract(this.scene.camera.target).length();
    // this.scaling = new bjs.Vector3(1 / distFromTarget, 1 / distFromTarget, 1 / distFromTarget);
  }

  private setLayerParams() {
    this.layers.forEach((layer) => {
      layer.setLayerParams(this.aspectRatio, this.tangentRate)
    })
  }

  protected onFormat() {
    /*
        if (this.scene.sceneType === SceneFormatType.Portrait)
        {
            this.priceZoom.position.x = this.bottomRight.x - 1;
            this.priceZoom.position.y = 0;
            this.priceZoom.position.z = this.bottomRight.z;

            let distFromTarget = this.priceZoom.position.subtract(this.scene.camera.target).length();
            this.priceZoom.scaling = new bjs.Vector3(4 / distFromTarget, 4 / distFromTarget, 4 / distFromTarget);
        }
        else
        {
            this.priceZoom.position.x = this.bottomLeft.x + 0.3;
            this.priceZoom.position.y = this.bottomLeft.y + 0.5;
            this.priceZoom.position.z = this.bottomLeft.z;
            
            let distFromTarget = this.priceZoom.position.subtract(this.scene.camera.target).length();
            this.priceZoom.scaling = new bjs.Vector3(1 / distFromTarget, 1 / distFromTarget, 1 / distFromTarget);
        }
        */
  }

  protected onRender() {
    // this.onFormat();
  }
}
