import { Order } from '@project-serum/serum/lib/market'
import { SignalDispatcher, SimpleEventDispatcher } from 'strongly-typed-events'
import { EventBus } from '@/modules/SceneGraph/EventBus'
import Logger from '@/modules/SceneGraph/Logger'
import { SmartOrderType, TradeDirection } from './Enums'
import * as UIConstant from '@/constants/UIContants'
import currency from 'currency.js'
import { SmartOrder } from '@/machine/SmartOrderMachine'

export enum SmartOrderEventType {
  ORDER_CREATED,
  ORDER_PRICE_TARGET_SET,
  ORDER_PLACED,
  ORDER_CONFIRMED,
  ORDER_PARTIALLY_FILLED,
  ORDER_COMPLETELY_FILLED,
  ORDER_CANCEL_REQUESTED,
  ORDER_CANCELLED,
  ORDER_REJECTED,
  RESET,
}

export class SmartOrderEvent {
  constructor(
    public orderEventType: SmartOrderEventType,
    public order: SmartOrder
  ) {}
}

export class SerumDexUIAdapter {
  private static _instance: SerumDexUIAdapter

  private _onCurrentMarketChanged = new SimpleEventDispatcher<string>()

  public get onCurrentMarketChanged() {
    return this._onCurrentMarketChanged.asEvent()
  }

  private _onWalletConnected = new SimpleEventDispatcher<string>()

  public get onWalletConnected() {
    return this._onWalletConnected.asEvent()
  }

  private _onWalletDisconnected = new SignalDispatcher()

  public get onWalletDisconnected() {
    return this._onWalletDisconnected.asEvent()
  }

  private _onInitializationInProgress = new SignalDispatcher()
  public get onInitializationInProgress() {
    return this._onInitializationInProgress.asEvent()
  }

  private _onInitializationComplete = new SignalDispatcher()
  public get onInitializationComplete() {
    return this._onInitializationComplete.asEvent()
  }

  private _onSettlementInProgress = new SignalDispatcher()
  public get onSettlementInProgress() {
    return this._onSettlementInProgress.asEvent()
  }

  private _onSettlementComplete = new SignalDispatcher()
  public get onSettlementComplete() {
    return this._onSettlementComplete.asEvent()
  }

  private _onBaseWalletBalanceChanged = new SimpleEventDispatcher<number>()
  public get onBaseWalletBalanceChanged() {
    return this._onBaseWalletBalanceChanged.asEvent()
  }

  private _onQuoteWalletBalanceChanged = new SimpleEventDispatcher<number>()
  public get onQuoteWalletBalanceChanged() {
    return this._onQuoteWalletBalanceChanged.asEvent()
  }

  private _onBaseUnsettledBalanceChanged = new SimpleEventDispatcher<number>()
  public get onBaseUnsettledBalanceChanged() {
    return this._onBaseUnsettledBalanceChanged.asEvent()
  }

  private _onQuoteUnsettledBalanceChanged = new SimpleEventDispatcher<number>()
  public get onQuoteUnsettledBalanceChanged() {
    return this._onQuoteUnsettledBalanceChanged.asEvent()
  }

  private _onOrderMessageChanged = new SimpleEventDispatcher<string>()

  public get onOrderMessageChanged() {
    return this._onOrderMessageChanged.asEvent()
  }

  private _onOrderTypeChanged = new SimpleEventDispatcher<SmartOrderType>()

  public get onOrderTypeChanged() {
    return this._onOrderTypeChanged.asEvent()
  }

  private _currentMarket = ''
  public get currentMarket(): string {
    return this._currentMarket
  }

  private baseCurrency = 'SOL'
  private quoteCurrency = 'USDC'

  private _onBaseCurrencyChanged = new SimpleEventDispatcher<string>()

  public get onBaseCurrencyChanged() {
    return this._onBaseCurrencyChanged.asEvent()
  }

