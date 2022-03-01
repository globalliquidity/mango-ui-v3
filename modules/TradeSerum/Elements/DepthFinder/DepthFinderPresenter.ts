import * as bjs from '@babylonjs/core/Legacy/legacy'
import currency from 'currency.js'
import { EventDispatcher } from 'strongly-typed-events'
import { GLSGColor } from '@/modules/SceneGraph/Enums'
import { MarketSide } from '@/modules/TradeSerum/Enums'
import { VectorFieldLayerType } from '@/modules/SceneGraph/Enums'
import { VectorFieldCell } from '@/modules/SceneGraph/VectorFieldCell'
import { VectorFieldLayer } from '@/modules/SceneGraph/VectorFieldLayer'
import { VectorFieldPresenter } from '@/modules/SceneGraph/VectorFieldPresenter'
import { VectorFieldRow } from '@/modules/SceneGraph/VectorFieldRow'
import { DepthFinderRow } from './DepthFinderRow'
import { PriceDivisionSetting } from '@/modules/TradeSerum/PriceDivision/PriceDivisionSetting'
import { PriceDivisionManager } from '@/modules/TradeSerum/PriceDivision/PriceDivisionManager'
import { LocalTradingSession } from '../LocalTradingSession'
import { OrderBookEntry } from '@/modules/TradeSerum/Market/OrderBookEntry'
import {
  MarketDataUpdate,
  MarketDataClient,
} from '@/modules/TradeSerum/Market/MarketDataClient'
// import { AudioSequencer } from '@/modules/SceneGraph/Audio/AudioSequencer';
import Logger from '@/modules/SceneGraph/Logger'
// import { PresenterUpdateMessage } from '@/modules/SceneGraph/PresenterUpdateMessage';
import { DepthFinderUpdateMessage } from './DepthFinderUpdateMessage'
// import { MarketDataSample } from '../../Market/MarketDataSample';

export class DepthFinderPresenter extends VectorFieldPresenter {
  public currentMarketDataUpdate: MarketDataUpdate | undefined = undefined
  public originPrice: currency = currency(0)
  public midPrice: currency = currency(0)
  public spread: currency = currency(0)
  public insideBid: OrderBookEntry | undefined
  public insideAsk: OrderBookEntry | undefined
  public orderImbalance = 0
  public currentGeneration = 0

  public gridOriginOffsetX = 0
  public cellWidth = 0.5

  private _addedNewRow = new EventDispatcher<
    DepthFinderPresenter,
    DepthFinderRow
  >()
  private _removedLastRow = new EventDispatcher<
    DepthFinderPresenter,
    DepthFinderRow
  >()
  private _clearLayerPlotter = new EventDispatcher<
    DepthFinderPresenter,
    VectorFieldLayerType
  >()

  isReady = false
  isStopped = false

  numTradesRemoved = 0

  isAddingRow = false

  tradingSession: LocalTradingSession | undefined

  getMarketUpdateIntervalTimeout?: NodeJS.Timeout

  //midPriceChannel : Ably.Types.RealtimeChannelCallbacks | undefined

  get onAddedNewRow() {
    return this._addedNewRow.asEvent()
  }

  get onRemovedLastRow() {
    return this._removedLastRow.asEvent()
  }

  get onClearLayerPlotter() {
    return this._clearLayerPlotter.asEvent()
  }

  constructor(public rowCount: number, public columnCount: number) {
    super(rowCount, columnCount)
    const currentPriceDivisionSetting =
      PriceDivisionManager.Instance.currentPriceDivisionSetting

    if (currentPriceDivisionSetting) {
      this.originPrice = currency(0, {
        precision: currentPriceDivisionSetting.numDecimalPlaces,
      })
      this.midPrice = currency(0, {
        precision: currentPriceDivisionSetting.numDecimalPlaces,
      })
      this.spread = currency(0, {
        precision: currentPriceDivisionSetting.numDecimalPlaces,
      })

      PriceDivisionManager.Instance.onPriceDivsionChanged.subscribe(
        (_p, _r) => {
          const currentPriceDivisionSetting =
            PriceDivisionManager.Instance.currentPriceDivisionSetting

          if (currentPriceDivisionSetting) {
            const multipler =
              currentPriceDivisionSetting.priceDivisionMultiplier.value
            const division = currentPriceDivisionSetting.columnPriceRange?.value

            if (division) {
              this.originPrice = this.quantizePrice(this.originPrice)
              this.gridOriginOffsetX =
                (this.originPrice.value -
                  Math.floor(this.originPrice.value / (division * 10)) *
                    (division * 10)) *
                multipler
            }
          }
        }
      )
    }
  }

