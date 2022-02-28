import { Oscillator } from 'tone/build/esm'
// import * as Tone from 'tone/build/esm';
import currency from 'currency.js'
import * as technicalindicators from 'technicalindicators'
import { LocalTradingSession } from '@/modules/TradeSerum/Elements/LocalTradingSession'
import { DepthFinderPresenter } from '@/modules/TradeSerum/Elements/DepthFinder/DepthFinderPresenter'
import { DepthFinderRow } from '@/modules/TradeSerum/Elements/DepthFinder/DepthFinderRow'
import { EventBus } from '../EventBus'

export class VolatilityDrone {
  public oscillators: Array<Oscillator> = new Array<Oscillator>()
  private bassFreq = 20.6
  private rampTime = 0.5
  private volume = -36

  volatilityLevel = 0

  private volatilityHistorySize = 5
  private volatilityHistory: Array<number> = new Array<number>()
  private smoothedVolatility: Array<number> = new Array<number>()

  private maxVolatility = 2.5

  currentPrice: currency = currency(0)
  previousPrice: currency = currency(0)

  private magnitudeAmplifier = 12.5

  private fallOffRate = 0.15
  private fallOffTimeout?: NodeJS.Timeout

  isStarted = false

  constructor(public session: LocalTradingSession) {
    EventBus.Instance.eventHandler.subscribe((p, r) => {
      if (r === 'LOCAL_MIC_ACTIVE') {
        this.pause()
      } else if (r === 'LOCAL_MIC_MUTED') {
        this.resume()
      }
    })
  }

  public start() {
    if (!this.isStarted) {
      //Tone.start();
      this.session.presenter.onAddedNewRow.subscribe(
        this.evaluateMarket.bind(this)
      )
      this.fallOffTimeout = setInterval(
        this.fallOff.bind(this),
        500,
        this
      ) as NodeJS.Timeout
      this.isStarted = true
    }
  }

  public stop() {
    if (this.isStarted) {
      this.oscillators.forEach((o) => {
        o.stop('+1.2')
        o.volume.rampTo(-Infinity, 1)
      })

      this.session.presenter.onAddedNewRow.unsubscribe(this.evaluateMarket)
      this.isStarted = false
    }
  }

  public pause() {
    if (this.isStarted) {
      this.oscillators.forEach((o) => {
        o.stop('+1.2')
        o.volume.rampTo(-Infinity, 1)
      })
    }
  }

  public resume() {
    if (this.isStarted) {
      this.oscillators.forEach((o) => {
        o.start()
        o.volume.rampTo(this.volume, 1)
      })
    }
  }

  public rampTo(volatilityLevel: number, _time: number) {
    if (volatilityLevel >= 0 && volatilityLevel <= this.maxVolatility) {
      this.oscillators.forEach((osc, i) => {
        osc.frequency.rampTo(
          this.bassFreq * i + this.bassFreq * i * volatilityLevel,
          this.rampTime
        )
      })
    }
  }

  private evaluateMarket(
    presenter: DepthFinderPresenter,
    _row: DepthFinderRow
  ) {
    if (this.oscillators.length === 0) {
      for (let i = 0; i < 8; i++) {
        this.oscillators.push(
          new Oscillator({
            frequency: this.bassFreq * i,
            type: 'sawtooth8',
            volume: -Infinity,
            detune: Math.random() * 10,
          }).toDestination()
        )
      }

      this.oscillators.forEach((o) => {
        o.start()
        o.volume.rampTo(this.volume, 1)
      })
    }

    const newMidprice: currency = presenter.midPrice
    this.previousPrice = this.currentPrice
    this.currentPrice = newMidprice

    if (this.previousPrice.value !== 0) {
      this.calculateVolatility()
    }
  }

  private calculateVolatility() {
    const rateOfChange: number =
      (this.currentPrice.value / this.previousPrice.value - 1) * 100

    if (rateOfChange !== 0) {
      const rateOfChangeMagnitude: number = Math.abs(rateOfChange)

      if (this.volatilityLevel < this.maxVolatility) {
        this.volatilityLevel += rateOfChangeMagnitude * this.magnitudeAmplifier
        this.volatilityLevel = Math.min(
          this.volatilityLevel,
          this.maxVolatility
        )
        this.volatilityHistory.unshift(this.volatilityLevel)

        if (this.volatilityHistory.length > this.volatilityHistorySize) {
          this.volatilityHistory = this.volatilityHistory.splice(
            0,
            this.volatilityHistorySize
          )
        }

        this.smoothedVolatility = technicalindicators.SMA.calculate({
          period: 5,
          values: this.volatilityHistory,
          reversedInput: false,
        })
        const currentSmoothedVolatilty: number = this.smoothedVolatility[0]
        this.rampTo(currentSmoothedVolatilty, 0.5)
      }
    }
  }

  private fallOff() {
    if (this.volatilityLevel > this.fallOffRate) {
      this.volatilityLevel -= this.fallOffRate
    } else {
      this.volatilityLevel = 0
    }
    this.rampTo(this.volatilityLevel, 0.5)
  }
}
