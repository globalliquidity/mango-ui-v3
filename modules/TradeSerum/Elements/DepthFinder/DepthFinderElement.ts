import * as bjs from '@babylonjs/core/Legacy/legacy'
import '@babylonjs/loaders/glTF'
import { AssetManager } from '@/modules/SceneGraph/AssetManager'
import {
  AudioEvent,
  SceneFormatType,
  VectorFieldLayerType,
} from '@/modules/SceneGraph/Enums'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { SceneManager } from '@/modules/SceneGraph/SceneManager'
import Logger from '@/modules/SceneGraph/Logger'
import { DepthFinderLayerPlotter } from './DepthFinderLayerPlotter'
import { DepthFinderPresenter } from './DepthFinderPresenter'
import { DepthFinderRow } from './DepthFinderRow'
import { GridFloor } from './GridFloor'
import { OrderBookFloorVectorField } from './OrderBookFloorVectorField'
import { OrderBookHistogram } from './OrderBookHistogram'
import { OrderBookVectorField } from './OrderBookVectorField'
import { LocalTradingSession } from '../LocalTradingSession'
import { HeadsUpDisplayElement } from '../HeadsUpDisplayElement'
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
import { PositionTrackerElement } from '../SceneUI/PositionTrackerElement'
import { SoundPlayer, TradeSounds } from '@/modules/TradeSerum/SoundPlayer'
import { MarketDataUpdate } from '@/modules/TradeSerum/Market/MarketDataClient'
import { AudioSequencer } from '@/modules/SceneGraph/Audio/AudioSequencer'
// import { MessageBusManager } from '../../MessageBusManager';
// import { GameplaySlot } from '../GameplaySlot';
import { VolatilityDrone } from '@/modules/SceneGraph/Audio/VolatilityDrone'
import { EventBus } from '@/modules/SceneGraph/EventBus'
import currency from 'currency.js'
import { OrderTrackerElement } from './OrderTrackerElement'
import { SettingsManager } from '../../SettingsManager'

export class DepthFinderElement extends SceneElement {
  public orderBookRig: bjs.TransformNode | undefined
  public histogram: OrderBookHistogram | undefined
  public orderBookFloor: OrderBookFloorVectorField | undefined
  public orderBook: OrderBookVectorField | undefined
  public tradeReportPlotter: DepthFinderLayerPlotter | undefined
  public gridFloor: GridFloor | undefined

  hud: HeadsUpDisplayElement | undefined

  private localPositionTracker: PositionTrackerElement | undefined
  private orderTrackerElement: OrderTrackerElement | undefined

  // public positionTrackerElements? : bjs.TransformNode;
  // private positionTrackers : Array<PositionTrackerElement> = new Array<PositionTrackerElement>();

  public rowDepthMultiplier = 0
  private simpleCube: bjs.Mesh | undefined

  private histogramHeightLevels = 20

  public frameSinceAddedNewRow = 0
  public isAddedNewRow = false

  private isShowing = false
  private isHiding = false

  private startingScale: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  private finalScale: bjs.Vector3 = new bjs.Vector3(0.9, 0.9, 0.9)

  private marketMoveSoundVolume = -18