  getRow(rowIndex: number): DepthFinderRow | undefined {
    if (rowIndex >= 0 && rowIndex < this.rows.length) {
      return this.rows[rowIndex] as DepthFinderRow
    }
    return undefined
  }

  getCurrentRow(): DepthFinderRow | undefined {
    //let row : Vec
    return this.getRow(0)
  }

  // getMarketUpdate()
  // {
  //     let marketDataUpdate : MarketDataUpdate | undefined = MarketDataClient.Instance.getCurrentUpdate();

  //     if ((marketDataUpdate != undefined) && (marketDataUpdate.bids.length > 0 || marketDataUpdate.asks.length > 0))
  //     {
  //         this.currentMarketDataUpdate = marketDataUpdate;
  //         this.midPrice = marketDataUpdate.midPrice;

  //         const bidQuantity = (marketDataUpdate.bids[0] === undefined) ? 0 : marketDataUpdate.bids[0].quantity;
  //         const askQuantity = (marketDataUpdate.asks[0] === undefined) ? 0 : marketDataUpdate.asks[0].quantity;

  //         this.insideBid = new OrderBookEntry(MarketSide.Bid,marketDataUpdate.insideBidPrice,bidQuantity);
  //         this.insideAsk = new OrderBookEntry(MarketSide.Ask,marketDataUpdate.insideAskPrice,askQuantity);

  //         //Logger.log("Depth Finder Presenter  | Inside Bid : " + this.insideBid.price.format() + " Inside Ask : " + this.insideAsk.price.format())

  //         this.isAddingRow = true;
  //         this.addRowToPresenter( this.midPrice,marketDataUpdate);
  //         this._addedNewRow.dispatch(this, this.rows[0] as DepthFinderRow);
  //         this.currentGeneration++;
  //         this.isAddingRow = false;

  //     }
  //     //MarketDataClient.Instance.clearCurrentUpdate();

  // }

  public processMessage(message: DepthFinderUpdateMessage): void {
    const marketDataSample = message.sample

    if (marketDataSample) {
      const marketDataUpdate: MarketDataUpdate | undefined =
        new MarketDataUpdate(
          marketDataSample.midPrice,
          marketDataSample.insideBidPrice,
          marketDataSample.insideAskPrice
        )

      marketDataUpdate.asks = marketDataSample.orders.asks
      marketDataUpdate.bids = marketDataSample.orders.bids
      marketDataUpdate.trades = marketDataSample.trades.trades

      MarketDataClient.Instance.setCurrentUpdate(marketDataUpdate)

      if (
        marketDataUpdate !== undefined &&
        (marketDataUpdate.bids.length > 0 || marketDataUpdate.asks.length > 0)
      ) {
        this.currentMarketDataUpdate = marketDataUpdate
        this.midPrice = marketDataUpdate.midPrice

        const bidQuantity =
          marketDataUpdate.bids[0] === undefined
            ? 0
            : marketDataUpdate.bids[0].quantity
        const askQuantity =
          marketDataUpdate.asks[0] === undefined
            ? 0
            : marketDataUpdate.asks[0].quantity

        this.insideBid = new OrderBookEntry(
          MarketSide.Bid,
          marketDataUpdate.insideBidPrice,
          bidQuantity
        )
        this.insideAsk = new OrderBookEntry(
          MarketSide.Ask,
          marketDataUpdate.insideAskPrice,
          askQuantity
        )

        //Logger.log("Depth Finder Presenter  | Inside Bid : " + this.insideBid.price.format() + " Inside Ask : " + this.insideAsk.price.format())

        this.isAddingRow = true
        this.addRowToPresenter(this.midPrice, marketDataUpdate)
        this._addedNewRow.dispatch(this, this.rows[0] as DepthFinderRow)
        this.currentGeneration++
        this.isAddingRow = false
      }
    }
  }

  public clearRows() {
    this.rows = []
  }

