import { MarketSide } from '../Enums'
import { QuoteBucket } from './QuoteBucket'
import BTree from 'sorted-btree'

export class BucketedOrderBook {
  public bidBuckets: BTree<number, QuoteBucket> = new BTree<
    number,
    QuoteBucket
  >()
  public askBuckets: BTree<number, QuoteBucket> = new BTree<
    number,
    QuoteBucket
  >()

  public insideBid?: QuoteBucket
  public insideAsk?: QuoteBucket

  public numEntriesPerSideToSerialize = 30

  getEntries(side: MarketSide): QuoteBucket[] {
    if (side === MarketSide.Bid) {
      return this.bidBuckets.valuesArray().reverse()
    } else {
      return this.askBuckets.valuesArray()
    }
  }

  getEntry(side: MarketSide, depth: number): QuoteBucket {
    return this.getEntries(side)[depth]
  }

  public serialize(): string {
    if (this.insideBid) {
      let bucketsAsString = ''
      const bidBucketArray: QuoteBucket[] = this.getEntries(MarketSide.Bid)

      for (let i = 0; i < this.numEntriesPerSideToSerialize; i++) {
        const bucket: QuoteBucket = bidBucketArray[i]

        if (bucket) {
          bucketsAsString += bidBucketArray[i].insidePrice.value.toFixed(2)
          bucketsAsString += ','
          bucketsAsString += bidBucketArray[i].quantity.toFixed(2)
        }

        if (i < this.numEntriesPerSideToSerialize - 1) bucketsAsString += '/'
      }
      bucketsAsString += ':'
      const askBucketArray: QuoteBucket[] = this.getEntries(MarketSide.Ask)

      for (let i = 0; i < this.numEntriesPerSideToSerialize; i++) {
        const bucket: QuoteBucket = askBucketArray[i]

        if (bucket) {
          bucketsAsString += askBucketArray[i].insidePrice.value.toFixed(2)
          bucketsAsString += ','
          bucketsAsString += askBucketArray[i].quantity.toFixed(2)

          if (i < this.numEntriesPerSideToSerialize - 1) bucketsAsString += '/'
        }
      }

      return bucketsAsString
    }

    return '---'
  }
}
