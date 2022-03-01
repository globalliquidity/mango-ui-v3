import { Order } from '@project-serum/serum/lib/market'
import { PublicKey } from '@solana/web3.js'
import { assign, createMachine } from 'xstate'
import { SmartOrderType } from '../modules/TradeSerum/Enums'
import BN from 'bn.js'

export interface SmartOrderRequest {
  smartOrderType: SmartOrderType
  price: number
  size: number
  side: 'buy' | 'sell'
}

export interface ISmartOrder extends Partial<Order> {
  smartOrderType: SmartOrderType
  orderQuantity: number
  filledQuantity: number
  message: string

  fillCurrentOrder(filledQuantity: number): number
  setPrice(price: number): number
}

export class SmartOrder implements ISmartOrder {
  smartOrderType: SmartOrderType
  orderQuantity: number
  filledQuantity: number
  message: string

  orderId: BN
  openOrdersAddress: PublicKey = new PublicKey(123)
  openOrdersSlot: number
  price: number
  priceLots: BN
  size: number
  feeTier: number
  sizeLots: BN
  side: 'buy' | 'sell'
  clientId?: BN

  constructor(
    smartOrderType: SmartOrderType,
    price: number,
    size: number,
    side: 'buy' | 'sell'
  ) {
    this.smartOrderType = smartOrderType
    this.price = price
    this.size = size
    this.side = side

    this.orderQuantity = 0
    this.filledQuantity = 0
    this.message = ''

    this.orderId = new BN(0)
    this.openOrdersSlot = 0
    this.priceLots = new BN(0)
    this.feeTier = 0
    this.sizeLots = new BN(0)
  }

  public fillCurrentOrder(filledQuantity: number) {
    this.filledQuantity += filledQuantity
    return this.filledQuantity
  }

  public setPrice(price: number) {
    this.price = price
    return price
  }
}

export interface SmartOrderControllerContext {
  orderHistory: ISmartOrder[]
  currentOrder?: SmartOrder
  currentPrice: number
  side: 'buy' | 'sell'
  size: number
  totalFilled: number
  isDisengaging: boolean
  openOrder?: Order
  priceTargetDeltaThreshold: number
  gotBaseUnsettledBalance: boolean
  baseUnsettledBalance: number
  gotQuoteUnsettledBalance: boolean
  quoteUnsettledBalance: number
  gotBaseWalletBalance: boolean
  baseWalletBalance: number
  gotQuoteWalletBalance: boolean
  quoteWalletBalance: number
  mustSettle: boolean
  //isInitialSettle : boolean
}

/*
export interface SmartOrderControllerContext {
  smartOrderType: SmartOrderType;
  targetPrice: number;
  orderSize: number;
  side: "buy" | "sell";
  currentOrders: SmartOrder[];
}
*/

export type SmartOrderControllerEventType =
  | { type: 'WALLET_CONNECTED'; data: string }
  | { type: 'WALLET_DISCONNECTED'; data: string }
  | { type: 'INITIALIZATION_COMPLETE'; data: string }
  | { type: 'BASE_CURRENCY_UPDATED'; data: string }
  | { type: 'QUOTE_CURRENCY_UPDATED'; data: string }
  | { type: 'SETTLE_BALANCES'; data: string }
  | { type: 'SETTLEMENT_COMPLETE'; data: string }
  | { type: 'SETTLEMENT_FAILED'; data: string }
  | { type: 'SETTLE_BALANCES'; data: string }
  | { type: 'ARM'; data: string }
  | { type: 'DISARM'; data: string }
  | { type: 'SET_ORDERTYPE'; data: SmartOrderType }
  | { type: 'BASE_WALLET_BALANCE_UPDATED'; data: number }
  | { type: 'QUOTE_WALLET_BALANCE_UPDATED'; data: number }
  | { type: 'BASE_UNSETTLED_BALANCE_UPDATED'; data: number }
  | { type: 'QUOTE_UNSETTLED_BALANCE_UPDATED'; data: number }
  | { type: 'ENGAGE'; data: string }
  | { type: 'INSIDE_MARKET_UPDATED'; data: string }
  | { type: 'DISENGAGE'; data: string }
  | { type: 'OPEN_ORDERS_UPDATED'; data: Order[] }
  | { type: 'FILLS_UPDATED'; data: any[] }
  | { type: 'ORDER_IS_PLACED'; data: string }
  | { type: 'ORDER_CONFIRMED'; data: string }
  | { type: 'ORDER_CANCELLED'; data: string }
  | { type: 'ORDER_REJECTED'; data: string }
  | { type: 'ORDER_FILLED'; data: number }
  | { type: 'PRICE_TARGET_CHANGED'; data: number }
  | { type: 'CANCEL_ORDER'; data: string }

