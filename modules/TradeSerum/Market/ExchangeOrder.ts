import { IExchangeOrder } from '../TradeSerumInterface'
import { OrderSide, OrderState, OrderType } from '../Enums'
import currency from 'currency.js'

export class ExchangeOrder implements IExchangeOrder {
  constructor(
    public side: OrderSide,
    public quantity: number,
    public price: currency,
    public state: OrderState,
    public time: number,
    public id: number,
    public type: OrderType = OrderType.LimitOrder
  ) {}
}
