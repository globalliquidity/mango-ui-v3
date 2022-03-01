// import * as Ably from 'ably';
import * as bjs from '@babylonjs/core/Legacy/legacy'
import currency from 'currency.js'
import { DepthFinderPresenter } from './DepthFinder/DepthFinderPresenter'
import { TradeBlotterPresenter } from './DepthFinder/Panels/TradeBlotterPanel/TradeBlotterPresenter'
import { TradeDirection } from '../Enums'
import { GLSGColor } from '@/modules/SceneGraph/Enums'
import { AnalyticsEngine } from './AnalyticsEngine'
// import { EventBus } from '@/modules/SceneGraph/EventBus';
import { Machine, interpret, StateMachine, Interpreter } from 'xstate'
// import { LocalTradingPlayer } from '../TradingPlayer';
import { TradeSerumScene } from '../TradeSerumScene'
import { OrderBookPresenter } from './DepthFinder/Panels/OrderBookPanel/OrderBookPresenter'
import Logger from '@/modules/SceneGraph/Logger'
import { SoundPlayer, TradeSounds } from '../SoundPlayer'
import { TradingSession } from './TradingSession'
// import { SerumDexUIAdapter } from '../SerumDexUIAdapter';
// import { MarketDataClient } from '../../Market/MarketDataClient';
// const moment = require("moment");

// The hierarchical (recursive) schema for the states
export interface LocalTradingSessionSchema {
  states: {
    flat: {
      states: {
        no_order_placed: {}
        closing_sell_order_placed: {}
        closing_buy_order_placed: {}
      }
    }
    in_market: {
      states: {
        long: {
          states: {
            buy_order_placed: {}
            buy_order_confirmed: {}
          }
        }
        short: {
          states: {
            sell_order_placed: {}
            sell_order_confirmed: {}
          }
        }
      }
    }
  }
}

// The events that the machine handles
export type LocalTradingSessionEventType =
  | { type: 'BUY_AT_MARKET'; data: string }
  | { type: 'SELL_AT_MARKET'; data: string }
  | { type: 'BUY_ORDER_FILLED'; data: string }
  | { type: 'SELL_ORDER_FILLED'; data: string }
  | { type: 'EXIT_MARKET' }

// The context (extended state) of the machine
export interface LocalTradingSessionContext {
  orderSize: number
}

export class LocalTradingSession extends TradingSession {
  public analyticsEngine: AnalyticsEngine
  //public positionSonar : PositionSonar

  public tradeBlotterPresenter?: TradeBlotterPresenter
  public orderBookPresenter?: OrderBookPresenter
  //public midPriceString: string = "000";

  protected _stateMachine: StateMachine<
    LocalTradingSessionContext,
    LocalTradingSessionSchema,
    LocalTradingSessionEventType
  >
  public get stateMachine(): StateMachine<
    LocalTradingSessionContext,
    LocalTradingSessionSchema,
    LocalTradingSessionEventType
  > {
    return this._stateMachine
  }

