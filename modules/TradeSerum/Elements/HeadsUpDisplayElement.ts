import { DepthFinderPresenter } from './DepthFinder/DepthFinderPresenter'
import * as bjs from '@babylonjs/core/Legacy/legacy'
import { LocalTradingSession } from './LocalTradingSession'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { AssetManager } from '@/modules/SceneGraph/AssetManager'
// import { EventBus } from '@/modules/SceneGraph/EventBus';
import { TradeSerumScene } from '../TradeSerumScene'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { TradeDirection } from '../Enums'
import { SceneFormatType } from '@/modules/SceneGraph/Enums'
import { MainStatusDisplay } from '@/modules/SceneGraph/MainStatusDisplay'
// import { RoundStatusElement } from './RoundStatusElement';
// import { Trade } from '../../Market/Trade';
// import { ThinSprite } from '@babylonjs/core/Sprites/thinSprite';

export class HeadsUpDisplayElement extends SceneElement {
  presenter: DepthFinderPresenter
  frame?: bjs.Mesh
  frameMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Frame',
    this.scene.bjsScene
  )

  frameEmissiveDefault: bjs.Color3 = bjs.Color3.FromInts(0, 0, 0)
  frameEmissiveShort: bjs.Color3 = bjs.Color3.FromInts(77, 0, 112)
  frameEmissiveLong: bjs.Color3 = bjs.Color3.FromInts(0, 46, 153)

  midPriceLabel: TextMeshString | undefined

  borderTubeSegment?: bjs.Mesh

  leftBorderTube?: bjs.Mesh
  rightBorderTube?: bjs.Mesh
  frontBorderTube?: bjs.Mesh
  backBorderTube?: bjs.Mesh

  private mainStatus: MainStatusDisplay | undefined

  insideBidMarker?: bjs.Mesh
  insideBidMarkerMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Inside Bid Market',
    this.scene.bjsScene
  )

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public session: LocalTradingSession,
    public orderBookRig: bjs.TransformNode
  ) {
    super(name, x, y, z, scene)
    this.presenter = this.scene.depthFinderPresenter as DepthFinderPresenter
    this.create()
  }

  protected async onCreate() {
    this.frameMaterial.albedoColor = bjs.Color3.FromInts(114, 119, 203) //0, 16, 48
    this.frameMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.frameMaterial.roughness = 0.1
    this.frameMaterial.metallic = 0.8

    /*
        this.frame = AssetManager.Instance(this.scene.title).getMeshClone("hudFrame") as bjs.Mesh;
        this.frame.name = "HUDFrame"
        this.frame.parent = this;
        this.frame._scene = this.scene.bjsScene;
        this.frame.position.y = 11.1;
        
        // let bound = this.frame.getBoundingInfo();
        
        this.frame.scaling = new bjs.Vector3(3.26,3,3.25);
        this.frame.material = this.frameMaterial;
        this.scene.glowLayer.addIncludedOnlyMesh(this.frame);
        */

    // let borderTubeLength = this.scene.rowCount * this.scene.cellDepth * this.presenter.priceQuantizeDivision.priceDivisionMultiplier.value;

    //this.leftBorderTube = this.borderTubeSegment.createInstance("Left Border Tube");
    this.leftBorderTube = AssetManager.Instance(this.scene.title).getMeshClone(
      'tubeSegment'
    ) as bjs.Mesh
    this.leftBorderTube.name = 'Left Border'
    this.leftBorderTube.parent = this
    this.leftBorderTube.position.x =
      -this.scene.columnCount * this.scene.cellWidth
    this.leftBorderTube.position.y = -0.4

    this.leftBorderTube.position.z =
      (this.scene.rowCount * this.scene.cellDepth) / 2
    this.leftBorderTube.rotation = new bjs.Vector3(0, Math.PI / 2, 0)
    this.leftBorderTube.scaling = new bjs.Vector3(1200, 3, 3.25)
    this.leftBorderTube.material = this.frameMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(this.leftBorderTube)

    //this.rightBorderTube = this.borderTubeSegment.createInstance("Right Border Tube");
    this.rightBorderTube = AssetManager.Instance(this.scene.title).getMeshClone(
      'tubeSegment'
    ) as bjs.Mesh
    this.rightBorderTube.name = 'Right Border'
    this.rightBorderTube.parent = this
    this.rightBorderTube.position.x =
      (this.scene.columnCount + 1) * this.scene.cellWidth
    this.rightBorderTube.position.y = -0.4

    this.rightBorderTube.position.z =
      (this.scene.rowCount * this.scene.cellDepth) / 2
    this.rightBorderTube.rotation = new bjs.Vector3(0, Math.PI / 2, 0)
    this.rightBorderTube.scaling = new bjs.Vector3(1200, 3, 3.25)
    this.rightBorderTube.material = this.frameMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(this.rightBorderTube)

    //this.frontBorderTube = this.borderTubeSegment.createInstance("Front Border Tube");
    this.frontBorderTube = AssetManager.Instance(this.scene.title).getMeshClone(
      'tubeSegment'
    ) as bjs.Mesh
    this.frontBorderTube.name = 'Front Border'
    this.frontBorderTube.parent = this
    this.frontBorderTube.position.x = 0
    this.frontBorderTube.position.y = -0.3
    this.frontBorderTube.position.z = 0
    this.frontBorderTube.scaling = new bjs.Vector3(2000, 3, 3.25)
    this.frontBorderTube.material = this.frameMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(this.frontBorderTube)

    //this.backBorderTube = this.borderTubeSegment.createInstance("Back Border Tube");
    this.backBorderTube = AssetManager.Instance(this.scene.title).getMeshClone(
      'tubeSegment'
    ) as bjs.Mesh
    this.backBorderTube.name = 'Back Border'
    this.backBorderTube.parent = this
    this.backBorderTube.position.x = 0
    this.backBorderTube.position.y = 0
    this.backBorderTube.position.z = this.scene.rowCount * this.scene.cellDepth
    this.backBorderTube.scaling = new bjs.Vector3(
      this.scene.columnCount * 10,
      3,
      3.25
    )
    this.backBorderTube.material = this.frameMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(this.backBorderTube)

    this.mainStatus = new MainStatusDisplay(
      'Main Status',
      0,
      10.5,
      0,
      this.scene,
      'ENGAGED',
      GLSGColor.SkyBlue,
      2.7, // 3.5
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )
    this.addChild(this.mainStatus)

    this.insideBidMarker = AssetManager.Instance(this.scene.title).getMeshClone(
      'tubeSegment'
    ) as bjs.Mesh
    this.insideBidMarker.name = 'Position Tube'
    this.insideBidMarker.parent = this
    this.insideBidMarker.position.y = -0.25
    this.insideBidMarker.scaling = new bjs.Vector3(3.5, 3, 3.25)

    this.insideBidMarkerMaterial.albedoColor = bjs.Color3.FromInts(
      79,
      140,
      238
    ).toLinearSpace() //0, 16, 48
    this.insideBidMarkerMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.insideBidMarkerMaterial.roughness = 0
    this.insideBidMarkerMaterial.metallic = 0
    this.insideBidMarker.material = this.insideBidMarkerMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(this.insideBidMarker)
    this.insideBidMarker.setEnabled(false)
  }

  public showStatus(
    message: string,
    color: GLSGColor = GLSGColor.Aqua,
    persist = false
  ) {
    if (this.mainStatus)
      this.mainStatus?.enqueueStatusMessage(message, color, persist)
  }

  public reset() {
    // this.roundStatusElement.reset();
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      this.rotation.x = -(Math.PI * 2) / 3

      this.leftBorderTube?.setEnabled(false)
      this.rightBorderTube?.setEnabled(false)

      if (this.mainStatus) {
        this.mainStatus.position = new bjs.Vector3(12, 15, -5)
        this.mainStatus.rotation = new bjs.Vector3(
          Math.PI,
          Math.PI / 8,
          -Math.PI / 2
        )
      }
    } else {
      this.rotation.x = 0

      if (this.frame) {
        this.frame.position = new bjs.Vector3(0, 11.1, 0)
        this.frame.rotation = new bjs.Vector3(-Math.PI / 2, 0, 0)
        this.frame.scaling = new bjs.Vector3(3.8, 3, 3.25)
      }

      if (this.leftBorderTube) {
        this.leftBorderTube.position.x =
          -this.scene.columnCount * this.scene.cellWidth
        //this.leftBorderTube.position.y = 0;
        this.leftBorderTube.position.z =
          (this.scene.rowCount * this.scene.cellDepth) / 2
        this.leftBorderTube.scaling = new bjs.Vector3(
          this.scene.rowCount * 10,
          4,
          4
        )
        this.leftBorderTube.setEnabled(true)
      }

      if (this.rightBorderTube) {
        this.rightBorderTube.position.x =
          this.scene.columnCount * this.scene.cellWidth
        //this.rightBorderTube.position.y = 0;
        this.rightBorderTube.position.z =
          (this.scene.rowCount * this.scene.cellDepth) / 2
        this.rightBorderTube.scaling = new bjs.Vector3(
          this.scene.rowCount * 10,
          4,
          4
        )
        this.rightBorderTube.setEnabled(true)
      }

      if (this.mainStatus) {
        this.mainStatus.position = new bjs.Vector3(0, 10.5, 0)
        this.mainStatus.rotation = new bjs.Vector3(0, 0, 0)
      }
    }
  }

  protected onRender() {
    const currentInsideBidPrice = this.presenter.insideBid?.price

    if (currentInsideBidPrice && this.insideBidMarker)
      this.insideBidMarker.position.x =
        this.presenter.offsetForPrice(currentInsideBidPrice) *
          this.scene.cellWidth -
        this.orderBookRig.position.x

    if (this.session.hasOpenTrade) {
      if (this.session.openTradeDirection === TradeDirection.Long) {
        this.frameMaterial.emissiveColor = bjs.Color3.Lerp(
          this.frameMaterial.emissiveColor,
          this.frameEmissiveLong,
          0.1
        )
        this.frameMaterial.emissiveIntensity = 1.0 - Math.random() * 0.25
      } else {
        this.frameMaterial.emissiveColor = bjs.Color3.Lerp(
          this.frameMaterial.emissiveColor,
          this.frameEmissiveShort,
          0.1
        )
        this.frameMaterial.emissiveIntensity = 1.0 - Math.random() * 0.5
      }
    } else {
      this.frameMaterial.emissiveColor = bjs.Color3.Lerp(
        this.frameMaterial.emissiveColor,
        this.frameEmissiveDefault,
        0.1
      )
    }
  }
}

export class HeadsUpDisplayControllerElement extends SceneElement {
  hud?: HeadsUpDisplayElement
  distance = 2

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  protected onCreate() {}

  protected onRender() {
    this.position = this.scene.camera.position
    const hudPosition: bjs.Vector3 = this.scene.camera.getFrontPosition(
      this.distance
    )
    if (this.hud) {
      this.hud.position = hudPosition.subtract(this.scene.camera.position)
    }
  }
}