  volatilityDrone?: VolatilityDrone

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public rowCount: number,
    public columnCount: number,
    public cellWidth: number,
    public cellHeight: number,
    public cellDepth: number,
    public presenter: DepthFinderPresenter,
    public tradingSession: LocalTradingSession,
    public glowLayer: bjs.GlowLayer
  ) {
    super(name, x, y, z, scene)

    Logger.log('DepthFinderElement :  constructor()')
    Logger.log(
      'DepthFinderElement :  creating DepthFinderElement with ' +
        this.rowCount +
        ' rows, and ' +
        this.columnCount +
        ' columns.'
    )
    Logger.log('DepthFinderElement :  constructor() - calling this.create()')

    // Logger.log('DepthFinderElement : Got Local Game Session For : ' + tradingSession.player.playerId);

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      // true for mobile device
      this.finalScale = new bjs.Vector3(1, 1, 1)
    } else {
      // false for not mobile device
      this.finalScale = new bjs.Vector3(0.9, 0.9, 0.9)
    }

    EventBus.Instance.eventHandler.subscribe((p, r) => {
      if (r === 'LOCAL_MIC_ACTIVE') {
        this.volatilityDrone?.pause()
      } else if (r === 'LOCAL_MIC_MUTED') {
        this.volatilityDrone?.resume()
      }
    })

    this.create()
  }

  public create() {
    Logger.log('OrderBookVisualizer : create()')

    this.orderBookRig = new bjs.TransformNode(
      'Order Book Rig',
      this.scene.bjsScene
    )
    this.orderBookRig.parent = this
    const floorParticleShape = bjs.MeshBuilder.CreateBox(
      'box',
      { height: 1, width: 1, depth: 1 },
      this.scene.bjsScene
    )
    //let floorParticleShape = AssetManager.Instance(this.scene.title).getMeshClone("simplecube");
    this.simpleCube = AssetManager.Instance(this.scene.title).getMeshClone(
      'simplecube'
    )

    if (this.simpleCube) {
      this.orderBookFloor = new OrderBookFloorVectorField(
        'Order Book Floor Vector Field',
        0,
        0,
        0,
        this.scene,
        floorParticleShape,
        this.rowCount,
        4,
        1,
        this.cellWidth,
        this.cellHeight,
        this.cellDepth,
        0,
        this.presenter,
        this.orderBookRig,
        this.columnCount
      )

      this.addChild(this.orderBookFloor)
      this.orderBookFloor.parent = this.orderBookRig
      this.orderBookFloor.position.z = 1.5
      this.orderBookFloor.position.y = -0.25
    }

    //floorParticleShape.setEnabled(false);
    //floorParticleShape.scaling.y = 10;

    if (this.simpleCube) {
      this.histogram = new OrderBookHistogram(
        'Order Book Histogram',
        0,
        0,
        0,
        this.scene,
        this.columnCount,
        this.histogramHeightLevels,
        this.cellWidth,
        this.cellHeight,
        this.cellDepth,
        0.95,
        this.presenter,
        this.orderBookRig
      )

      this.addChild(this.histogram)
      this.histogram.parent = this.orderBookRig

      this.orderBook = new OrderBookVectorField(
        'Order Book Vector Field',
        0,
        0,
        0,
        this.scene,
        this.simpleCube,
        this.rowCount,
        this.columnCount,
        1,
        this.cellWidth,
        this.cellHeight,
        this.cellDepth,
        0.99,
        this.presenter,
        this.orderBookRig
      )

      this.addChild(this.orderBook)
      this.orderBook.parent = this.orderBookRig
    }

    this.simpleCube?.setEnabled(false)

    const tradeReportParticleShape = bjs.MeshBuilder.CreateBox(
      'box',
      { height: 1, width: 1, depth: 1 },
      this.scene.bjsScene
    )

    this.tradeReportPlotter = new DepthFinderLayerPlotter(
      'Trade Report Plotter',
      -0.5,
      0,
      0,
      this.scene,
      tradeReportParticleShape,
      this.rowCount / 2,
      this.columnCount,
      this.cellWidth,
      this.cellHeight,
      this.cellDepth,
      0.95,
      this.presenter,
      this.orderBookRig,
      VectorFieldLayerType.TradeReport
    )

    this.addChild(this.tradeReportPlotter)
    this.tradeReportPlotter.parent = this.orderBookRig
    this.tradeReportPlotter.sps.mesh.position.x = 0.5

    tradeReportParticleShape.dispose()
    tradeReportParticleShape.setEnabled(false)

    this.presenter.onAddedNewRow.subscribe(() => {
      if (this.presenter.currentGeneration > 1) {
        const previousRow: DepthFinderRow = this.presenter.getRow(
          1
        ) as DepthFinderRow
        const currentRow: DepthFinderRow =
          this.presenter.getCurrentRow() as DepthFinderRow

        const previousMidPrice: currency = previousRow.midPrice
        const currentMidPrice: currency = currentRow.midPrice

        const midPriceChange: currency =
          currentMidPrice.subtract(previousMidPrice)

        //Logger.log("DepthFinderElement      |   MidPriceChange: " + midPriceChange.format());

        if (midPriceChange.value >= 2) {
          if (midPriceChange.value < 10)
            SoundPlayer.Instance.playSound(
              TradeSounds.MARKET_MOVES_UP_ONE,
              this.marketMoveSoundVolume
            )
          else
            SoundPlayer.Instance.playSound(
              TradeSounds.MARKET_MOVES_UP_TEN,
              this.marketMoveSoundVolume
            )
        } else if (midPriceChange.value <= -2) {
          if (midPriceChange.value < -10)
            SoundPlayer.Instance.playSound(
              TradeSounds.MARKET_MOVES_DOWN_TEN,
              this.marketMoveSoundVolume
            )
          else
            SoundPlayer.Instance.playSound(
              TradeSounds.MARKET_MOVES_DOWN_ONE,
              this.marketMoveSoundVolume
            )
        }
      }

      this.rowDepthMultiplier = 0
      this.isAddedNewRow = true

      if (this.histogram) {
        this.histogram.isAddedNewRow = true
        this.histogram.rowDepthMultiplier = 0
      }

      if (this.orderBook) {
        this.orderBook.rowDepthMultiplier = 0
      }

      if (this.orderBookFloor) {
        this.orderBookFloor.rowDepthMultiplier = 0
      }

      if (this.tradeReportPlotter) {
        this.tradeReportPlotter.sps.mesh.position.x = 0.5
        this.tradeReportPlotter.position.z += this.cellDepth
        this.tradeReportPlotter.rowDepthMultiplier = 0
      }

      if (this.orderBookRig) this.orderBookRig.position.z = 0
    })

    this.gridFloor = new GridFloor(
      'Grid Floor',
      0,
      -0.1,
      0,
      this.scene,
      this.presenter,
      this.rowCount,
      this.columnCount,
      this.cellWidth,
      this.cellHeight,
      this.cellDepth,
      this.orderBookRig
    )

    this.addChild(this.gridFloor)
    super.create()

    this.hud = new HeadsUpDisplayElement(
      'HUD',
      0,
      0,
      0,
      this.scene,
      this.tradingSession,
      this.orderBookRig
    )
    this.addChild(this.hud)

    this.orderTrackerElement = new OrderTrackerElement(
      'Order Tracker',
      0,
      0,
      0,
      this.scene,
      this.orderBookRig,
      bjs.Color3.Blue()
    )
    this.addChild(this.orderTrackerElement)
    this.scaling = new bjs.Vector3(0, 0, 0)
  }

  public Show() {
    this.isShowing = true
    this.isHiding = false
    this.volatilityDrone?.start()
    this.volatilityDrone?.resume()
  }

  public Hide() {
    this.isHiding = true
    this.isShowing = false
    this.volatilityDrone?.stop()
  }

  public resetOrderTracker() {
    this.orderTrackerElement?.hidePointer()
  }

  public reset() {
    this.scaling = this.startingScale
    this.isHiding = false
    this.isShowing = true

    if (this.hud) {
      this.hud.reset()
    }

    if (this.orderBookRig) {
      this.orderBookRig.position.x = 0
      this.orderBookRig.position.z = 0
    }

    if (this.gridFloor) {
      this.gridFloor.gridOffsetX = 0
      this.gridFloor.gridOffsetZ = 0
      // this.gridFloor.reset();
    }

    if (this.histogram) {
      this.histogram.rowDepthMultiplier = 0
      this.histogram.reset()
    }

    if (this.orderBook) {
      this.orderBook.rowDepthMultiplier = 0
      this.orderBook.reset()
    }

    if (this.orderBookFloor) {
      this.orderBookFloor.rowDepthMultiplier = 0
      this.orderBookFloor.reset()
    }

    if (this.tradeReportPlotter) {
      this.tradeReportPlotter.rowDepthMultiplier = 0
      this.tradeReportPlotter.position.z = 0
      this.tradeReportPlotter.reset()
    }

    this.resetOrderTracker()

    this.setEnabled(false)
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      this.position.y = 10
      this.rotation = new bjs.Vector3(Math.PI, 0, -Math.PI / 2)
    } else {
      this.position.y = 1.8
      this.rotation = new bjs.Vector3(0, 0, 0)
    }
  }

  protected onDisposing() {}

  protected onPreRender() {
    if (this.isShowing) {
      this.setEnabled(true)
      this.scaling = bjs.Vector3.Lerp(this.scaling, this.finalScale, 0.01)

      if (this.finalScale.x - this.scaling.x < 0.01) {
        this.scaling = this.finalScale
        this.isShowing = false
      }
    } else if (this.isHiding) {
      this.scaling = this.startingScale
      this.isHiding = false
      this.setEnabled(false)
    }

    if (this.presenter.isReady) {
      const currentRow: DepthFinderRow = this.presenter
        .rows[0] as DepthFinderRow

      if (currentRow) {
        let animationStep = 0

        if (!SettingsManager.Instance.useSteppedMotion)
          animationStep =
            0.001 *
            SceneManager.Instance.engine.getDeltaTime() *
            (1000 / this.scene.samplingInterval) // * this.scene.bjsScene.getAnimationRatio();
        //let animationStep: number = (SceneManager.Instance.engine.getDeltaTime()/1000) * (this.samplingInterval/1000);
        this.rowDepthMultiplier += animationStep // * this.cellDepth;

        if (this.orderBookRig) {
          this.orderBookRig.position.x = bjs.Scalar.Lerp(
            this.orderBookRig.position.x,
            -currentRow.positionOffsetX * this.cellWidth,
            0.1
          )
          //this.orderBookRig.position.x = bjs.Scalar.MoveTowards(this.orderBookRig.position.x, -currentRow.positionOffsetX * this.cellWidth, 0.9);
          //this.orderBookRig.position.x = -currentRow.positionOffsetX * this.cellWidth;
          this.orderBookRig.position.z += animationStep * this.cellDepth

          if (this.gridFloor) {
            this.gridFloor.gridOffsetX =
              -(this.presenter.gridOriginOffsetX * this.cellWidth) +
              this.orderBookRig.position.x
            this.gridFloor.gridOffsetZ += animationStep * this.cellDepth // * 0.33333;
          }
        }

        if (this.histogram) {
          this.histogram.rowDepthMultiplier = this.rowDepthMultiplier
        }

        if (this.orderBook)
          this.orderBook.rowDepthMultiplier = this.rowDepthMultiplier

        if (this.orderBookFloor)
          this.orderBookFloor.rowDepthMultiplier = this.rowDepthMultiplier

        if (this.tradeReportPlotter) {
          this.tradeReportPlotter.rowDepthMultiplier = this.rowDepthMultiplier
        }
      }

      if (this.isAddedNewRow) {
        this.isAddedNewRow = false

        const marketDataUpdate: MarketDataUpdate | undefined =
          this.presenter.currentMarketDataUpdate
        let numUpTrades = 0
        let numDownTrades = 0

        if (marketDataUpdate !== undefined) {
          const midPrice: number = marketDataUpdate.midPrice.value

          marketDataUpdate.trades.forEach((trade) => {
            if (trade.price.value > midPrice) {
              numUpTrades++
            } else {
              numDownTrades++
            }
          })

          if (numUpTrades > 0) {
            AudioSequencer.Instance.playSequence(
              AudioEvent.TRADES_THROUGH_UP,
              numUpTrades
            )
          }

          if (numDownTrades > 0) {
            AudioSequencer.Instance.playSequence(
              AudioEvent.TRADES_THROUGH_DOWN,
              numDownTrades
            )
          }
        }
      }
    }
  }
}