  protected stateMachineService: Interpreter<
    LocalTradingSessionContext,
    LocalTradingSessionSchema,
    LocalTradingSessionEventType
  >

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public presenter: DepthFinderPresenter
  ) {
    super(name, x, y, z, scene)

    Logger.log('LocalGameSession : Constructor')

    //presenter.tradingSession = this;
    this.analyticsEngine = new AnalyticsEngine(
      'Analytics Engine',
      0,
      0,
      0,
      this.scene,
      this
    )
    this.addChild(this.analyticsEngine)
    this.analyticsEngine.start()

    // EventBus.Instance.eventHandler.subscribe((p, r) => {
    //     //SoundPlayer.Instance.intialize();
    //     //this._onTradingSessionStarted.dispatch(this.sessionTime);
    // });

    this._stateMachine = Machine<
      LocalTradingSessionContext,
      LocalTradingSessionSchema,
      LocalTradingSessionEventType
    >(
      {
        id: 'local_trading_session_manager',
        initial: 'flat',

        states: {
          flat: {
            id: 'flat',
            initial: 'no_order_placed',
            onEntry: 'onEnterFlat',
            states: {
              no_order_placed: {
                id: 'no_order_placed',
                on: {
                  BUY_AT_MARKET: '#long',
                  SELL_AT_MARKET: '#short',
                },
              },
              closing_sell_order_placed: {
                id: 'closing_sell_order_placed',
                onEntry: 'onEnterClosingSellOrderPlaced',
                onExit: 'onExitClosingSellOrderPlaced',
                on: {
                  SELL_ORDER_FILLED: '#no_order_placed',
                },
              },
              closing_buy_order_placed: {
                id: 'closing_buy_order_placed',
                onEntry: 'onEnterClosingBuyOrderPlaced',
                onExit: 'onExitClosingBuyOrderPlaced',
                on: {
                  BUY_ORDER_FILLED: '#no_order_placed',
                },
              },
            },
          },
          in_market: {
            id: 'in_market',
            on: {
              EXIT_MARKET: '#flat',
            },
            states: {
              long: {
                id: 'long',
                initial: 'buy_order_placed',
                onEntry: 'onEnterLong',
                states: {
                  buy_order_placed: {
                    id: 'buy_order_placed',
                    on: {
                      BUY_ORDER_FILLED: '#buy_order_confirmed',
                      SELL_AT_MARKET: '#no_order_placed', // temp state
                    },
                  },
                  buy_order_confirmed: {
                    id: 'buy_order_confirmed',
                    onEntry: 'onEnterBuyOrderConfirmed',
                    on: {
                      SELL_AT_MARKET: '#closing_sell_order_placed',
                    },
                  },
                },
              },
              short: {
                id: 'short',
                initial: 'sell_order_placed',
                onEntry: 'onEnterShort',
                states: {
                  sell_order_placed: {
                    id: 'sell_order_placed',
                    on: {
                      SELL_ORDER_FILLED: '#sell_order_confirmed',
                      BUY_AT_MARKET: '#no_order_placed', // temp state
                    },
                  },
                  sell_order_confirmed: {
                    id: 'sell_order_confirmed',
                    onEntry: 'onEnterSellOrderConfirmed',
                    on: {
                      BUY_AT_MARKET: '#closing_buy_order_placed',
                    },
                  },
                }, //short states
              }, // short
            }, // in_market states
          }, // in_market
        },
      },
      {
        actions: {
          onEnterLong: (_ctx, _event) => {
            Logger.log('LocalTradingSession : Entering Long State')
            Logger.log('LocalTradingSession : Creating New Trade')
            this.scene.showStatusMessage('LONG', GLSGColor.SkyBlue)
            SoundPlayer.Instance.playSound(TradeSounds.ENTER_TRADE_LONG, -6)
            const currentAskPrice: currency = this.presenter.insideAsk
              ?.price as currency
            // this.player.sendEvent("SERVER_BUY_AT_MARKET",currentAskPrice.value.toFixed(2));
            this.openingOrderPlaced = true
            this.hasOpenTrade = true
            this.openTradePrice = currentAskPrice
            this.openTradeDirection = TradeDirection.Long
            this.gemPnL = 0
            this._onTradeOpened.dispatch()

            // Call SerumDexUIAdapter
            // SerumDexUIAdapter.Instance.placeMarketOrder(TradeDirection.Long, currentAskPrice, 0.1);
          },
          onEnterBuyOrderConfirmed: (_ctx, _event) => {},
          onEnterShort: (_ctx, _event) => {
            Logger.log('LocalTradingSession Session  : Entering Short State')
            Logger.log('LocalTradingSession : Creating New Trade')
            this.scene.showStatusMessage('SHORT', GLSGColor.Pink)
            SoundPlayer.Instance.playSound(TradeSounds.ENTER_TRADE_SHORT, -6)
            const currentBidPrice: currency = this.presenter.insideBid
              ?.price as currency
            // this.player.sendEvent("SERVER_SELL_AT_MARKET",currentBidPrice.value.toFixed(2));
            this.openingOrderPlaced = true
            this.hasOpenTrade = true
            this.openTradePrice = currentBidPrice
            this.gemPnL = 0
            this.openTradeDirection = TradeDirection.Short

            this._onTradeOpened.dispatch()

            // Call SerumDexUIAdapter
            // SerumDexUIAdapter.Instance.placeMarketOrder(TradeDirection.Short, currentBidPrice, 0.1);
          },
          onEnterSellOrderConfirmed: (_ctx, _event) => {},
          onEnterFlat: (_ctx, _event) => {
            Logger.log('LocalTradingSession : Entering Flat State')
            this.openingOrderPlaced = false
            this.hasOpenTrade = false
            //this.gemPnL = 0;
            this.openTradePrice = currency(0)
            this._onTradeClosed.dispatch()
            //this.gemPnL = 0;
          },
          onEnterClosingSellOrderPlaced: (_ctx, _event) => {
            Logger.log(
              'LocalTradingSession : Closing Sell Order Placed. Gem PnL: ' +
                this.gemPnL
            )
            // const currentBidPrice : currency = this.presenter.insideBid?.price as currency;
            // this.player.sendEvent("SERVER_SELL_AT_MARKET",currentBidPrice.value.toFixed(2));

            if (this.gemPnL > 0) {
              if (this.gemPnL < 3)
                SoundPlayer.Instance.playSound(TradeSounds.TRADE_WIN_SMALL, -6)
              else SoundPlayer.Instance.playSound(TradeSounds.TRADE_WIN, -6)
            } else if (this.gemPnL < 0) {
              if (this.gemPnL > -3)
                SoundPlayer.Instance.playSound(TradeSounds.TRADE_LOSS_SMALL, -6)
              else SoundPlayer.Instance.playSound(TradeSounds.TRADE_LOSS, -6)
            }
          },
          onExitClosingSellOrderPlaced: (_ctx, _event) => {},
          onEnterClosingBuyOrderPlaced: (_ctx, _event) => {
            // const currentAskPrice : currency = this.presenter.insideAsk?.price as currency;
            // this.player.sendEvent("SERVER_BUY_AT_MARKET",currentAskPrice.value.toFixed(2));

            if (this.openPnL.value > 0) {
              if (this.openPnL.value < 10)
                SoundPlayer.Instance.playSound(TradeSounds.TRADE_WIN_SMALL, -6)
              else SoundPlayer.Instance.playSound(TradeSounds.TRADE_WIN, -6)
            } else {
              if (this.openPnL.value > -10)
                SoundPlayer.Instance.playSound(TradeSounds.TRADE_LOSS_SMALL, -6)
              else SoundPlayer.Instance.playSound(TradeSounds.TRADE_LOSS, -6)
            }
          },
          onExitClosingBuyOrderPlaced: (_ctx, _event) => {},
        },
      }
    )

    this.stateMachineService = interpret(this.stateMachine, { devTools: true })

    this.stateMachineService.onTransition((state) => {
      const currentStateStrings: string[] = state.toStrings()
      const curentStateString: string =
        currentStateStrings[currentStateStrings.length - 1]
      Logger.log('TradingSession State: ' + curentStateString)

      this.currentState = curentStateString

      //this.synchronizer.sendState(this.currentState,this.currentFillPrice.toString());
    })

    this.stateMachineService.start()
    this.create()
  }

  protected onAddCustomProperties() {
    this.inspectableCustomProperties = [
      {
        label: 'Current Balance',
        propertyName: 'currentCapitalString',
        type: bjs.InspectableType.String,
      },
      {
        label: 'Current State',
        propertyName: 'currentStateString',
        type: bjs.InspectableType.String,
      },
    ]
  }

  processEvent(event: string, eventData: string) {
    switch (event) {
      case 'BUY_AT_MARKET':
      case 'SELL_AT_MARKET':
      case 'EXIT_MARKET':
      case 'BUY_ORDER_FILLED':
      case 'SELL_ORDER_FILLED': {
        Logger.log(
          'LocalTradingSession : Processing Event : ' + event + ':' + eventData
        )
        this.stateMachineService.send({ type: event, data: eventData })
        break
      }
    }
  }
}
