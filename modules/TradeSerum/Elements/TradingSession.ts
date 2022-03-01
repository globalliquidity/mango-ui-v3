import currency from 'currency.js'
import { Trade } from '../Market/Trade'
import { ExchangeOrder } from '../Market/ExchangeOrder'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
// import { TradingPlayer } from '../TradingPlayer';
import { TradeSerumScene } from '../TradeSerumScene'
import { SimpleEventDispatcher, SignalDispatcher } from 'strongly-typed-events'
import Logger from '@/modules/SceneGraph/Logger'
import { MicStatus } from '@/modules/SceneGraph/Enums'
import { TradeDirection } from '../Enums'

const moment = require('moment')

export abstract class TradingSession extends SceneElement {
  protected startTime = ''
  protected endTime = ''
  protected leverage = 1
  // public gemCount : number = 0;
  public closedPnL: currency = currency(0)
  public openingOrderPlaced = false
  public hasOpenTrade = false
  public openTradeDirection: TradeDirection = TradeDirection.Long
  public openTradePrice: currency = currency(0)
  public openPnL: currency = currency(0)
  public gemPnL = 0

  public micStatus: MicStatus = MicStatus.Muted

  /*
    get currentPnL() : number { 
        return this.tradeBlotter.closedPnL.value;
    } 
    */

  get leverageString(): string {
    return this.leverage.toFixed(0)
  }

  set leverageString(value: string) {
    this.leverage = +value
  }

  protected _onTradingSessionStarted = new SignalDispatcher()

  public get onTradingSessionStarted() {
    return this._onTradingSessionStarted.asEvent()
  }

  protected _onTradingSessionEnded = new SignalDispatcher()

  public get onTradingSessionEnded() {
    return this._onTradingSessionEnded.asEvent()
  }

  protected _onOpeningOrderPlaced = new SignalDispatcher()

  public get onOpeningOrderPlaced() {
    return this._onOpeningOrderPlaced.asEvent()
  }

  protected _onClosingOrderPlaced = new SignalDispatcher()

  public get onClosingOrderPlaced() {
    return this._onClosingOrderPlaced.asEvent()
  }

  protected _onTradeOpened = new SignalDispatcher()

  public get onTradeOpened() {
    return this._onTradeOpened.asEvent()
  }

  protected _onTradeClosed = new SignalDispatcher()

  public get onTradeClosed() {
    return this._onTradeClosed.asEvent()
  }

  protected _onTradeCancelled = new SimpleEventDispatcher<Trade>()

  public get onTradeCancelled() {
    return this._onTradeCancelled.asEvent()
  }

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene
  ) {
    super(name, x, y, z, scene)

    Logger.log('TradingSession : Constructor')
    this.startTime = moment().format('YYYY/MM/DD:mm:ss')
  }

  /*
    public sendEvent(event: string, data: string = "")
    {
        Logger.log('TradingSession     |   Send Event :  ' + event);
        this.player.sendEvent(event,data);
    }
    */

  public startTradingSession() {
    Logger.log('TradingSession     |  Dispatching onTradingSessionStarted')
    this._onTradingSessionStarted.dispatch()
  }

  public endTradingSession() {
    Logger.log('TradingSession     |  Dispatching onTradingSessionEnded')
    this._onTradingSessionEnded.dispatch()
    this.reset()
  }

  public reset() {
    Logger.log('TradingSession     |  Resetting Trading Session')
    this.hasOpenTrade = false
  }

  currentState!: string
  get currentStateString(): string {
    return this.currentState
  }

  protected openTrade(_trade: Trade) {
    Logger.log('TradingSession: Opening Trade')
    //this.tradeBlotter.addTrade(trade);
    //this._onTradeOpened.dispatch();
  }

  protected closeTrade(_order: ExchangeOrder) {
    Logger.log('TradingSession : Closing Trade')
    Logger.log('TradingSession : Trade Closed')
    Logger.log('TradingSession : Current PnL : ' + this.openPnL.format())
    Logger.log('TradingSession : Dispatched OnTradeClosed')
    //this._onTradeClosed.dispatch();
  }
}