export type SmartOrderControllerTypeState =
  | { value: 'wallet_disconnected'; context: SmartOrderControllerContext }
  | { value: 'unarmed'; context: SmartOrderControllerContext }
  | { value: 'armed'; context: SmartOrderControllerContext }
  | { value: { armed: 'disengaged' }; context: SmartOrderControllerContext }
  | {
      value: { armed: 'calculating_target_price' }
      context: SmartOrderControllerContext
    }
  | { value: { armed: 'engaged' }; context: SmartOrderControllerContext }
  | {
      value: { engaged: 'out_of_market' }
      context: SmartOrderControllerContext
    }
  | { value: { engaged: 'in_market' }; context: SmartOrderControllerContext }
  | {
      value: { in_market: 'order_placed' }
      context: SmartOrderControllerContext
    }
  | {
      value: { in_market: 'order_active' }
      context: SmartOrderControllerContext
    }
  | {
      value: { in_market: 'cancelling_order' }
      context: SmartOrderControllerContext
    }

export const smartOrderMachine = createMachine<
  SmartOrderControllerContext,
  SmartOrderControllerEventType,
  SmartOrderControllerTypeState
>(
  {
    id: 'SmartOrderController',
    context: {
      orderHistory: [],
      currentOrder: undefined,
      currentPrice: 0,
      side: 'buy',
      size: 0,
      totalFilled: 0,
      isDisengaging: false,
      priceTargetDeltaThreshold: 0.05,
      gotBaseUnsettledBalance: false,
      baseUnsettledBalance: 0,
      gotQuoteUnsettledBalance: false,
      quoteUnsettledBalance: 0,
      gotBaseWalletBalance: false,
      baseWalletBalance: 0,
      gotQuoteWalletBalance: false,
      quoteWalletBalance: 0,
      mustSettle: false,
      //isInitialSettle: true,
    },
    initial: 'wallet_disconnected',
    states: {
      wallet_disconnected: {
        id: 'wallet_disconnected',
        onEntry: 'onWalletDisconnected',
        onExit: 'onWalletConnected',
        on: {
          WALLET_CONNECTED: '#initializing',
          BASE_CURRENCY_UPDATED: {
            actions: 'onBaseCurrencyUpdated',
          },
          QUOTE_CURRENCY_UPDATED: {
            actions: 'onQuoteCurrencyUpdated',
          },
        },
      },
      initializing: {
        id: 'initializing',
        onEntry: 'onEnterInitializing',
        on: {
          BASE_CURRENCY_UPDATED: {
            actions: 'onBaseCurrencyUpdated',
          },
          QUOTE_CURRENCY_UPDATED: {
            actions: 'onQuoteCurrencyUpdated',
          },
          BASE_WALLET_BALANCE_UPDATED: {
            actions: 'initializing_onBaseWalletBalanceUpdated',
          },
          QUOTE_WALLET_BALANCE_UPDATED: {
            actions: 'initializing_onQuoteWalletBalanceUpdated',
          },
          BASE_UNSETTLED_BALANCE_UPDATED: {
            actions: 'initializing_onBaseUnsettledBalanceUpdated',
          },
          QUOTE_UNSETTLED_BALANCE_UPDATED: {
            actions: 'initializing_onQuoteUnsettledBalanceUpdated',
          },
          INITIALIZATION_COMPLETE: '#initialized',
        },
      },
      initialized: {
        id: 'initialized',
        onEntry: 'onEnterInitialized',
        always: [
          { target: '#unarmed', cond: 'hasNoUnsettledBalance' },
          { target: '#settling', cond: 'hasUnsettledBalance' },
        ],
      },
      unarmed: {
        id: 'unarmed',
        onEntry: 'onEnterUnarmed',
        always: {
          target: '#settling',
          cond: 'mustSettle',
        },
        on: {
          SET_ORDERTYPE: 'armed',
          SETTLE_BALANCES: '#settling',
          WALLET_DISCONNECTED: '#wallet_disconnected',
          BASE_CURRENCY_UPDATED: {
            actions: 'onBaseCurrencyUpdated',
          },
          QUOTE_CURRENCY_UPDATED: {
            actions: 'onQuoteCurrencyUpdated',
          },
          BASE_WALLET_BALANCE_UPDATED: {
            actions: 'unarmed_onBaseWalletBalanceUpdated',
          },
          QUOTE_WALLET_BALANCE_UPDATED: {
            actions: 'unarmed_onQuoteWalletBalanceUpdated',
          },
          BASE_UNSETTLED_BALANCE_UPDATED: {
            actions: 'unarmed_onBaseUnsettledBalanceUpdated',
          },
          QUOTE_UNSETTLED_BALANCE_UPDATED: {
            actions: 'unarmed_onQuoteUnsettledBalanceUpdated',
          },
        },
      },
      settling: {
        id: 'settling',
        //initial: "settling",
        onEntry: 'onEnterSettling',
        on: {
          BASE_CURRENCY_UPDATED: {
            actions: 'onBaseCurrencyUpdated',
          },
          QUOTE_CURRENCY_UPDATED: {
            actions: 'onQuoteCurrencyUpdated',
          },
          BASE_WALLET_BALANCE_UPDATED: {
            actions: 'settling_onBaseWalletBalanceUpdated',
          },
          QUOTE_WALLET_BALANCE_UPDATED: {
            actions: 'settling_onQuoteWalletBalanceUpdated',
          },
          BASE_UNSETTLED_BALANCE_UPDATED: {
            actions: 'settling_onBaseUnsettledBalanceUpdated',
          },
          QUOTE_UNSETTLED_BALANCE_UPDATED: {
            actions: 'settling_onQuoteUnsettledBalanceUpdated',
          },
          SETTLEMENT_COMPLETE: '#settled',
          SETTLEMENT_FAILED: '#faulted',
          //WALLET_DISCONNECTED: "#wallet_disconnected",
        },
        states: {
          settled: {
            id: 'settled',
            onEntry: 'onEnterSettled',
            always: {
              actions: assign({
                mustSettle: (context, _event) => (context.mustSettle = false),
              }),
              target: '#unarmed',
            },
          },
        },
      },
      armed: {
        id: 'armed',
        initial: 'ready',
        onEntry: 'startCalculatingTargetPrice',
        onExit: 'stopCalculatingTargetPrice',
        on: {
          DISARM: 'unarmed',
          WALLET_DISCONNECTED: '#wallet_disconnected',
          BASE_CURRENCY_UPDATED: {
            actions: 'onBaseCurrencyUpdated',
          },
          QUOTE_CURRENCY_UPDATED: {
            actions: 'onQuoteCurrencyUpdated',
          },
        },
        states: {
          ready: {
            id: 'ready',
            onEntry: 'onEnterReady',
            on: {
              ENGAGE: '#engaged',
              SET_ORDERTYPE: 'ready',
              INSIDE_MARKET_UPDATED: {
                actions: 'ready_onInsideMarketUpdated',
              },
            },
          },
          engaged: {
            id: 'engaged',
            initial: 'placing_order',
            on: {
              DISENGAGE: 'ready',
            },
            states: {
              placing_order: {
                id: 'placing_order',
                onEntry: 'onEnterPlacingOrder',
                on: {
                  OPEN_ORDERS_UPDATED: {
                    actions: 'placingOrder_onOpenOrdersUpdated',
                  },
                  ORDER_CONFIRMED: 'order_active',
                  BASE_UNSETTLED_BALANCE_UPDATED: {
                    actions: 'placingOrder_onBaseUnsettledBalanceUpdated',
                  },
                  QUOTE_UNSETTLED_BALANCE_UPDATED: {
                    actions: 'placingOrder_onQuoteUnsettledBalanceUpdated',
                  },
                  ORDER_REJECTED: '#order_rejected',
                  FILLS_UPDATED: { actions: 'orderActive_onFillsUpdated' },
                  ORDER_FILLED: {
                    actions: assign({
                      totalFilled: (context, event) =>
                        context.currentOrder?.fillCurrentOrder(event.data) ?? 0,
                    }),
                    target: '#order_partially_filled',
                  },
                },
              },
              order_active: {
                id: 'order_active',
                initial: 'order_unfilled',
                on: {
                  DISENGAGE: {
                    actions: assign({
                      isDisengaging: (context, _event) =>
                        (context.isDisengaging = true),
                    }),
                    target: '#cancel_requested',
                  },
                  FILLS_UPDATED: { actions: 'orderActive_onFillsUpdated' },
                  ORDER_FILLED: {
                    actions: assign({
                      totalFilled: (context, event) =>
                        context.currentOrder?.fillCurrentOrder(event.data) ?? 0,
                    }),
                    target: '#order_partially_filled',
                  },
                },
                states: {
                  order_unfilled: {
                    id: 'order_unfilled',
                    onEntry: 'onEnterOrderUnfilled',
                    on: {
                      INSIDE_MARKET_UPDATED: {
                        actions: 'orderActive_onInsideMarketUpdated',
                      },
                      PRICE_TARGET_CHANGED: '#cancel_requested',
                      SET_ORDERTYPE: '#cancel_requested',
                    },
                  },
                  order_partially_filled: {
                    id: 'order_partially_filled',
                    onEntry: 'onEnterOrderPartiallyFilled',
                    always: {
                      target: '#order_completely_filled',
                      cond: 'orderCompletelyFilled',
                    },
                    on: {
                      INSIDE_MARKET_UPDATED: {
                        actions: 'orderActive_onInsideMarketUpdated',
                      },
                      PRICE_TARGET_CHANGED: '#cancel_requested',
                      SET_ORDERTYPE: '#cancel_requested',
                    },
                  },
                  cancel_requested: {
                    id: 'cancel_requested',
                    onEntry: 'onEnterCancelRequested',
                    invoke: {
                      src: (_context) => (cb) => {
                        const interval = setInterval(() => {
                          cb({
                            type: 'CANCEL_ORDER',
                            data: '',
                          })
                        }, 10000)

                        return () => {
                          clearInterval(interval)
                        }
                      },
                    },
                    on: {
                      OPEN_ORDERS_UPDATED: {
                        actions: 'cancelRequested_onOpenOrdersUpdated',
                      },
                      CANCEL_ORDER: '#cancel_requested',
                      ORDER_CANCELLED: '#order_cancelled',
                    },
                  },
                },
              },
              order_cancelled: {
                id: 'order_cancelled',
                onEntry: 'onEnterOrderCancelled',
                always: [
                  { target: '#unarmed', cond: 'isDisengaging' },
                  { target: '#placing_order', cond: 'isRunning' },
                ],
              },
              order_rejected: {
                id: 'order_rejected',
                onEntry: 'onEnterOrderRejected',
                always: {
                  target: '#placing_order',
                },
              },
              order_completely_filled: {
                id: 'order_completely_filled',
                onEntry: 'onEnterOrderCompletelyFilled',
                always: {
                  target: '#settling',
                },
              },
            },
          },
        },
      },
      faulted: {
        id: 'faulted',
        onEntry: 'onEnterFaulted',
      },
    },
  },
  {
    guards: {
      orderCompletelyFilled: (context, _event) => {
        if (
          context.currentOrder &&
          context.totalFilled === context.currentOrder.size
        )
          return true
        else return false
      },
      isDisengaging: (context, _event) => {
        if (context.isDisengaging) return true
        else return false
      },
      isRunning: (context, _event) => {
        if (context.isDisengaging) return false
        else return true
      },
      mustSettle: (context, _event) => {
        return context.mustSettle
      },
      hasUnsettledBalance: (context, _event) => {
        return (
          context.baseUnsettledBalance > 0 || context.quoteUnsettledBalance > 0
        )
      },
      hasNoUnsettledBalance: (context, _event) => {
        return (
          context.baseUnsettledBalance === 0 &&
          context.quoteUnsettledBalance === 0
        )
      },
    },
  }
)
