import { SmartOrderType } from '@/modules/TradeSerum/Enums'

export const smartOrdersData = {
  not_set: {
    smartOrderType: SmartOrderType.NONE,
    priceOffset: 0.0,
    side: 'buy',
    basePrice: 'bid',
    msgSuffix: 'BID ',
  },
  join_bid: {
    smartOrderType: SmartOrderType.JOIN_BID,
    priceOffset: 0.0,
    side: 'buy',
    basePrice: 'bid',
    msgSuffix: 'BID ',
  },
  shave_bid: {
    smartOrderType: SmartOrderType.SHAVE_BID,
    priceOffset: 0.001,
    side: 'buy',
    basePrice: 'bid',
    msgSuffix: 'BID ',
  },
  cross_offer: {
    smartOrderType: SmartOrderType.CROSS_OFFER,
    priceOffset: 0.001,
    side: 'sell',
    basePrice: 'bid',
    msgSuffix: 'OFFER ',
  },
  market_sell: {
    smartOrderType: SmartOrderType.MARKET_SELL,
    priceOffset: 0.0,
    side: 'sell',
    basePrice: 'bid',
    msgSuffix: 'SELL ',
  },
  join_offer: {
    smartOrderType: SmartOrderType.JOIN_OFFER,
    priceOffset: 0.0,
    side: 'sell',
    basePrice: 'ask',
    msgSuffix: 'OFFER ',
  },
  shave_offer: {
    smartOrderType: SmartOrderType.SHAVE_OFFER,
    priceOffset: -0.001,
    side: 'sell',
    basePrice: 'ask',
    msgSuffix: 'OFFER ',
  },
  cross_bid: {
    smartOrderType: SmartOrderType.CROSS_BID,
    priceOffset: -0.001,
    side: 'buy',
    basePrice: 'ask',
    msgSuffix: 'BID ',
  },
  market_buy: {
    smartOrderType: SmartOrderType.MARKET_BUY,
    priceOffset: 0.0,
    side: 'buy',
    basePrice: 'ask',
    msgSuffix: 'BUY ',
  },
}
