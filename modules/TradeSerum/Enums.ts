export enum MarketSide {
  Bid = -1,
  None = 0,
  Ask = 1,
}

export enum OrderSide {
  Buy = 1,
  None = 0,
  Sell = -1,
}

export enum TradeDirection {
  Long = 1,
  Short = -1,
}

export enum OrderStatus {
  New,
  PartiallyFilled,
  Filled,
  Cancelled,
  PendingCancel,
  Rejected,
  Expired,
}

export enum OrderState {
  None,
  Placed,
  Confirmed,
  CancelRequested,
  CancelConfirmed,
  PartiallyFilled,
  Filled,
  Rejected,
}

export enum OrderType {
  LimitOrder,
  MarketOrder,
}

export enum ExchangeOrderType {
  LimitOrder,
  MarketOrder,
}

export enum InstrumentSymbol {
  USD_BTC,
  BTC_ETH,
}

export enum ExchangeName {
  Binance,
  Coinbase,
  Bitmex,
  CryptoQuote,
  Shrimpy,
}

export enum DepthFinderSound {
  UpTick,
  DownTick,
}

export enum PriceDirection {
  Up,
  Down,
}

export enum UserActionType {
  EnterMarketOnBid,
  CancelOrder,
}

export enum PriceDivision {
  OneCent,
  FiveCent,
  TenCent,
  TwentyFiveCent,
  FiftyCent,
  OneDollar,
}

export enum PriceRangePercentage {
  OnePercent,
  TwoPercent,
  FivePercent,
  TenPercent,
  OneHundredPercent,
}

export enum TradeStatus {
  Created,
  Open,
  Closed,
  Cancelled,
}

export enum CandleType {
  Bullish,
  Bearish,
}

export enum SmartOrderType {
  NONE,
  DEEP_BID,
  JOIN_BID,
  SHAVE_BID,
  CROSS_BID,
  MARKET_BUY,
  DEEP_OFFER,
  JOIN_OFFER,
  SHAVE_OFFER,
  CROSS_OFFER,
  MARKET_SELL,
}