  private _onQuoteCurrencyChanged = new SimpleEventDispatcher<string>()

  public get onQuoteCurrencyChanged() {
    return this._onQuoteCurrencyChanged.asEvent()
  }

  // public get quoteCurrency() : string {
  //     if (this._currentMarket !== "")
  //     {
  //         return this._currentMarket.split("/")[1];
  //     }
  //     return "";
  // }

  // public get baseCurrency() : string {
  //     if (this._currentMarket !== "")
  //     {
  //         return this._currentMarket.split("/")[0];
  //     }
  //     return "";
  // }

  private baseWalletBalance = 0
  private quoteWalletBalance = 0
  private baseUnsettledBalance = 0
  private quoteUnsettledBalance = 0
  private currentOrderMessage = ''
  private currentOrderType: SmartOrderType = SmartOrderType.NONE

  private _onOpenOrdersUpdated = new SimpleEventDispatcher<Order[]>()
  public get onOpenOrdersUpdated() {
    return this._onOpenOrdersUpdated.asEvent()
  }

  private _onSmartOrderEvent = new SimpleEventDispatcher<SmartOrderEvent>()
  public get onSmartOrderEvent() {
    return this._onSmartOrderEvent.asEvent()
  }

  private constructor() {
    EventBus.Instance.eventDataHandler.subscribe((_p, r) => {
      switch (r.type) {
        case UIConstant.SERUM_UI_MARKET_CHANGED:
          if (r.data !== undefined) {
            const market: string = r.data as string
            Logger.log('Serum UI : Market Changed to : ' + market)
            this._currentMarket = market
            this._onCurrentMarketChanged.dispatch(market)
          }
          break
        case UIConstant.SERUM_UI_WALLET_CONNECTED:
          {
            const walletAddress: string = r.data as string
            Logger.log('Serum UI : Wallet Connected : ' + walletAddress)
            this._onWalletConnected.dispatch(walletAddress)
          }
          break
        case UIConstant.SERUM_UI_WALLET_DISCONNECTED:
          this._onWalletDisconnected.dispatch()
          break
        case UIConstant.SERUM_UI_INITIALIZATION_IN_PROGRESS:
          this._onInitializationInProgress.dispatch()
          break
        case UIConstant.SERUM_UI_INITIALIZATION_COMPLETE:
          this._onInitializationComplete.dispatch()
          break
        case UIConstant.SERUM_UI_SETTLEMENT_IN_PROGRESS:
          this._onSettlementInProgress.dispatch()
          break
        case UIConstant.SERUM_UI_SETTLEMENT_COMPLETE:
          this._onSettlementComplete.dispatch()
          break
        case UIConstant.SERUM_UI_BASE_CURRENCY_CHANGED:
          {
            const baseCurrency = r.data as string
            if (baseCurrency !== this.baseCurrency) {
              this.baseCurrency = baseCurrency
              this._onBaseCurrencyChanged.dispatch(this.baseCurrency)
            }
          }
          break
        case UIConstant.SERUM_UI_QUOTE_CURRENCY_CHANGED:
          {
            const quoteCurrency = r.data as string
            if (quoteCurrency !== this.quoteCurrency) {
              this.quoteCurrency = quoteCurrency
              this._onQuoteCurrencyChanged.dispatch(this.quoteCurrency)
            }
          }
          break
        case UIConstant.SERUM_UI_BASE_WALLET_BALANCE_CHANGED:
          {
            const baseWalletBalance: number = r.data as number
            if (baseWalletBalance !== this.baseWalletBalance)
              //{
              Logger.log(
                'Serum UI : Base Wallet Balance Changed: ' + baseWalletBalance
              )
            this.baseWalletBalance = baseWalletBalance
            this._onBaseWalletBalanceChanged.dispatch(this.baseWalletBalance)
            //}
          }
          break
        case UIConstant.SERUM_UI_QUOTE_WALLET_BALANCE_CHANGED:
          {
            const quoteWalletBalance: number = r.data as number
            //if (quoteWalletBalance !== this.quoteWalletBalance)
            //{
            Logger.log(
              'Serum UI : Quote Wallet Balance Changed: ' + quoteWalletBalance
            )
            this.quoteWalletBalance = quoteWalletBalance
            this._onQuoteWalletBalanceChanged.dispatch(this.quoteWalletBalance)
            //}
          }
          break
        case UIConstant.SERUM_UI_BASE_UNSETTLED_BALANCE_CHANGED:
          {
            const baseUnsettledBalance: number = r.data as number
            //if (baseUnsettledBalance !== this.baseUnsettledBalance)
            //{
            Logger.log(
              'Serum UI : Base Wallet Balance Changed: ' + baseUnsettledBalance
            )
            this.baseUnsettledBalance = baseUnsettledBalance
            this._onBaseUnsettledBalanceChanged.dispatch(
              this.baseUnsettledBalance
            )
            //}
          }
          break
        case UIConstant.SERUM_UI_QUOTE_UNSETTLED_BALANCE_CHANGED:
          {
            const quoteUnsettledBalance: number = r.data as number
            //if (quoteUnsettledBalance !== this.quoteUnsettledBalance)
            //{
            Logger.log(
              'Serum UI : Quote Unsettled Balance Changed: ' +
                quoteUnsettledBalance
            )
            this.quoteUnsettledBalance = quoteUnsettledBalance
            this._onQuoteUnsettledBalanceChanged.dispatch(
              this.quoteUnsettledBalance
            )
            //}
          }
          break
        case UIConstant.SERUM_UI_ORDER_MESSAGE_CHANGED:
          {
            const message: string = r.data as string
            if (message !== this.currentOrderMessage) {
              Logger.log('Serum UI : Order Message Changed: ' + message)
              this.currentOrderMessage = message
              this._onOrderMessageChanged.dispatch(this.currentOrderMessage)
            }
          }
          break
        case UIConstant.SERUM_UI_ORDER_TYPE_CHANGED:
          {
            const orderType: SmartOrderType = r.data as SmartOrderType
            if (orderType !== this.currentOrderType) {
              Logger.log(
                'Serum UI : Order Type Changed: ' + orderType.toString()
              )
              this.currentOrderType = orderType
              this._onOrderTypeChanged.dispatch(this.currentOrderType)
            }
          }
          break
        case UIConstant.SERUM_UI_OPEN_ORDERS_UPDATED:
          {
            const openOrders = r.data as Order[]
            if (openOrders.length > 0) {
              Logger.log('Serum UI : Open Orders Updated:', openOrders)

              const firstOrderId: string = openOrders[0].orderId.toString()
              Logger.log('Serum UI : First Order Id:', firstOrderId)
              this._onOpenOrdersUpdated.dispatch(openOrders)
            }
          }
          break
        case UIConstant.SERUM_UI_SMART_ORDER_EVENT:
          {
            const smartOrderEvent = r.data as SmartOrderEvent
            if (smartOrderEvent) {
              Logger.log(
                'Serum UI : Smart Order Event:',
                smartOrderEvent.orderEventType
              )
              this._onSmartOrderEvent.dispatch(smartOrderEvent)
            }
          }
          break
        case UIConstant.SERUM_ORDERBOOK_UPDATE:
          break
        case UIConstant.SERUM_TRADES_UPDATE:
          break
      }
    })
  }

  public placeMarketOrder(
    _side: TradeDirection,
    _price: currency,
    _size: number
  ) {
    // EventBus.Instance.emitData({
    //     type: UIConstant.SERUM_UI_ORDER_IS_PLACED,
    //     data: {
    //         side: (side === TradeDirection.Short) ? 'sell' : 'buy',
    //         price: price.value,
    //         size: size
    //     }
    // })
  }

  public cancelMarketOrder() {}

  public engage() {}

  public disengage() {}

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this())
  }
}