  public stop() {
    this.isStopped = true
    this.isReady = false
    this.currentGeneration = 0
    this.gridOriginOffsetX = 0
    this.numTradesRemoved = 0
    this.isAddingRow = false
    if (this.getMarketUpdateIntervalTimeout)
      clearInterval(this.getMarketUpdateIntervalTimeout)
    this.clearRows()
  }

  public start(updateInterval: number) {
    Logger.log(
      'DepthFinderPresenter        |   Init        | Update Interval: ' +
        updateInterval
    )

    this.isStopped = false
    // this.getMarketUpdateIntervalTimeout = setInterval(this.getMarketUpdate.bind(this), updateInterval, this);
  }

  /*
    redrawRows(samples: MarketDataSample[]) {
        this.isAddingRow = true;

        for (let i = 0; i < samples.length; i++) {
            this.addRowToPresenter(samples[i]);
        }

        this.isAddingRow = false;
    }
    */

  protected addRowToPresenter(
    midPrice: currency,
    marketDataUpdate: MarketDataUpdate
  ) {
    if (marketDataUpdate.bids.length > 0) {
      let newRowStartingIndex = 0
      newRowStartingIndex =
        (this.currentGeneration % this.rowCount) * this.columnCount

      if (this.rows.length === this.rowCount - 1) {
        const lastRow: DepthFinderRow = this.removeLastRow()

        if (lastRow) {
          const layer: VectorFieldLayer | undefined = lastRow.getLayer(
            VectorFieldLayerType.TradeReport
          )

          if (layer) {
            this.numTradesRemoved += layer.cellsByIndex.size
            this._removedLastRow.dispatch(this, lastRow)
          }
        }
      }

      const row: DepthFinderRow = new DepthFinderRow(
        this,
        this.columnCount,
        0,
        this.currentGeneration,
        newRowStartingIndex
      )

      //let orderBook :

      //this.midPrice = this.quantizePrice(sample.midPrice); //Math.floor((sample.midPrice * priceQuantizeScalingFactor)) / priceQuantizeScalingFactor;
      //this.spread = sample.spread;

      row.insideBidPrice = marketDataUpdate.insideBidPrice
      row.insideAskPrice = marketDataUpdate.insideAskPrice
      row.midPrice = midPrice

      let currentRowOffset = 0

      const currentPriceDivisionSetting =
        PriceDivisionManager.Instance.currentPriceDivisionSetting

      if (currentPriceDivisionSetting) {
        if (this.originPrice?.value === 0) {
          Logger.log(
            'DepthFinderPresenter : Setting Origin Price to : ' + midPrice
          )
          this.originPrice = midPrice

          const multipler =
            currentPriceDivisionSetting.priceDivisionMultiplier.value
          const division = currentPriceDivisionSetting.columnPriceRange?.value

          if (division) {
            this.gridOriginOffsetX =
              (this.originPrice.value -
                Math.floor(this.originPrice.value / (division * 10)) *
                  (division * 10)) *
              multipler
            currentRowOffset = 0
          }
        } else {
          const midPriceDistanceFromOrigin: currency = this.midPrice.subtract(
            this.originPrice
          )
          currentRowOffset =
            this.quantizePrice(midPriceDistanceFromOrigin).value *
            currentPriceDivisionSetting.priceDivisionMultiplier.value
        }

        row.positionOffsetX = currentRowOffset

        this.addOrderBookToRow(marketDataUpdate, row)

        if (marketDataUpdate.trades.length > 0)
          this.addTradeReportsToRow(marketDataUpdate, row)
        //this.addUserActivityToRow(sample, row);
        this.addRowToFront(row)

        row.insideBidOffsetX = this.offsetForPrice(row.insideBidPrice)
        row.insideAskOffsetX = this.offsetForPrice(row.insideAskPrice)

        if (!this.isReady) this.isReady = true
      }
    }
  }

