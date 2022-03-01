import * as bjs from '@babylonjs/core/Legacy/legacy'
// import { TradingSession, TradingSessionEvent } from '../../Market/TradingSession';
import { LocalTradingSession } from '../LocalTradingSession'
// import { Scene } from '@/modules/SceneGraph/Scene';
import { AssetManager } from '@/modules/SceneGraph/AssetManager'
import { EventBus } from '@/modules/SceneGraph/EventBus'
import { DockingPosition, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { UIControl } from '@/modules/SceneGraph/UIControl'
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
import Logger from '@/modules/SceneGraph/Logger'

export class OrderEntryElement extends UIControl {
  leftArrowButtonProxy?: bjs.Mesh
  leftButtonProxyMaterial?: bjs.StandardMaterial
  leftArrowIcon?: bjs.Mesh
  leftArrowIconMaterial?: bjs.PBRMaterial
  leftArrowHomePosition: bjs.Vector3 = new bjs.Vector3(-19, 0, -1)
  leftArrowHiddenPosition: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  leftArrowEmmisiveColor: bjs.Color3 = bjs.Color3.FromInts(77, 0, 112) //bjs.Color3.FromInts(77,0,112);

  rightArrowButtonProxy?: bjs.Mesh
  rightButtonProxyMaterial?: bjs.StandardMaterial
  rightArrowIcon?: bjs.Mesh
  rightArrowIconMaterial?: bjs.PBRMaterial
  rightArrowHomePosition: bjs.Vector3 = new bjs.Vector3(19, 0, -1)
  rightArrowHiddenPosition: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  rightArrowEmmisiveColor: bjs.Color3 = bjs.Color3.FromInts(0, 46, 153) //bjs.Color3.FromInts(0,34,112);

  arrowEmissiveDefault: bjs.Color3 = bjs.Color3.FromInts(0, 0, 0)

  // text : bjs.Mesh;
  backgroundMaterial?: bjs.PBRMaterial

  private leftArrowHovered = false
  private rightArrowHovered = false
  // private exitTradeHovered : boolean = false;

  private leftArrowEngaged = false
  private rightArrowEngaged = false

  // private buttonDefaultScale : bjs.Vector3 = new bjs.Vector3(1,1,1);
  // private buttonHoverScale : bjs.Vector3 = new bjs.Vector3(1.2,1.2,1.2);

  isInTrade = false
  isHidingArrows = false
  isShowingArrows = false

  arrowAnimationSpeed = 0.5

  shiftPressed = false

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public session: LocalTradingSession,
    public glowLayer: bjs.GlowLayer
  ) {
    super(
      name,
      x,
      y,
      z,
      scene,
      0,
      0,
      DockingPosition.CENTER,
      new bjs.Vector3(0, 0, 0)
    )
    this.create()
  }

  protected async onCreate() {
    this.leftButtonProxyMaterial = new bjs.StandardMaterial(
      'Left Button Proxy',
      this.scene.bjsScene
    )
    this.leftButtonProxyMaterial.alpha = 0

    this.rightButtonProxyMaterial = new bjs.StandardMaterial(
      'Button Proxy',
      this.scene.bjsScene
    )
    this.rightButtonProxyMaterial.alpha = 0

    // Start configuration of left arrow
    this.leftArrowButtonProxy = AssetManager.Instance(
      this.scene.title
    ).getMeshClone('arrowBackground') as bjs.Mesh
    this.leftArrowButtonProxy.name = 'Left Arrow Button Proxy'
    this.leftArrowButtonProxy.parent = this
    this.leftArrowButtonProxy.billboardMode = bjs.Mesh.BILLBOARDMODE_NONE

    const leftArrowButtonProxyMesh: bjs.Mesh =
      this.leftArrowButtonProxy.getChildren()[0] as bjs.Mesh
    leftArrowButtonProxyMesh.material = this.leftButtonProxyMaterial
    leftArrowButtonProxyMesh.position = new bjs.Vector3(0, 0, 0)
    this.leftArrowButtonProxy.scaling = new bjs.Vector3(1.6, 1.6, 1.6)
    this.leftArrowButtonProxy.position = this.leftArrowHomePosition
    this.leftArrowButtonProxy.hasVertexAlpha = true

    this.leftArrowIcon = AssetManager.Instance(this.scene.title).getMeshClone(
      'Arrow'
    ) as bjs.Mesh
    this.leftArrowIcon.name = 'Left Arrow Icon'
    // this.leftArrowIcon.setParent(this.leftArrowButtonProxy);
    this.leftArrowIcon.parent = this.leftArrowButtonProxy
    this.leftArrowIconMaterial = new bjs.PBRMaterial(
      'Left Arrow Icon',
      this.scene.bjsScene
    )
    this.leftArrowIconMaterial.albedoColor = bjs.Color3.FromInts(
      250,
      33,
      149
    ).toLinearSpace() //bjs.Color3.FromInts(250, 33, 149); //0, 16, 48
    this.leftArrowIconMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.leftArrowIconMaterial.roughness = 0.1
    this.leftArrowIconMaterial.metallic = 0.6
    this.leftArrowIconMaterial.alpha = 0.7
    ;(this.leftArrowIcon.getChildren()[0] as bjs.Mesh).material =
      this.leftArrowIconMaterial
    ;(this.leftArrowIcon.getChildren()[0] as bjs.Mesh).hasVertexAlpha = true
    //this.leftArrowIcon.rotate(bjs.Axis.X,Math.PI/2, bjs.Space.WORLD);
    // this.leftArrowIcon.position = this.leftArrowHomePosition;
    this.leftArrowIcon.rotation = new bjs.Vector3(0, 0, 0)
    // this.leftArrowIcon.rotation.y = Math.PI;
    this.leftArrowIcon.scaling = new bjs.Vector3(0.34, 0.34, 0.34)
    this.glowLayer.addIncludedOnlyMesh(
      this.leftArrowIcon.getChildren()[0] as bjs.Mesh
    )

    // Start configuration of right arrow
    this.rightArrowButtonProxy = AssetManager.Instance(
      this.scene.title
    ).getMeshClone('arrowBackground') as bjs.Mesh
    this.rightArrowButtonProxy.name = 'Right Arrow Button Proxy'
    this.rightArrowButtonProxy.parent = this
    this.rightArrowButtonProxy.billboardMode = bjs.Mesh.BILLBOARDMODE_NONE

    const rightArrowButtonProxyMesh: bjs.Mesh =
      this.rightArrowButtonProxy.getChildren()[0] as bjs.Mesh
    rightArrowButtonProxyMesh.material = this.leftButtonProxyMaterial
    rightArrowButtonProxyMesh.position = new bjs.Vector3(0, 0, 0)
    this.rightArrowButtonProxy.scaling = new bjs.Vector3(1.6, 1.6, 1.6)
    this.rightArrowButtonProxy.position = this.rightArrowHomePosition
    this.rightArrowButtonProxy.hasVertexAlpha = true

    this.rightArrowIcon = AssetManager.Instance(this.scene.title).getMeshClone(
      'Arrow'
    ) as bjs.Mesh
    this.rightArrowIcon.name = 'Right Arrow Icon'
    // this.rightArrowIcon.setParent(this.rightArrowButtonProxy);
    this.rightArrowIcon.parent = this.rightArrowButtonProxy
    this.rightArrowIconMaterial = new bjs.PBRMaterial(
      'Right Arrow Icon',
      this.scene.bjsScene
    )
    this.rightArrowIconMaterial.albedoColor = bjs.Color3.FromInts(
      40,
      90,
      230
    ).toLinearSpace() //0, 16, 48
    this.rightArrowIconMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.rightArrowIconMaterial.roughness = 0.1
    this.rightArrowIconMaterial.metallic = 0.6
    this.rightArrowIconMaterial.alpha = 0.7
    ;(this.rightArrowIcon.getChildren()[0] as bjs.Mesh).material =
      this.rightArrowIconMaterial
    ;(this.rightArrowIcon.getChildren()[0] as bjs.Mesh).hasVertexAlpha = true
    // this.rightArrowIcon.position = this.rightArrowHomePosition;
    // this.rightArrowIcon.rotate(bjs.Axis.X,Math.PI/2, bjs.Space.WORLD);
    // this.rightArrowIcon.rotate(bjs.Axis.Y,Math.PI, bjs.Space.WORLD);
    this.rightArrowIcon.rotation = new bjs.Vector3(0, 0, 0)
    this.rightArrowIcon.rotation.y = Math.PI
    this.rightArrowIcon.scaling = new bjs.Vector3(0.34, 0.34, 0.34)
    this.glowLayer.addIncludedOnlyMesh(
      this.rightArrowIcon.getChildren()[0] as bjs.Mesh
    )

    this.setEnabled(false)

    EventBus.Instance.eventHandler.subscribe((p, r) => {
      if (r === 'ENGAGED_BUY_BUTTON') {
        this.engageButtons(true)
      } else if (r === 'ENGAGED_SELL_BUTTON') {
        this.engageButtons(false)
      } else if (r === 'RESET_BUTTON_STATUS') {
        this.resetButtonStats()
      } else if (
        r === 'TOUCH_START' ||
        r === 'TOUCH_END' ||
        r === 'TOUCH_CANCEL' ||
        r === 'TOUCH_MOVE'
      ) {
        this.leftArrowHovered = false
        this.rightArrowHovered = false
      }
    })

    this.session.onTradingSessionStarted.subscribe(
      this.onTradingSessionStarted.bind(this)
    )
    this.session.onTradingSessionEnded.subscribe(
      this.onTradingSessionEnded.bind(this)
    )

    //this.rightArrowBackground.scaling = new bjs.Vector3(0.5,0.5,0.5);
    //this.rightArrow.billboardMode = bjs.Mesh.BILLBOARDMODE_X;

    // let leftArrowButtonProxyMesh : bjs.Mesh =  this.leftArrowIcon.getChildren()[0] as bjs.Mesh;

    leftArrowButtonProxyMesh.isPickable = true
    leftArrowButtonProxyMesh.actionManager = new bjs.ActionManager(
      this.scene.bjsScene
    )
    leftArrowButtonProxyMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOverTrigger, () => {
        if (this.leftArrowIconMaterial)
          this.leftArrowIconMaterial.emissiveColor = this.leftArrowEmmisiveColor //bjs.Color3.FromInts(77,0,112);
        this.leftArrowHovered = true
      })
    )

    leftArrowButtonProxyMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOutTrigger, () => {
        if (this.leftArrowIconMaterial)
          this.leftArrowIconMaterial.emissiveColor = this.arrowEmissiveDefault //new bjs.Color3(0,0,0);
        this.leftArrowHovered = false
      })
    )

    leftArrowButtonProxyMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPickTrigger, () => {
        this.session.processEvent('SELL_AT_MARKET', '')
        this.engageButtons(false)
        //this.isHidingArrows = true;
        //this.showLeftArrow(false);
        //this.showRightArrow(false);
        //this.showExitTrade(true);
      })
    )

    // let rightArrowButtonProxyMesh : bjs.Mesh =   this.rightArrowIcon.getChildren()[0] as bjs.Mesh;
    rightArrowButtonProxyMesh.isPickable = true
    rightArrowButtonProxyMesh.actionManager = new bjs.ActionManager(
      this.scene.bjsScene
    )
    rightArrowButtonProxyMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOverTrigger, () => {
        if (this.rightArrowIconMaterial)
          this.rightArrowIconMaterial.emissiveColor =
            this.rightArrowEmmisiveColor //bjs.Color3.FromInts(0,34,112);
        this.rightArrowHovered = true
      })
    )

    rightArrowButtonProxyMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOutTrigger, () => {
        if (this.rightArrowIconMaterial)
          this.rightArrowIconMaterial.emissiveColor = this.arrowEmissiveDefault //new bjs.Color3(0,0,0);
        this.rightArrowHovered = false
      })
    )

    rightArrowButtonProxyMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPickTrigger, () => {
        this.session.processEvent('BUY_AT_MARKET', '')
        this.engageButtons(true)
        //this.isHidingArrows = true;
        // this.showLeftArrow(false);
        //this.showRightArrow(false);
        //this.showExitTrade(true);
      })
    )

    if (this.scene.bjsScene.actionManager === undefined) {
      this.scene.bjsScene.actionManager = new bjs.ActionManager(
        this.scene.bjsScene
      )
    }
  }

  onTradingSessionStarted() {
    this.show()
  }

  onTradingSessionEnded() {
    this.hide()
    this.resetButtonStats()
  }

  public placeMarketBuyOrder() {
    Logger.log('Order Entry Element : Placing Market Buy Order')

    this.session.processEvent('BUY_AT_MARKET', '')
    this.engageButtons(true)
  }

  public placeMarketSellOrder() {
    Logger.log('Order Entry Rig : Placing Market Sell Order')
    this.session.processEvent('SELL_AT_MARKET', '')
    this.engageButtons(false)
  }

  public resetButtonStats() {
    this.leftArrowEngaged = false
    this.leftArrowHovered = false
    this.rightArrowEngaged = false
    this.rightArrowHovered = false
  }

  public engageButtons(isBuy: boolean) {
    this.isInTrade = false
    if (isBuy) {
      if (this.leftArrowEngaged) {
        this.resetButtonStats()
      } else {
        this.rightArrowEngaged = true
        this.leftArrowHovered = false
        this.isInTrade = true
      }
    } else {
      if (this.rightArrowEngaged) {
        this.resetButtonStats()
      } else {
        this.leftArrowEngaged = true
        this.rightArrowHovered = false
        this.isInTrade = true
      }
    }
  }

  public setShiftPressed() {
    this.shiftPressed = true
  }

  public show() {
    this.setEnabled(true)
  }

  public hide() {
    this.setEnabled(false)
  }

  public showLeftArrow(isShown: boolean) {
    this.leftArrowIcon?.setEnabled(isShown)
  }

  public showRightArrow(isShown: boolean) {
    this.rightArrowIcon?.setEnabled(isShown)
  }

  public getBounding() {
    return new bjs.Vector2(this.width, this.height)
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      this.rotation.z = Math.PI / 2
      this.position.x = 2
      this.leftArrowHomePosition.x = -12
      this.rightArrowHomePosition.x = 12
    } else {
      this.rotation.z = 0
      this.leftArrowHomePosition.x = -15 //-23
      this.rightArrowHomePosition.x = 15
    }
  }

  protected onRender() {
    if (this.leftArrowIconMaterial && this.rightArrowIconMaterial) {
      if (this.leftArrowEngaged || this.leftArrowHovered) {
        this.leftArrowIconMaterial.emissiveColor = this.leftArrowEmmisiveColor
      } else {
        this.leftArrowIconMaterial.emissiveColor = this.arrowEmissiveDefault
      }

      if (this.rightArrowEngaged || this.rightArrowHovered) {
        this.rightArrowIconMaterial.emissiveColor = this.rightArrowEmmisiveColor
      } else {
        this.rightArrowIconMaterial.emissiveColor = this.arrowEmissiveDefault
      }
    }
  }
}
