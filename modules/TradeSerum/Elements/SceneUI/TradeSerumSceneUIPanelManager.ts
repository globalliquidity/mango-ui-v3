import * as bjs from '@babylonjs/core/Legacy/legacy'
import { DockingPosition, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { EventBus } from '@/modules/SceneGraph/EventBus'
import { Panel } from '@/modules/SceneGraph/Panel'
import { Scene } from '@/modules/SceneGraph/Scene'
import { UILayer } from '@/modules/SceneGraph/UILayer'
import Logger from '@/modules/SceneGraph/Logger'
// import { CandleChartPanel } from '../DepthFinder/Panels/CandleChartPanel/CandleChartPanel';
// import { CandleChartPresenter } from '../DepthFinder/Panels/CandleChartPanel/CandleChartPresenter';
// import { OrderBookPanel } from '../DepthFinder/Panels/OrderBookPanel/OrderBookPanel';
// import { OrderBookPresenter } from '../DepthFinder/Panels/OrderBookPanel/OrderBookPresenter';
// import { TradeBlotterPanel } from '../DepthFinder/Panels/TradeBlotterPanel/TradeBlotterPanel';
// import { TradeBlotterPresenter } from '../DepthFinder/Panels/TradeBlotterPanel/TradeBlotterPresenter';
import { OpenOrdersPanel } from '../DepthFinder/Panels/OpenOrdersPanel/OpenOrdersPanel'
// import { LocalGameSession } from '../../Elements/LocalGameSession';

export class TradeSerumSceneUIPanelManager extends UILayer {
  public panels: Array<Panel> = new Array<Panel>()

  public containerPlane: bjs.Mesh | undefined

  // public arcRotateCamera: bjs.ArcRotateCamera;

  // public startingPoint: bjs.Vector3 | null;
  // public currentMesh: bjs.Mesh | undefined;
  // public currentPanel: Panel;

  // public tradeBlotterPresenter: TradeBlotterPresenter;
  // public candleChartPresenter: CandleChartPresenter;
  // public orderBookPresenter: OrderBookPresenter;

  public candleCount = 20
  public frameWidth = 1

  // tradeBlotterPanel : TradeBlotterPanel;

  // public originMesh: bjs.Mesh;
  // public distance: number = 3; //51.45929018789144;

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    // public tradingSession: LocalGameSession,
    public glowLayer: bjs.GlowLayer,
    public distance: number
  ) {
    super(name, x, y, z, scene, distance)
    this.create()
  }

  protected onCreate() {
    //this.createTradeBlotterPanel();
    //this.createCandleChartPanel();
    //this.createOrderBookPanel();
    //this.createOpenOrdersPanel();
    this.updateCandles()

    EventBus.Instance.eventHandler.subscribe((p, r) => {
      if (r === 'ROOM_SELECTED') {
        // this.panels[0].setEnabled(true);
      } else if (r === 'CAPTURED_CANDLE_DATA') {
        Logger.log('captured candle data')
        // Logger.log(this.tradingSession.sampler.candles[0]);
        this.updateCandles()
      }
    })
  }

  protected createTradeBlotterPanel() {
    // if (this.tradingSession) {
    //     this.tradeBlotterPresenter = new TradeBlotterPresenter(14, 12, 10, 4);
    //     this.tradingSession.tradeBlotterPresenter = this.tradeBlotterPresenter;
    //     this.tradeBlotterPanel  = new TradeBlotterPanel("TradeBlotter Panel",
    //                                     0,
    //                                     0,
    //                                     0,
    //                                     14,
    //                                     12,
    //                                     10,
    //                                     4,
    //                                     this.scene,
    //                                     this.tradeBlotterPresenter,
    //                                     DockingPosition.TOP_LEFT,
    //                                     this.glowLayer);
    //     this.addUIControl(this.tradeBlotterPanel);
    //     // tradeBlotterPanel.parent = this.containerPlane;
    //     // this.panels.push(this.tradeBlotterPanel);
    //     // tradeBlotterPanel.setEnabled(false);
    // }
  }

  protected createCandleChartPanel() {
    // if (this.tradingSession) {
    //     this.candleChartPresenter = new CandleChartPresenter(13.5, 9.5, this.candleCount); //11.88
    //     const candleChartPanel: CandleChartPanel = new CandleChartPanel("Candle Chart Panel",
    //                                     0,
    //                                     0,
    //                                     0,
    //                                     13.5, //20.5
    //                                     9.5, //11.88
    //                                     this.scene,
    //                                     this.candleCount,
    //                                     this.candleChartPresenter,
    //                                     this.glowLayer,
    //                                     DockingPosition.TOP_RIGHT);
    //     this.addUIControl(candleChartPanel);
    //     // candleChartPanel.parent = this.containerPlane;
    //     // this.panels.push(candleChartPanel);
    // }
  }

  protected createOrderBookPanel() {
    // if (this.tradingSession && this.containerPlane) {
    //     this.orderBookPresenter = new OrderBookPresenter(12, 12, 10, 4);
    //     this.tradingSession.orderBookPresenter = this.orderBookPresenter;
    //     const orderBookPanel: OrderBookPanel = new OrderBookPanel("OrderBook Panel",
    //                                     0,
    //                                     0,
    //                                     0,
    //                                     12,
    //                                     12,
    //                                     10,
    //                                     4,
    //                                     this.scene,
    //                                     this.orderBookPresenter,
    //                                     DockingPosition.BOTTOM_LEFT,
    //                                     this.glowLayer);
    //     // this.addChild(orderBookPanel);
    //     // orderBookPanel.parent = this.containerPlane;
    //     // this.panels.push(orderBookPanel);
    //     // tradeBlotterPanel.setEnabled(false);
    // }
  }

  protected createOpenOrdersPanel() {
    const openOrdersPanel: OpenOrdersPanel = new OpenOrdersPanel(
      'Open Orders Panel',
      0,
      0,
      0,
      40,
      22,
      10,
      4,
      this.scene,
      DockingPosition.LEFT,
      new bjs.Vector3(0, -10, 0),
      this.glowLayer
    )
    this.addUIControl(openOrdersPanel)
    // this.addChild(openOrdersPanel);
    // openOrdersPanel.parent = this.containerPlane;
    // this.panels.push(openOrdersPanel);
  }

  public getPanelByName(name: string) {
    return this.controls.get(name)
  }

  public hasPanelAlready(name: string) {
    return this.controls.get(name) ? true : false
  }

  protected updateCandles() {
    // TODO : Fix Candles
    /*
        let sampleCandles = this.tradingSession.sampler.candles;
        let candles = new Array<CandleStick>();

        if (sampleCandles.length > 0) {
            if (this.candleChartPresenter)
            {
                if(this.candleChartPresenter.isInitialized) 
                {
                    candles.push(sampleCandles[0]);
                }
                else 
                {
                    for (let i = 0; i < Math.min(this.candleCount, sampleCandles.length); i++)
                    {
                        candles.unshift(sampleCandles[i]);
                    }
                }

                this.candleChartPresenter.updatePresenter(new CandleChartUpdateMessage(candles));
            }
        }
        */
  }

  public reset() {
    // const candleChartPanel = this.controls.get("Candle Chart Panel") as CandleChartPanel;
    // candleChartPanel.reset();
  }

  protected onFormat() {
    const tradeBlotterPanelHeight = 12
    const candleChartPanelHeight = 9.5
    const openOrdersPanelHeight = 12

    if (this.scene.sceneType === SceneFormatType.Portrait) {
      let distBaseScale = this.distance / 42 //this.distance / this.scene.camera.radius;
      distBaseScale = distBaseScale === 0 ? 1 : distBaseScale

      let minYScale = 100
      const w = this.bottomRight.x - this.bottomLeft.x

      this.controls.forEach((panel) => {
        panel.scaling.x = w / panel.width

        if (panel.scaling.x < minYScale) {
          minYScale = panel.scaling.x * 0.7 //0.8
        }
        panel.scaling.y = minYScale

        let panelHeight = 1
        if (panel.name === 'Candle Chart Panel') {
          panelHeight = candleChartPanelHeight
        } else if (panel.name === 'TradeBlotter Panel') {
          panelHeight = tradeBlotterPanelHeight
        }
        panel.height = (panelHeight * minYScale) / distBaseScale
      })

      // if (this.tradeBlotterPanel)
      //     this.tradeBlotterPanel?.setEnabled(false);
    } else {
      const distBaseScale = this.distance / 85 // 85

      this.controls.forEach((panel) => {
        let panelHeight = 1
        if (panel.name === 'Candle Chart Panel') {
          panelHeight = candleChartPanelHeight
        } else if (panel.name === 'TradeBlotter Panel') {
          panelHeight = tradeBlotterPanelHeight
        } else {
          panelHeight = openOrdersPanelHeight
        }
        panel.scaling = new bjs.Vector3(
          distBaseScale,
          distBaseScale,
          distBaseScale
        )
        panel.height = panelHeight
      })

      // if(this.tradeBlotterPanel)
      //     this.tradeBlotterPanel?.setEnabled(true);
    }
  }
}