  protected addOrderBookToRow(
    marketDataUpdate: MarketDataUpdate,
    row: DepthFinderRow
  ) {
    const orderBookLayer: VectorFieldLayer = new VectorFieldLayer(
      row,
      this.columnCount,
      row.startingIndex
    )

    row.addLayer(VectorFieldLayerType.OrderBook, orderBookLayer)

    if (orderBookLayer) {
      //Logger.log("DepthFinderPresenter : Adding Row To Order Book");
      const currentPriceDivisionSetting =
        PriceDivisionManager.Instance.currentPriceDivisionSetting

      if (currentPriceDivisionSetting) {
        for (let i = 0; i < row.cellCount; i++) {
          // let cellSide: MarketSide = MarketSide.Bid;
          let cellColor: GLSGColor = GLSGColor.Purple
          let cellOffsetX = 0
          let cellScaleY = 0
          let orderBookIndex = 0
          let orderBookEntry: OrderBookEntry

          let isCellInRange = true

          if (i < row.cellCount / 2) {
            orderBookEntry = marketDataUpdate.bids[i]

            if (
              orderBookEntry &&
              orderBookEntry.price &&
              Math.abs(this.midPrice.value - orderBookEntry.price.value) < 50
            ) {
              // cellSide = MarketSide.Bid;
              cellColor = GLSGColor.SkyBlue
              //orderBookIndex =  (row.cellCount / 2) - i - 1;
              cellOffsetX =
                -this.midPrice.subtract(orderBookEntry.price) *
                currentPriceDivisionSetting.priceDivisionMultiplier.value
              cellScaleY = orderBookEntry.quantity
            } else {
              isCellInRange = false
            }
          } else {
            orderBookIndex = i - row.cellCount / 2
            orderBookEntry = marketDataUpdate.asks[orderBookIndex]

            if (
              orderBookEntry &&
              orderBookEntry.price &&
              Math.abs(orderBookEntry.price.value - this.midPrice.value) < 50
            ) {
              // cellSide = MarketSide.Ask;
              cellColor = GLSGColor.HotPink
              cellOffsetX =
                orderBookEntry.price.subtract(this.midPrice).value *
                currentPriceDivisionSetting.priceDivisionMultiplier.value
              cellScaleY = orderBookEntry.quantity
            } else {
              isCellInRange = false
            }
          }

          if (isCellInRange) {
            const cell: VectorFieldCell = new VectorFieldCell(
              VectorFieldLayerType.OrderBook
            )
            cell.price = orderBookEntry.price
            cell.height = cellScaleY
            cell.positionOffset = new bjs.Vector2(cellOffsetX, cellScaleY / 2)
            cell.color = cellColor
            orderBookLayer.addCell(cell.price, cell)
          }
        }
      }
    }
  }

  protected addTradeReportsToRow(
    marketDataUpdate: MarketDataUpdate,
    row: DepthFinderRow
  ) {
    let startingIndex = 0

    if (this.currentGeneration > 0) {
      const layer: VectorFieldLayer | undefined = this.getCurrentRowLayer(
        VectorFieldLayerType.TradeReport
      )

      if (layer) startingIndex = layer.currentIndex
    }

    const tradeReportLayer: VectorFieldLayer = new VectorFieldLayer(
      row,
      this.columnCount,
      startingIndex
    )

    row.addLayer(VectorFieldLayerType.TradeReport, tradeReportLayer)

    if (tradeReportLayer) {
      // let numUpTrades : number = 0;
      // let numDownTrades : number = 0;

      //Logger.log("DepthFinderPresenter    |   Trades Length : " + marketDataUpdate.trades.length);
      //Logger.log("DepthFinderPresenter    |   Trades : " + marketDataUpdate.trades[0].price);

      const currentPriceDivisionSetting: PriceDivisionSetting | undefined =
        PriceDivisionManager.Instance.currentPriceDivisionSetting

      if (currentPriceDivisionSetting) {
        marketDataUpdate.trades.forEach((trade) => {
          //Make a new cell to add to the layer
          const cell: VectorFieldCell = new VectorFieldCell(
            VectorFieldLayerType.TradeReport
          )

          let cellOffsetX = 0
          //Compare the trade price with the current mid price.
          //Mark all trades above the mid price as buys.
          //Set the cell offset x to be the normalized units away from the middle of this row.
          if (trade.price > marketDataUpdate.midPrice) {
            // numUpTrades ++;
            cell.color = GLSGColor.Green

            if (currentPriceDivisionSetting)
              cellOffsetX =
                trade.price.subtract(marketDataUpdate.midPrice).value *
                currentPriceDivisionSetting.priceDivisionMultiplier.value
          } else {
            // numDownTrades ++;
            cell.color = GLSGColor.Red
            if (currentPriceDivisionSetting)
              cellOffsetX =
                -marketDataUpdate.midPrice.subtract(trade.price).value *
                currentPriceDivisionSetting.priceDivisionMultiplier.value
          }

          cell.height = trade.quantity
          cell.price = trade.price

          const orderBookCell = row.getCellByPrice(
            VectorFieldLayerType.OrderBook,
            cell.price
          )

          let positionOffsetY = 0

          if (orderBookCell) {
            positionOffsetY += orderBookCell.height
          }

          cell.positionOffset = new bjs.Vector2(cellOffsetX, positionOffsetY)
          tradeReportLayer.addCell(cell.price, cell)
        })
      }
    }
  }

