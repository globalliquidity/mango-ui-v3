import { DepthFinderPresenter } from './DepthFinderPresenter'
import * as bjs from '@babylonjs/core/Legacy/legacy'
import currency from 'currency.js'
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
import {
  SerumDexUIAdapter,
  SmartOrderEvent,
  SmartOrderEventType,
} from '../../SerumDexUIAdapter'
import { SmartOrder } from '@/machine/SmartOrderMachine'
import { SoundPlayer, TradeSounds } from '../../SoundPlayer'
import { PriceDivisionManager } from '../../PriceDivision/PriceDivisionManager'

export class OrderTrackerElement extends SceneElement {
  presenter: DepthFinderPresenter

  positionLongAlbedo: bjs.Color3 = bjs.Color3.FromInts(30, 52, 164)
  positionNoneEmissive: bjs.Color3 = bjs.Color3.FromInts(0, 0, 0)
  positionLongEmissive: bjs.Color3 = bjs.Color3.FromInts(0, 22, 46)
  positionShortAlbedo: bjs.Color3 = bjs.Color3.FromInts(184, 4, 220)
  positionShortEmissive: bjs.Color3 = bjs.Color3.FromInts(21, 0, 46)
  currentTrade: Trade | undefined

  orderLongAlbedo: bjs.Color3 = bjs.Color3.FromInts(0, 112, 0)
  orderShortAlbedo: bjs.Color3 = bjs.Color3.FromInts(112, 0, 0)

  orderCreatedEmissive: bjs.Color3 = bjs.Color3.FromInts(0, 0, 0)
  orderCancelRequestedEmissive: bjs.Color3 = bjs.Color3.FromInts(129, 77, 4)

  orderPlacedLongEmissive: bjs.Color3 = bjs.Color3.FromInts(0, 20, 0)
  orderConfirmedLongEmissive: bjs.Color3 = bjs.Color3.FromInts(0, 96, 0)

  orderPlacedShortEmissive: bjs.Color3 = bjs.Color3.FromInts(20, 0, 0)
  orderConfirmedShortEmissive: bjs.Color3 = bjs.Color3.FromInts(96, 0, 0)

  orderPriceText?: TextMeshString
  openPriceString = '000'

  orderActionText?: TextMeshString
  orderActionString = 'NONE'

  playerHasOpenOrder = false
  currentOrder: SmartOrder | undefined = undefined
  currentOrderPrice: number | undefined = undefined

  isShown = false

  orderMarkerFrameModel?: bjs.Mesh

  leftArrowIcon?: bjs.Mesh
  leftArrowIconMaterial?: bjs.PBRMaterial
  leftArrowEmmisiveColor: bjs.Color3 = bjs.Color3.FromInts(77, 0, 112) //bjs.Color3.FromInts(77,0,112);
  rightArrowEmmisiveColor: bjs.Color3 = bjs.Color3.FromInts(0, 46, 153) //bjs.Color3.FromInts(0,34,112);

  rightArrowIcon?: bjs.Mesh
  rightArrowIconMaterial?: bjs.PBRMaterial

