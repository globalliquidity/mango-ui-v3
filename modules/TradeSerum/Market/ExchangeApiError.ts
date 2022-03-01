import { IExchangeApiError } from '../TradeSerumInterface'

export class ExchangeApiError implements IExchangeApiError {
  constructor(public code: number, public message: string) {}
}
