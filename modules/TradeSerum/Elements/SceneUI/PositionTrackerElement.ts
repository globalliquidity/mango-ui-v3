import { DepthFinderPresenter } from '../DepthFinder/DepthFinderPresenter'
import * as bjs from '@babylonjs/core/Legacy/legacy'
import currency from 'currency.js'
// import { TradingSession } from './TradingSession';
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { AssetManager } from '@/modules/SceneGraph/AssetManager'
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import { TradeDirection } from '@/modules/TradeSerum/Enums'
import { Trade } from '@/modules/TradeSerum/Market/Trade'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
  SceneFormatType,
} from '@/modules/SceneGraph/Enums'
import Logger from '@/modules/SceneGraph/Logger'
import { TradingPlayer } from '@/modules/TradeSerum/TradingPlayer'
import { LocalTradingSession } from '../LocalTradingSession'
import { PriceDivisionManager } from '../../PriceDivision/PriceDivisionManager'

// import { MessageBusManager } from '../MessageBusManager';
// import { GameRoundResults } from '../../GameRoundResults';
// import { GamePlayer, GamePlayerType } from '../GamePlayer';

export class PositionTrackerElement extends SceneElement {
  presenter: DepthFinderPresenter
  //positionPointerLong : bjs.Mesh;
  //positionPointerShort : bjs.Mesh;

  //positionPointerLongMaterial : bjs.PBRMaterial = new bjs.PBRMaterial("Position Pointer Long",this.scene.bjsScene);
  //positionPointerShortMaterial : bjs.PBRMaterial = new bjs.PBRMaterial("Position Pointer Short",this.scene.bjsScene);

  positionLongAlbedo: bjs.Color3 = bjs.Color3.FromInts(30, 52, 164)
  positionNoneEmissive: bjs.Color3 = bjs.Color3.FromInts(0, 0, 0)
  positionLongEmissive: bjs.Color3 = bjs.Color3.FromInts(0, 22, 46)
  positionShortAlbedo: bjs.Color3 = bjs.Color3.FromInts(184, 4, 220)
  positionShortEmissive: bjs.Color3 = bjs.Color3.FromInts(21, 0, 46)

  positionOpenPriceLabel?: TextMeshString
  positionClosePriceLabel?: TextMeshString
  currentTrade: Trade | undefined

  // playerImage : bjs.Mesh;
  // playerImageMaterial : bjs.StandardMaterial;