  downArrowIcon?: bjs.Mesh

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
    public color: bjs.Color3
  ) {
    super(name, x, y, z, scene)
    this.presenter = this.scene.depthFinderPresenter as DepthFinderPresenter
    this.create()
  }

  protected onCreate() {
    this.orderMarkerFrameModel = AssetManager.Instance(
      this.scene.title
    ).getMeshClone('orderMarkerFrame') as bjs.Mesh
    const orderMarkerFrameMesh: bjs.Mesh =
      this.orderMarkerFrameModel.getChildren()[0] as bjs.Mesh
    this.scene.glowLayer.addIncludedOnlyMesh(orderMarkerFrameMesh as bjs.Mesh)
    this.orderMarkerFrameModel.parent = this
    this.orderMarkerFrameModel.position.y = 3.5
    this.orderMarkerFrameModel.position.z = -0.2
    this.orderMarkerFrameModel.scaling = new bjs.Vector3(0.0275, 0.02, 0.02)
    this.orderMarkerFrameModel.setEnabled(false)

    this.leftArrowIcon = AssetManager.Instance(this.scene.title).getMeshClone(
      'Arrow'
    ) as bjs.Mesh
    this.leftArrowIcon.name = 'Left Arrow Icon'
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
    this.leftArrowIcon.position.y = 2
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
    this.rightArrowIcon.position.y = 2
    this.rightArrowIcon.rotation = new bjs.Vector3(0, 0, 0)
    this.rightArrowIcon.scaling = new bjs.Vector3(0.1, 0.1, 0.1)
    this.scene.glowLayer.addIncludedOnlyMesh(
      this.rightArrowIcon.getChildren()[0] as bjs.Mesh
    )
    this.rightArrowIcon.setEnabled(false)

    this.downArrowIcon = AssetManager.Instance(this.scene.title).getMeshClone(
      'Arrow'
    ) as bjs.Mesh
    this.downArrowIcon.name = 'Down Arrow Icon'
    this.downArrowIcon.parent = this
    ;(this.downArrowIcon.getChildren()[0] as bjs.Mesh).material =
      orderMarkerFrameMesh.material
    //(this.rightArrowIcon.getChildren()[0] as bjs.Mesh).hasVertexAlpha = true;
    this.downArrowIcon.position.y = 0.8
    this.downArrowIcon.position.z = -0.2
    this.downArrowIcon.rotation = new bjs.Vector3(0, 0, 0)
    this.downArrowIcon.rotation.z = -Math.PI / 2
    this.downArrowIcon.scaling = new bjs.Vector3(0.125, 0.125, 0.125)
    //this.scene.glowLayer.addIncludedOnlyMesh(this.rightArrowIcon.getChildren()[0] as bjs.Mesh);
    this.downArrowIcon.setEnabled(false)

    this.orderPriceText = new TextMeshString(
      'Order Price',
      0,
      3,
      0,
      this.scene,
      '0',
      1.5,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.orderPriceText.parent = this
    this.orderPriceText.setColor(GLSGColor.SkyBlue)
    this.orderPriceText.setEnabled(false)

    this.orderActionText = new TextMeshString(
      'Order Action',
      0,
      4.5,
      0,
      this.scene,
      '0',
      1.5,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.orderActionText.parent = this
    this.orderActionText.setColor(GLSGColor.SkyBlue)
    this.orderActionText.setEnabled(false)

    SerumDexUIAdapter.Instance.onSmartOrderEvent.subscribe(
      this.onSmartOrderEvent.bind(this)
    )
    SerumDexUIAdapter.Instance.onWalletDisconnected.subscribe(
      this.onWalletDisconnected.bind(this)
    )
    SerumDexUIAdapter.Instance.onOrderMessageChanged.subscribe(
      this.onOrderMessageChanged.bind(this)
    )
  }

  onWalletDisconnected() {
    this.hidePointer()
  }

  private onOrderMessageChanged(orderMessage: string) {
    Logger.log('OrderTracker : onOrderMessageChanged : ' + orderMessage)
    if (orderMessage !== undefined) {
      if (orderMessage.startsWith('BUY')) {
        this.orderPriceText?.setColor(GLSGColor.Green)
        this.orderActionText?.setColor(GLSGColor.Green)
      } else if (orderMessage.startsWith('BID')) {
        this.orderPriceText?.setColor(GLSGColor.DarkGreen)
        this.orderActionText?.setColor(GLSGColor.DarkGreen)
      } else if (orderMessage.startsWith('SELL')) {
        this.orderPriceText?.setColor(GLSGColor.Red)
        this.orderActionText?.setColor(GLSGColor.Red)
      } else if (orderMessage.startsWith('OFFER')) {
        this.orderPriceText?.setColor(GLSGColor.DarkRed)
        this.orderActionText?.setColor(GLSGColor.DarkRed)
      } else {
        this.orderPriceText?.setColor(GLSGColor.Blue)
        this.orderActionText?.setColor(GLSGColor.Blue)
      }

      const orderActionWords: string[] = orderMessage.split(' ')

      const orderActionString =
        orderActionWords[0] +
        ' ' +
        orderActionWords[1] +
        ' ' +
        orderActionWords[2]

      this.orderActionText?.setText(orderActionString)
    }
  }

  onSmartOrderEvent(orderEvent: SmartOrderEvent) {
    const smartOrder: SmartOrder = orderEvent.order

    const orderMarkerFrameMesh: bjs.Mesh =
      this.orderMarkerFrameModel?.getChildren()[0] as bjs.Mesh
    const orderMarkerMaterial: bjs.PBRMaterial =
      orderMarkerFrameMesh.material as bjs.PBRMaterial

    switch (orderEvent.orderEventType) {
      case SmartOrderEventType.RESET:
        this.currentOrder = undefined
        this.hidePointer()
        break
      case SmartOrderEventType.ORDER_CREATED:
        this.currentOrder = smartOrder
        this.currentOrderPrice = this.currentOrder.price
        SoundPlayer.Instance.stopSound(TradeSounds.PROGRESS_LOOP)
        SoundPlayer.Instance.playSound(TradeSounds.MARKET_MOVES_UP_ONE, -18)

        orderMarkerMaterial.emissiveColor = this.orderCreatedEmissive

        if (this.currentOrder.side === 'buy')
          orderMarkerMaterial.albedoColor = this.orderLongAlbedo
        else orderMarkerMaterial.albedoColor = this.orderShortAlbedo

        this.playerHasOpenOrder = true
        break
      case SmartOrderEventType.ORDER_PRICE_TARGET_SET:
        if (this.currentOrderPrice) {
          this.currentOrderPrice = smartOrder.price
        } else {
          this.currentOrder = smartOrder
          this.currentOrderPrice = smartOrder.price
        }
        break
      case SmartOrderEventType.ORDER_PLACED:
        this.currentOrderPrice = this.currentOrder?.price

        SoundPlayer.Instance.playSound(TradeSounds.ORDER_PLACED, -15)
        SoundPlayer.Instance.playSound(
          TradeSounds.ORDER_PLACED_PROGRESS,
          -18,
          true
        )

        if (this.currentOrder?.side === 'buy')
          orderMarkerMaterial.emissiveColor = this.orderPlacedLongEmissive
        else orderMarkerMaterial.emissiveColor = this.orderPlacedShortEmissive

        this.scene.showStatusMessage('ORDER IS PLACED')

        break
      case SmartOrderEventType.ORDER_CONFIRMED:
        SoundPlayer.Instance.playSound(TradeSounds.ORDER_CONFIRMED, -6)
        SoundPlayer.Instance.stopSound(TradeSounds.ORDER_PLACED_PROGRESS)

        if (this.currentOrder?.side === 'buy')
          orderMarkerMaterial.emissiveColor = this.orderConfirmedLongEmissive
        else
          orderMarkerMaterial.emissiveColor = this.orderConfirmedShortEmissive

        this.scene.showStatusMessage('ORDER IS CONFIRMED')

        break
      case SmartOrderEventType.ORDER_CANCEL_REQUESTED:
        SoundPlayer.Instance.playSound(TradeSounds.ORDER_CANCEL_REQUESTED, -12)
        SoundPlayer.Instance.playSound(TradeSounds.PROGRESS_LOOP, -18, true)
        orderMarkerMaterial.emissiveColor = this.orderCancelRequestedEmissive
        this.scene.showStatusMessage('CANCELLING ORDER')

        break
      case SmartOrderEventType.ORDER_CANCELLED:
        SoundPlayer.Instance.stopSound(TradeSounds.PROGRESS_LOOP)
        SoundPlayer.Instance.playSound(TradeSounds.PLAYER_FORFEITS_GEM, -12)
        orderMarkerMaterial.emissiveColor = this.orderCreatedEmissive
        this.scene.showStatusMessage('ORDER IS CANCELLED')
        break
      case SmartOrderEventType.ORDER_PARTIALLY_FILLED:
        SoundPlayer.Instance.playSound(TradeSounds.TRADE_WIN_SMALL, -12)
        SoundPlayer.Instance.stopSound(TradeSounds.PROGRESS_LOOP)
        this.scene.showStatusMessage('ORDER IS FILLED')
        break
      case SmartOrderEventType.ORDER_COMPLETELY_FILLED:
        SoundPlayer.Instance.playSound(TradeSounds.TRADE_WIN, -12)
        SoundPlayer.Instance.stopSound(TradeSounds.ORDER_PLACED_PROGRESS)
        SoundPlayer.Instance.stopSound(TradeSounds.PROGRESS_LOOP)

        break
      case SmartOrderEventType.ORDER_REJECTED:
        SoundPlayer.Instance.stopSound(TradeSounds.ORDER_PLACED_PROGRESS)
        SoundPlayer.Instance.playSound(TradeSounds.TRADE_LOSS_SMALL, -12)
        orderMarkerMaterial.emissiveColor = this.orderCreatedEmissive
        this.scene.showStatusMessage('ORDER WAS REJECTED')
        break
    }
  }

  showPointer(direction: TradeDirection, price: currency) {
    Logger.log('OrderTrackerElement: show pointer at price: ' + price.format())

    const priceDivisionManager: PriceDivisionManager =
      PriceDivisionManager.Instance

    if (priceDivisionManager.currentPriceDivisionSetting) {
      const labelPriceFormatted: currency = currency(price, {
        precision: Math.max(
          priceDivisionManager.currentPriceDivisionSetting.numDecimalPlaces - 1,
          0
        ),
      })
      const labelPriceString: string = labelPriceFormatted.format()
      this.orderMarkerFrameModel?.setEnabled(true)
      this.downArrowIcon?.setEnabled(true)

      if (direction === TradeDirection.Long) {
        this.leftArrowIcon?.setEnabled(false)
      } else {
        this.rightArrowIcon?.setEnabled(false)
      }

      this.openPriceString = labelPriceString
      this.orderPriceText?.setText(labelPriceString)
      this.orderPriceText?.setEnabled(true)
      this.orderActionText?.setEnabled(true)

      this.playerHasOpenOrder = true

      this.setEnabled(true)
    }
  }

  hidePointer() {
    Logger.log('PositionTrackerElement: hide pointer')
    this.orderPriceText?.setEnabled(false)
    this.orderPriceText?.setText('$0.00')
    this.orderMarkerFrameModel?.setEnabled(false)
    this.leftArrowIcon?.setEnabled(false)
    this.rightArrowIcon?.setEnabled(false)
    this.orderPriceText?.setText('0')
    this.downArrowIcon?.setEnabled(false)
    this.playerHasOpenOrder = false
    this.onFormat()
    this.setEnabled(false)
  }

  protected onFormat() {
    if (this.orderPriceText && this.orderActionText) {
      if (this.scene.sceneType === SceneFormatType.Portrait) {
        this.position = new bjs.Vector3(0, -0.25, -0.25)
        this.rotation.x = Math.PI + Math.PI / 2 - Math.PI / 12

        this.orderPriceText.position.y = 15
        this.orderPriceText.rotation.x = Math.PI - Math.PI / 12
        this.orderPriceText.rotation.z = Math.PI + Math.PI / 2

        this.orderActionText.position.y = 17
        this.orderActionText.rotation.x = Math.PI - Math.PI / 12
        this.orderActionText.rotation.z = Math.PI + Math.PI / 2
      } else {
        this.position = new bjs.Vector3(0, 0, 0)
        this.rotation.x = 0

        this.orderPriceText.position.y = 2.5
        this.orderPriceText.rotation.x = 0
        this.orderPriceText.rotation.z = 0

        this.orderActionText.position.y = 3.75
        this.orderActionText.rotation.x = 0
        this.orderActionText.rotation.z = 0
      }
    }
  }

  protected onRender() {
    if (this.presenter.currentGeneration > 0) {
      if (this.playerHasOpenOrder) {
        if (!this.isShown) {
          this.showPointer(
            this.currentOrder?.side === 'buy'
              ? TradeDirection.Long
              : TradeDirection.Short,
            currency(this.currentOrder?.price as number)
          )
          this.isShown = true
        }

        let orderPositionX: number =
          this.presenter.offsetForPrice(
            currency(this.currentOrderPrice as number)
          ) *
            this.scene.cellWidth +
          this.orderBookRig.position.x
        orderPositionX = this.checkTrackerOffScreen(orderPositionX)

        if (this.currentOrderPrice)
          this.orderPriceText?.setText(this.currentOrderPrice.toFixed(3))

        if (this.currentOrder?.side === 'buy') {
          //this.positionPointerLong.position.x = bjs.Scalar.Lerp(this.positionPointerLong.position.x,openingOrderPositionX,0.2);
          if (this.orderMarkerFrameModel) {
            // this.position.x = orderPositionX;
            this.position.x = bjs.Scalar.Lerp(
              this.position.x,
              orderPositionX,
              0.2
            )

            //this.buttonMesh.scaling.x = 0.02;

            // this.playerImage.position.x = this.buttonMesh.position.x;
            if (this.rightArrowIcon) this.rightArrowIcon.position.x = 7
          }
        } else {
          // insideAskPrice = (this.presenter.insideAsk?.price as currency);
          // closingPricePositionX = ( this.presenter.offsetForPrice(insideAskPrice) * this.scene.cellWidth) + this.orderBookRig.position.x;

          // closingPricePositionX = this.checkTrackerOffScreen(closingPricePositionX);

          if (this.orderMarkerFrameModel) {
            // this.position.x = orderPositionX;
            this.position.x = bjs.Scalar.Lerp(
              this.position.x,
              orderPositionX,
              0.2
            )

            //this.buttonMesh.scaling.x = 0.03;
            if (this.leftArrowIcon) this.leftArrowIcon.position.x = -7
          }
        }

        /*
                    
                    if (tradingSession.gemPnL !== 0)
                    {
                        if (!this.isShown)
                        {
                            this.showPointer(tradingSession.openTradeDirection,tradingSession.openTradePrice);
                            this.isShown = true;
                        }
                      
                        // if (this.player.playerType == GamePlayerType.Local)
                        // {
                        let gemPnL : number = tradingSession.gemPnL
                        if (gemPnL > 0)
                        {
                            this.openPnLText?.setEnabled(true);
                            this.openPnLText?.setColor(GLSGColor.Green);
                        }    
                        else if (gemPnL < 0)
                        {
                            this.openPnLText?.setEnabled(true);
                            this.openPnLText?.setColor(GLSGColor.Red);
                        }
                        else
                        {
                            this.openPnLText?.setEnabled(false);
                        }

                    }
                    else
                    {
                       this.openPnLText?.setEnabled(false);
                    }
                    */
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
    } else if (positionX > 30) {
      positionX = 30
    }

    return positionX
  }
}
