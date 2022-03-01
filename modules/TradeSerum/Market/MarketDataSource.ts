import { MarketDataSampler } from './MarketDataSampler'

export class MarketDataSource {
  //implements IMarketDataSource
  sampler?: MarketDataSampler
  useWebSocket = false

  exchange = ''

  constructor(public symbol: string) {
    //Logger.log("Constructing Orderbook Feed");
  }

  setSampler(sampler: MarketDataSampler): void {
    this.sampler = sampler
  }

  loadTrades(): Promise<void> {
    throw new Error('Implement in subclass')
  }

  loadBook(): Promise<void> {
    throw new Error('Implement in subclass')
  }

  loadCandles(): void {
    throw new Error('Implement in subclass')
  }

  openOrderBookFeed(): void {
    throw new Error('Implement in subclass')
  }

  closeOrderBookFeed(): void {
    throw new Error('Implement in subclass')
  }

  openTradesFeed(): void {
    throw new Error('Implement in subclass')
  }

  closeTradesFeed(): void {
    throw new Error('Implement in subclass')
  }

  processUpdate(): void {
    throw new Error('Implement in subclass')
  }

  refresh(): void {
    throw new Error('Implement in subclass')
  }

  createTrade(): void {}

  updateExchangeSource() {
    // throw new Error("Implement in subclass");
  }

  setExchangeInfo(_dataSource: string, _exchangePair: string) {
    // throw new Error("Implement in subclass");
  }
}