  positionTube?: bjs.Mesh
  positionTubeMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Position Tube Win',
    this.scene.bjsScene
  )

  closingPriceTube?: bjs.Mesh
  closingPriceTubeMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Closing Price Tube',
    this.scene.bjsScene
  )

  positionTubeWinAlbedo: bjs.Color3 = bjs.Color3.FromInts(31, 255, 57)
  positionTubeWinEmissive: bjs.Color3 = bjs.Color3.FromInts(0, 96, 0)

  positionTubeLossAlbedo: bjs.Color3 = bjs.Color3.FromInts(247, 34, 34)
  positionTubeLossEmissive: bjs.Color3 = bjs.Color3.FromInts(96, 0, 0)

  positionTubeEmissiveIntensity?: number

  maxIntensityValue = 2000

  openPnLText?: TextMeshString

  linePoints: Array<bjs.Vector3> = new Array<bjs.Vector3>()
  positionSpreadTriangle?: bjs.Mesh
  positionSpreadLeftExtent?: bjs.Mesh
  positionSpreadRightExtent?: bjs.Mesh

  positionSpreadMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Position Tube Win',
    this.scene.bjsScene
  )

  openPriceString = '000'

  playerHasOpenOrder = false
  isShown = false

  player?: TradingPlayer

  buttonMesh?: bjs.Mesh
  tubeMaterial?: bjs.PBRMaterial

  leftArrowIcon?: bjs.Mesh
  leftArrowIconMaterial?: bjs.PBRMaterial
  leftArrowEmmisiveColor: bjs.Color3 = bjs.Color3.FromInts(77, 0, 112) //bjs.Color3.FromInts(77,0,112);
  rightArrowEmmisiveColor: bjs.Color3 = bjs.Color3.FromInts(0, 46, 153) //bjs.Color3.FromInts(0,34,112);

  rightArrowIcon?: bjs.Mesh
  rightArrowIconMaterial?: bjs.PBRMaterial

  onTradeOpenedUnsubscribeFuntion = null
  onTradecancelledUnsubscribeFuntion = null
  onTradeClosedUnsubscribeFuntion = null

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public orderBookRig: bjs.TransformNode,
    public color: bjs.Color3,
    public tradingSession: LocalTradingSession
  ) {
    super(name, x, y, z, scene)
    this.presenter = this.scene.depthFinderPresenter as DepthFinderPresenter
    this.create()
  }

  protected onCreate() {
    this.buttonMesh = AssetManager.Instance(this.scene.title).getMeshClone(
      'steelRing'
    ) as bjs.Mesh
    const ringMesh: bjs.Mesh = this.buttonMesh.getChildren()[0] as bjs.Mesh
    const ringMaterial = ringMesh.material?.clone('cloned') as bjs.PBRMaterial
    ringMaterial.albedoColor = this.color
    ringMesh.material = ringMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(ringMesh as bjs.Mesh)
    this.buttonMesh.parent = this
    this.buttonMesh.position.y = 1.5
    this.buttonMesh.position.z = -0.2
    this.buttonMesh.scaling = new bjs.Vector3(2, 2, 1)
    this.buttonMesh.setEnabled(false)

    this.leftArrowIcon = AssetManager.Instance(this.scene.title).getMeshClone(
      'Arrow'
    ) as bjs.Mesh
    this.leftArrowIcon.name = 'Left Arrow Icon'
    // this.leftArrowIcon.setParent(this.leftArrowButtonProxy);
    this.leftArrowIcon.parent = this
    this.leftArrowIconMaterial = new bjs.PBRMaterial(
      'Left Arrow Icon',
      this.scene.bjsScene
    )
    this.leftArrowIconMaterial.albedoColor = bjs.Color3.FromInts(
      250,
      33,
      149
    ).toLinearSpace() //bjs.Color3.FromInts(250, 33, 149); //0, 16, 48
    this.leftArrowIconMaterial.emissiveColor = this.leftArrowEmmisiveColor
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
    this.leftArrowIcon.position.y = 1.4
    this.leftArrowIcon.rotation = new bjs.Vector3(0, 0, 0)
    this.leftArrowIcon.rotation.y = Math.PI
    this.leftArrowIcon.scaling = new bjs.Vector3(0.1, 0.1, 0.1)
    this.scene.glowLayer.addIncludedOnlyMesh(
      this.leftArrowIcon.getChildren()[0] as bjs.Mesh
    )
    this.leftArrowIcon.setEnabled(false)

    this.rightArrowIcon = AssetManager.Instance(this.scene.title).getMeshClone(
      'Arrow'
    ) as bjs.Mesh
    this.rightArrowIcon.name = 'Right Arrow Icon'
    // this.rightArrowIcon.setParent(this.rightArrowButtonProxy);
    this.rightArrowIcon.parent = this
    this.rightArrowIconMaterial = new bjs.PBRMaterial(
      'Right Arrow Icon',
      this.scene.bjsScene
    )
    this.rightArrowIconMaterial.albedoColor = bjs.Color3.FromInts(
      40,
      90,
      230
    ).toLinearSpace() //0, 16, 48
    this.rightArrowIconMaterial.emissiveColor = this.rightArrowEmmisiveColor
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
    this.rightArrowIcon.position.y = 1.4
    this.rightArrowIcon.rotation = new bjs.Vector3(0, 0, 0)
    //this.rightArrowIcon.rotation.y = Math.PI;
    this.rightArrowIcon.scaling = new bjs.Vector3(0.1, 0.1, 0.1)
    this.scene.glowLayer.addIncludedOnlyMesh(
      this.rightArrowIcon.getChildren()[0] as bjs.Mesh
    )
    this.rightArrowIcon.setEnabled(false)

    this.positionOpenPriceLabel = new TextMeshString(
      'Open Price',
      0,
      0,
      0,
      this.scene,
      '000',
      1.0,
      HorizontalAlignment.Center,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    // this.positionOpenPriceLabel.setParent(this);
    this.positionOpenPriceLabel.position.y = 3
    this.positionOpenPriceLabel.position.z = -0.5

    this.positionOpenPriceLabel.setColor(GLSGColor.SkyBlue)
    this.positionOpenPriceLabel.setEnabled(false)
    this.addChild(this.positionOpenPriceLabel)

    this.positionClosePriceLabel = new TextMeshString(
      'Close Price',
      0,
      0,
      0,
      this.scene,
      '000',
      1.0,
      HorizontalAlignment.Center,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    // this.positionClosePriceLabel.setParent(this);
    this.positionClosePriceLabel.position.y = 3
    this.positionClosePriceLabel.position.z = 0.5

    this.positionClosePriceLabel.setColor(GLSGColor.SkyBlue)
    this.positionClosePriceLabel.setEnabled(false)
    this.addChild(this.positionClosePriceLabel)

    // this.playerImage = bjs.Mesh.CreatePlane("Player Image", 1 , this.scene.bjsScene);
    // this.playerImage.position.x = 0;
    // this.playerImage.position.y = 1.55;
    // this.playerImage.position.z = -0.4;
    // this.playerImage.scaling = new bjs.Vector3(2,2,2);
    // this.playerImage.parent = this;
    // this.playerImage.setEnabled(false);

    this.positionTube = AssetManager.Instance(this.scene.title).getMeshClone(
      'tubeSegment'
    ) as bjs.Mesh
    this.positionTube.name = 'Position Tube'
    this.positionTube.parent = this
    this.positionTube.position.y = -0.25
    this.positionTube.scaling = new bjs.Vector3(3.5, 3, 3.25)
    this.positionTube.setEnabled(false)

    this.positionTubeMaterial.albedoColor = bjs.Color3.FromInts(114, 119, 203) //0, 16, 48
    this.positionTubeMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.positionTubeMaterial.roughness = 0
    this.positionTubeMaterial.metallic = 0
    this.positionTube.material = this.positionTubeMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(this.positionTube)

    this.closingPriceTube = AssetManager.Instance(
      this.scene.title
    ).getMeshClone('tubeSegment') as bjs.Mesh
    this.closingPriceTube.name = 'Closing Price Tube'
    this.closingPriceTube.parent = this
    //this.closingPriceTube.position.y = -0.25;
    this.closingPriceTube.scaling = new bjs.Vector3(33, 2, 2)
    this.closingPriceTube.rotate(bjs.Axis.X, -Math.PI / 2, bjs.Space.LOCAL)
    this.closingPriceTube.rotate(bjs.Axis.Z, Math.PI / 2, bjs.Space.LOCAL)

    this.closingPriceTube.position.y = 1.7
    this.closingPriceTube.position.z = -0.1

    this.closingPriceTube.setEnabled(false)

    //this.closingPriceTube.setEnabled(false);

    this.closingPriceTubeMaterial.albedoColor = bjs.Color3.FromInts(
      114,
      119,
      203
    ) //0, 16, 48
    this.closingPriceTubeMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.closingPriceTubeMaterial.roughness = 0
    this.closingPriceTubeMaterial.metallic = 0
    this.closingPriceTube.material = this.positionTubeMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(this.closingPriceTube)

    this.openPnLText = new TextMeshString(
      'Open Pnl Value',
      0,
      15,
      0,
      this.scene,
      '0',
      2.0,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.openPnLText.parent = this
    this.openPnLText.setColor(GLSGColor.SkyBlue)
    this.openPnLText.setEnabled(false)

    this.positionSpreadTriangle = bjs.MeshBuilder.CreateCylinder(
      'Spread Trangle',
      { diameterTop: 0, height: 1, tessellation: 4 },
      this.scene.bjsScene
    )
    this.positionSpreadTriangle.parent = this
    this.positionSpreadTriangle.position.y = 8
    this.positionSpreadTriangle.scaling.y = 10
    this.positionSpreadTriangle.hasVertexAlpha = true

    this.positionSpreadMaterial.albedoColor = bjs.Color3.FromInts(114, 119, 203) //0, 16, 48
    this.positionSpreadMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.positionSpreadMaterial.roughness = 0
    this.positionSpreadMaterial.metallic = 0
    this.positionSpreadMaterial.alpha = 0.5
    this.positionSpreadMaterial.disableLighting = true

    this.positionSpreadTriangle.material = this.positionSpreadMaterial
    this.scene.glowLayer.addIncludedOnlyMesh(this.positionSpreadTriangle)
    this.positionSpreadTriangle.setEnabled(false)

    this.positionSpreadLeftExtent =
      this.positionSpreadTriangle.clone('Spread Left Extent')
    this.positionSpreadLeftExtent.rotation.z = Math.PI / 2
    this.positionSpreadLeftExtent.position.x = -23.2
    this.positionSpreadLeftExtent.position.y = 1.5
    this.positionSpreadLeftExtent.scaling.x = 3
    this.positionSpreadLeftExtent.scaling.y = 4.5
    this.scene.glowLayer.addIncludedOnlyMesh(this.positionSpreadLeftExtent)
    this.positionSpreadLeftExtent.setEnabled(false)

    this.positionSpreadRightExtent = this.positionSpreadTriangle.clone(
      'Spread Right Extent'
    )
    this.positionSpreadRightExtent.rotation.z = -Math.PI / 2
    this.positionSpreadRightExtent.position.x = 23.2
    this.positionSpreadRightExtent.position.y = 1.5
    this.positionSpreadRightExtent.scaling.x = 3
    this.positionSpreadRightExtent.scaling.y = 4.5
    this.scene.glowLayer.addIncludedOnlyMesh(this.positionSpreadRightExtent)
    this.positionSpreadRightExtent.setEnabled(false)

    // MessageBusManager.Instance.onRoundComplete.subscribe(this.messageBusManager_onRoundComplete.bind(this));
    // MessageBusManager.Instance.onRoundCancelled.subscribe(this.messageBusManager_onRoundCancelled.bind(this));
    // MessageBusManager.Instance.onPlayerLeave.subscribe(this.messageBusManager_onPlayerLeave.bind(this));

    this.tradingSession.onTradeOpened.subscribe(this.onTradeOpened.bind(this))
    this.tradingSession.onTradeClosed.subscribe(this.onTradeClosed.bind(this))
    this.tradingSession.onTradeCancelled.subscribe(
      this.onTradeCancelled.bind(this)
    )
  }

  // public setPlayer(player : TradingPlayer)
  // {
  //     Logger.log("PositionTrackerElement      | setPlayer: " + player + ":" + player.playerId);

  //     this.player = player;

  //     this.player.gameSession.onTradeOpened.subscribe(this.onTradeOpened.bind(this));
  //     this.player.gameSession.onTradeClosed.subscribe(this.onTradeClosed.bind(this));
  //     this.player.gameSession.onTradeCancelled.subscribe(this.onTradeCancelled.bind(this));
  // }

  onTradeOpened() {
    Logger.log('PositionTrackerElement: onTradeOpened')
    this.playerHasOpenOrder = true

    //this.showPointer(this.session.openTradeDirection,this.session.openTradePrice);
  }

  onTradeClosed() {
    Logger.log('PositionTrackerElement: onTradeClosed')
    this.playerHasOpenOrder = false
    if (this.isShown) {
      this.hidePointer()
      this.isShown = false
    }
    //this.hidePointer();
  }

  onTradeCancelled() {
    this.playerHasOpenOrder = false
    Logger.log('PositionTrackerElement: onTradeCancelled')
    //this.hidePointer();
  }

  // messageBusManager_onRoundComplete(results : GameRoundResults)
  // {
  //     Logger.log('PositionTrackerElement: onRoundComplete');
  //     this.hidePointer();
  // }

  // messageBusManager_onRoundCancelled(results : GameRoundResults)
  // {
  //     Logger.log('PositionTrackerElement: onRoundCancelled');
  //     this.hidePointer();
  // }

  // messageBusManager_onPlayerLeave(playerId: string)
  // {
  //     if (this.player?.playerId === playerId)
  //     {
  //         this.playerHasOpenOrder = false;
  //         this.hidePointer();
  //     }
  // }

  showPointer(direction: TradeDirection, price: currency) {
    Logger.log('PositionTrackerElement: show pointer')

    if (PriceDivisionManager.Instance.currentPriceDivisionSetting) {
      const labelPriceFormatted: currency = currency(price, {
        precision: Math.max(
          PriceDivisionManager.Instance.currentPriceDivisionSetting
            .numDecimalPlaces - 1,
          0
        ),
      })
      let labelPriceString: string = labelPriceFormatted.format()
      labelPriceString = labelPriceString.substring(2, labelPriceString.length)

      // if (this.player)
      // {
      // this.setPlayerImage(this.player.playerImage);
      // this.playerImage.setEnabled(true);
      this.buttonMesh?.setEnabled(true)

      if (direction === TradeDirection.Long) {
        this.leftArrowIcon?.setEnabled(false)
        this.rightArrowIcon?.setEnabled(true)
        //this.playerImage.position.z = 0.8;
      } else {
        this.leftArrowIcon?.setEnabled(true)
        this.rightArrowIcon?.setEnabled(false)
      }

      this.openPriceString = labelPriceString
      //this.openPnLText.setEnabled(true);
      this.openPnLText?.setText('0')
      //this.positionOpenPriceLabel.setEnabled(true);
      //this.positionClosePriceLabel.setEnabled(true);
      this.positionTube?.setEnabled(true)
      this.openPnLText?.setEnabled(true)
      this.positionSpreadTriangle?.setEnabled(true)
      this.closingPriceTube?.setEnabled(true)

      // }

      this.setEnabled(true)
    }
  }

  hidePointer() {
    Logger.log('PositionTrackerElement: hide pointer')
    this.positionOpenPriceLabel?.setEnabled(false)
    // this.playerImage?.setEnabled(false);
    this.positionTube?.setEnabled(false)
    this.openPnLText?.setEnabled(false)
    this.openPnLText?.setText('$0.00')
    this.positionSpreadTriangle?.setEnabled(false)
    this.closingPriceTube?.setEnabled(false)
    this.buttonMesh?.setEnabled(false)
    this.leftArrowIcon?.setEnabled(false)
    this.rightArrowIcon?.setEnabled(false)
    this.openPnLText?.setText('0')
    this.onFormat()
    this.setEnabled(false)
  }

  protected onFormat() {
    if (
      this.positionOpenPriceLabel &&
      this.positionClosePriceLabel &&
      this.positionTube &&
      this.openPnLText &&
      this.positionSpreadTriangle
    ) {
      if (this.scene.sceneType === SceneFormatType.Portrait) {
        this.position = new bjs.Vector3(0, -0.25, -0.25)
        this.rotation.x = Math.PI + Math.PI / 2 - Math.PI / 12

        this.positionOpenPriceLabel.position.y = 5
        this.positionOpenPriceLabel.position.z = 0
        this.positionOpenPriceLabel.rotation.x = Math.PI - Math.PI / 12
        this.positionOpenPriceLabel.rotation.z = Math.PI + Math.PI / 2

        this.positionClosePriceLabel.position.y = 5
        this.positionClosePriceLabel.position.z = 0
        this.positionClosePriceLabel.rotation.x = Math.PI - Math.PI / 12
        this.positionClosePriceLabel.rotation.z = Math.PI + Math.PI / 2

        this.positionTube.scaling = new bjs.Vector3(3.5, 5.2, 5.2)

        this.openPnLText.position.y = 15
        this.openPnLText.rotation.x = Math.PI - Math.PI / 12
        this.openPnLText.rotation.z = Math.PI + Math.PI / 2

        this.positionSpreadTriangle.position.y = 8
        this.positionSpreadTriangle.scaling.y = 10

        this.positionSpreadMaterial.disableLighting = true
      } else {
        this.position = new bjs.Vector3(0, 0, 0)
        this.rotation.x = 0

        this.positionOpenPriceLabel.position.y = 3
        this.positionOpenPriceLabel.position.z = -0.5
        this.positionOpenPriceLabel.rotation.x = 0
        this.positionOpenPriceLabel.rotation.z = 0

        this.positionClosePriceLabel.position.y = 3
        this.positionClosePriceLabel.position.z = 0.5
        this.positionClosePriceLabel.rotation.x = 0
        this.positionClosePriceLabel.rotation.z = 0

        this.positionTube.scaling = new bjs.Vector3(3.5, 3, 3.25)

        this.openPnLText.position.y = 5.5
        this.openPnLText.rotation.x = 0
        this.openPnLText.rotation.z = 0

        this.positionSpreadTriangle.position.y = 4
        this.positionSpreadTriangle.scaling.y = 1.5

        this.positionSpreadMaterial.disableLighting = false
      }
    }
  }

  protected onRender() {
    // if (this.player)
    // {
    //Logger.log('PositionTrackerElement: onRender');
    const tradingSession: LocalTradingSession = this.tradingSession

    if (this.presenter.currentGeneration > 0) {
      if (tradingSession.hasOpenTrade) {
        if (!this.isShown) {
          this.showPointer(
            tradingSession.openTradeDirection,
            tradingSession.openTradePrice
          )
          this.isShown = true
        }

        let openingOrderPositionX: number =
          this.presenter.offsetForPrice(tradingSession.openTradePrice) *
            this.scene.cellWidth +
          this.orderBookRig.position.x
        let closingPricePositionX = 0
        let insideBidPrice, insideAskPrice: currency
        // let closePriceFormatted: currency;
        // let closePriceString: string;

        //this.positionOpenPriceLabel.setText(this.openPriceString);
        this.positionSpreadLeftExtent?.setEnabled(false)
        this.positionSpreadRightExtent?.setEnabled(false)

        openingOrderPositionX = this.checkTrackerOffScreen(
          openingOrderPositionX
        )

        if (tradingSession.openTradeDirection === TradeDirection.Long) {
          insideBidPrice = this.presenter.insideBid?.price as currency
          closingPricePositionX =
            this.presenter.offsetForPrice(insideBidPrice) *
              this.scene.cellWidth +
            this.orderBookRig.position.x
          closingPricePositionX = this.checkTrackerOffScreen(
            closingPricePositionX
          )

          //this.positionPointerLong.position.x = bjs.Scalar.Lerp(this.positionPointerLong.position.x,openingOrderPositionX,0.2);
          if (this.buttonMesh) {
            this.buttonMesh.position.x = openingOrderPositionX

            if (this.closingPriceTube)
              this.closingPriceTube.position.x = bjs.Scalar.Lerp(
                this.closingPriceTube.position.x,
                closingPricePositionX,
                0.2
              )
            //this.positionPointerShort.position.x = bjs.Scalar.Lerp(this.positionPointerShort.position.x,closingPricePositionX,0.2)

            // this.playerImage.position.x = this.buttonMesh.position.x;
            if (this.rightArrowIcon)
              this.rightArrowIcon.position.x = this.buttonMesh.position.x + 1.75
          }
        } else {
          insideAskPrice = this.presenter.insideAsk?.price as currency
          closingPricePositionX =
            this.presenter.offsetForPrice(insideAskPrice) *
              this.scene.cellWidth +
            this.orderBookRig.position.x

          closingPricePositionX = this.checkTrackerOffScreen(
            closingPricePositionX
          )

          if (this.buttonMesh) {
            this.buttonMesh.position.x = openingOrderPositionX
            //this.positionPointerShort.position.x = openingOrderPositionX;
            //this.positionPointerLong.position.x = closingPricePositionX;
            if (this.closingPriceTube)
              this.closingPriceTube.position.x = bjs.Scalar.Lerp(
                this.closingPriceTube.position.x,
                closingPricePositionX,
                0.2
              )

            // this.playerImage.position.x = this.buttonMesh.position.x;
            if (this.leftArrowIcon)
              this.leftArrowIcon.position.x = this.buttonMesh.position.x - 1.75
          }
        }

        if (this.positionTube) {
          this.positionTube.position.x = bjs.Scalar.Lerp(
            this.positionTube.position.x,
            openingOrderPositionX -
              (openingOrderPositionX - closingPricePositionX) / 2,
            0.2
          )
          this.positionTube.scaling.x = bjs.Scalar.Lerp(
            this.positionTube.scaling.x,
            (closingPricePositionX - openingOrderPositionX) * 10,
            0.2
          )
        }

        if (tradingSession.gemPnL > 0) {
          this.positionTubeMaterial.albedoColor = this.positionTubeWinAlbedo
          this.positionTubeMaterial.emissiveColor = this.positionTubeWinEmissive
          this.positionSpreadMaterial.albedoColor = this.positionTubeWinAlbedo
          this.positionSpreadMaterial.emissiveColor =
            this.positionTubeWinEmissive
        } else {
          this.positionTubeMaterial.albedoColor = this.positionTubeLossAlbedo
          this.positionTubeMaterial.emissiveColor =
            this.positionTubeLossEmissive
          this.positionSpreadMaterial.albedoColor = this.positionTubeLossAlbedo
          this.positionSpreadMaterial.emissiveColor =
            this.positionTubeLossEmissive
        }

        this.positionTubeMaterial.emissiveIntensity = Math.max(
          0,
          Math.abs(tradingSession.openPnL.value) / this.maxIntensityValue -
            Math.random() * 0.1
        )
        this.positionSpreadMaterial.emissiveIntensity =
          this.positionTubeMaterial.emissiveIntensity

        if (tradingSession.gemPnL !== 0) {
          if (!this.isShown) {
            this.showPointer(
              tradingSession.openTradeDirection,
              tradingSession.openTradePrice
            )
            this.isShown = true
          }

          // if (this.player.playerType == GamePlayerType.Local)
          // {
          const gemPnL: number = tradingSession.gemPnL
          if (gemPnL > 0) {
            this.openPnLText?.setEnabled(true)
            this.positionTube?.setEnabled(true)
            this.positionSpreadTriangle?.setEnabled(true)
            this.closingPriceTube?.setEnabled(true)
            this.openPnLText?.setColor(GLSGColor.Green)
          } else if (gemPnL < 0) {
            this.openPnLText?.setEnabled(true)
            this.positionTube?.setEnabled(true)
            this.positionSpreadTriangle?.setEnabled(true)
            this.closingPriceTube?.setEnabled(true)
            this.openPnLText?.setColor(GLSGColor.Red)
          } else {
            this.openPnLText?.setEnabled(false)
            this.positionTube?.setEnabled(false)
            this.positionSpreadTriangle?.setEnabled(false)
            this.closingPriceTube?.setEnabled(false)
          }

          // }

          if (this.openPnLText && this.positionTube) {
            //this.openPnLText.setText("$"+(openPnlValue).toFixed(2));
            this.openPnLText.setText(tradingSession.gemPnL.toFixed(0))
            this.openPnLText.position.x = bjs.Scalar.Lerp(
              this.openPnLText.position.x,
              this.positionTube.position.x,
              0.1
            )
          }
        } else {
          this.openPnLText?.setEnabled(false)
        }

        if (this.positionSpreadTriangle && this.positionTube) {
          this.positionSpreadTriangle.position.x = this.positionTube.position.x
          this.positionSpreadTriangle.scaling.x =
            this.positionTube.scaling.x / 10
        }
      } else {
        if (this.isShown) {
          this.hidePointer()
          this.isShown = false
        }
      }
    }
    // }
  }

  private checkTrackerOffScreen(positionX: number) {
    if (positionX < -30) {
      positionX = -30
      this.positionSpreadLeftExtent?.setEnabled(true)
    } else if (positionX > 30) {
      positionX = 30
      this.positionSpreadRightExtent?.setEnabled(true)
    }

    return positionX
  }

  // private setPlayerImage(playerImage : string | null)
  // {
  //     this.playerImageMaterial = new bjs.StandardMaterial("Player Image", this.scene.bjsScene);
  //     this.playerImageMaterial.diffuseTexture = new bjs.Texture(playerImage ? `${process.env.IMAGE_CORS_IGNORE_URL}${playerImage}` : 'https://glsgassets.s3.amazonaws.com/default_avatar.jpeg', this.scene.bjsScene);

  //     this.playerImageMaterial.emissiveColor = bjs.Color3.White();
  //     this.playerImageMaterial.opacityTexture = new bjs.Texture("https://bionictraderassets.s3.amazonaws.com/images/AvatarOpacity.png",this.scene.bjsScene);
  //     this.playerImageMaterial.backFaceCulling = false;//Allways show the front and the back of an element
  //     this.playerImageMaterial.disableLighting = true;
  //     this.playerImage.material = this.playerImageMaterial;
  // }
}