  updateCurrentRow(
    layerType: VectorFieldLayerType,
    _side: MarketSide,
    price: currency,
    quantity: number
  ) {
    if (!this.isAddingRow) {
      const layer = this.getCurrentRowLayer(layerType)

      if (layer) {
        // let cell : VectorFieldCell;
        // let cellOffsetX = 0;

        const cell: VectorFieldCell | undefined = layer.getCellByPrice(price)

        if (cell !== undefined) {
          cell.height = quantity
        }
      }
    }
  }

  //Remove Last Row and return the number of particles that were in the row.
  public removeLastRow(): DepthFinderRow {
    const backRow: DepthFinderRow = this.rows.pop() as DepthFinderRow
    return backRow
  }

  public getNewRowFromBack(): DepthFinderRow {
    const backRow: DepthFinderRow = this.rows.pop() as DepthFinderRow
    backRow.initialize()
    return backRow
  }

  public addRowToFront(row: DepthFinderRow) {
    this.rows.unshift(row)
    //Logger.log("DepthFinderPresent : added row to front");
  }

  getLayerByIndex(
    layer: VectorFieldLayerType,
    index: number
  ): VectorFieldLayer | undefined {
    //Logger.log("DepthFinderPresenter : Get Layer By Index : " + index);
    for (let i = 0; i < this.rows.length; i++) {
      const row: VectorFieldRow = this.rows[i]

      if (row) {
        const targetLayer: VectorFieldLayer | undefined = row.getLayer(layer)

        if (targetLayer) {
          let adjustedIndex: number = index

          if (layer === VectorFieldLayerType.TradeReport) {
            adjustedIndex -= this.numTradesRemoved
          }

          if (
            targetLayer.startingIndex <= adjustedIndex &&
            targetLayer.endingIndex >= adjustedIndex
          ) {
            return targetLayer as VectorFieldLayer
          }
        }
      }
    }
  }

  quantizePrice(price: currency, _side?: MarketSide): currency {
    // let quantizeMultiplier: number = this.priceQuantizeDivision.priceDivisionMultiplier.value;
    const priceRange: currency | undefined =
      PriceDivisionManager.Instance.currentPriceDivisionSetting
        ?.columnPriceRange

    if (priceRange) {
      const decimalPlaceCount =
        PriceDivisionManager.Instance.currentPriceDivisionSetting
          ?.numDecimalPlaces
      const quantizedPrice: currency = currency(
        price.divide(priceRange.value).multiply(priceRange.value),
        { precision: decimalPlaceCount }
      )
      return quantizedPrice
    } else {
      return currency(0)
    }
  }

  calculateNumDecimalPlaces(priceQuantizeDivision?: number) {
    if (!priceQuantizeDivision) return 0

    let n: number = priceQuantizeDivision
    let s = n.toString()
    s = s.length > 8 ? s.substring(0, 8) : s
    n = +s

    if (n % 1 > 0) {
      const nS = n.toString().split('.')
      return nS[1].length > 6 ? 6 : nS[1].length
    }

    return 2
  }

  offsetForPrice(price: currency): number {
    const currentRow = this.getCurrentRow() as DepthFinderRow

    if (currentRow) {
      const priceQuantizeScalingFactor =
        PriceDivisionManager.Instance.currentPriceDivisionSetting
          ?.priceDivisionMultiplier.value

      if (priceQuantizeScalingFactor) {
        const distanceFromMidPrice: number = price.subtract(this.midPrice).value
        const currentRowOffset: number = currentRow.positionOffsetX
        const cellOffset: number =
          distanceFromMidPrice * priceQuantizeScalingFactor
        return currentRowOffset + cellOffset
      }
    }
    return 0
  }
}
