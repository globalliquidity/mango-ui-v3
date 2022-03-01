import { MarketSide, OrderSide, OrderState } from './Enums'
import { VectorField } from '@/modules/SceneGraph/VectorField'
import { ExchangeOrder } from './Market/ExchangeOrder'
import * as bjs from '@babylonjs/core/Legacy/legacy'
import { QuoteBucket } from './Market/QuoteBucket'
import currency from 'currency.js'

//
// Represents information about an order, placed with the exchange
// We receive order updates from the trading rig with data in this form.
//
export interface IExchangeOrder {
  // symbol : string;
  side: OrderSide
  quantity: number
  price: currency
  state: OrderState
  time: number
}

//
// Represents a single "quote" in an order book
// Qotes with side.Bid are placed in the order book's
// bid array, side.Ask in the ask array.
// Together the price and quantity represent
// the size of the order, in financial terms.
export interface IOrderBookEntry {
  // symbol:string;
  side: MarketSide
  price: currency
  quantity: number
  index: number
}

//
// An IOrderBook manages two collections of IOderBookEntrys.
// One for the bid, and one for the ask (offer). Entries
// in each book are always price sorted. Bids are stored in descending order.
// Asks are stored in ascending order. This causes the order book to reflect
// The real market structure where the highest bid approaches the price of the lowest ask.
// All other market participants are "away" from the market, with either a lower bid, or
// a higher ask. The distance between the lowest ask and the highest bid is called the "spread".
export interface IOrderBook {
  // exchange:string;
  symbol: string
  //priceQuantizeDivision : number;

  bids: Array<IOrderBookEntry>
  asks: Array<IOrderBookEntry>

  //quantizedBids: Array<IOrderBookEntry>;
  //quantizedAsks: Array<IOrderBookEntry>;

  insideBid?: QuoteBucket
  insideAsk?: QuoteBucket

  clear(): void
  sort(): void
  clone(): IOrderBook

  getEntries(side: MarketSide): Array<QuoteBucket>
  getEntry(side: MarketSide, depth: number): QuoteBucket

  addEntry(side: MarketSide, price: currency, quantity: number): void

  //getQuantityAtPrice(side : MarketSide,price : currency);
  //getLargestQuantity(side : MarketSide) : number;
  refresh(): void
  //quantize() : void;
  //quantizeSide(side : MarketSide, quantizePower: number) : void;
  compareBids(a: any, b: any): number
  compareAsks(a: any, b: any): number
  logOrderBook(levels: number): void
}

export interface IExchangeTraded {
  // exchange:string;
  symbol: string
}

export interface ITradeHistory {
  trades: Array<ExchangeOrder>
  clone(): ITradeHistory
}

export interface IOrderBookHistory {
  maxLength: number
  orderBooks: Array<IOrderBook>
  clear(): void
  add(orderBook: IOrderBook): void
  get(generation: number): IOrderBook
}

export interface IOrderBookClient {
  orderBook: IOrderBook
}

export interface IExchangeOrderScenenElement {
  order: ExchangeOrder
  generation: number
}

export interface IDepthFinderElement {
  rowCount: number
  columnCount: number
  cellWidth: number
  cellHeight: number
  cellDepth: number
  cellMeshScaleFactor: number
}

export interface IVectorFieldUpdateStrategy {
  vectorField: VectorField
  preCalculate(): void
  updateParticle(particle: bjs.SolidParticle): bjs.SolidParticle
}

export interface ICandlestick {
  open: number
  high: number
  low: number
  close: number
  volume: number
  quoteVolume: number
  btcVolume: number
  usdVolume: number
  time: Date
}

export interface IExchangeInfo {
  exchange: string
  bestCaseFee: number
  worstCaseFee: number
  icon: string
}

export interface IExchangeAsset {
  id: number
  name: string
  symbol: string
  tradingSymbol: string
}

export interface ITradingPair {
  baseTradingSymbol: string
  quoteTradingSymbol: string
}

export interface IExchangeApiError {
  code: number
  message: string
}

export interface IExchange {
  info: IExchangeInfo
  exchangeAssets: Array<IExchangeAsset>
  tradingPairs: Array<ITradingPair>

  addExchangeAsset(asset: IExchangeAsset): void
  addExchangeAssets(asset: IExchangeAsset[]): void
  addTradingPair(tradingPair: ITradingPair): void
  addTradingPairs(tradingPairs: ITradingPair[]): void
}

export interface IMarketplace {
  name: string
  exchanges: Array<IExchange>

  addExchange(exchange: IExchange): void
  addExchanges(exchangeInfos: IExchangeInfo[]): void
  resetExchanges(exchangeInfos: IExchangeInfo[]): void
  setCurrentExchange(exchangeInfo: IExchangeInfo): void
}

export interface ISettings {
  majorVersion: number
  minorVersion: number
}
