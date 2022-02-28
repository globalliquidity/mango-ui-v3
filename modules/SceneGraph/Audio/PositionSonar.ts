import * as Tone from 'tone/build/esm'
import { LocalTradingSession } from '@/modules/TradeSerum/Elements/LocalTradingSession'
import { DepthFinderPresenter } from '@/modules/TradeSerum/Elements/DepthFinder/DepthFinderPresenter'
import { DepthFinderRow } from '@/modules/TradeSerum/Elements/DepthFinder/DepthFinderRow'
import currency from 'currency.js'
import { Trade } from '@/modules/TradeSerum/Market/Trade'
import { Scene } from '../Scene'
import { EventBus } from '../EventBus'
import { LocalTradingSessionElement } from '@/modules/TradeSerum/Elements/LocalTradingSessionElement'
export class PositionSonar extends LocalTradingSessionElement {
  currentPnL: currency = currency(0)
  previousPnL: currency = currency(0)
  currentTrade?: Trade
  synth?: Tone.PolySynth
  unsubscribeFunction: any
  winNotes: string[] = ['G5', 'A5', 'B5', 'C6', 'D6']
  lossNotes: string[] = ['B3', 'A3', 'G3', 'F3', 'E3']

  consecutiveWins = 0
  consecutiveLosses = 0

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public session: LocalTradingSession
  ) {
    super(name, x, y, z, scene, session)
    this.initialize()
  }

  initialize() {
    EventBus.Instance.eventHandler.subscribe((p, r) => {
      if (r === 'TRADE_OPENED') {
        this.start()
      } else if (r === 'TRADE_CLOSED') {
        this.stop()
      }
    })
  }

  public start() {
    this.createSynth()
    this.unsubscribeFunction = this.session.presenter.onAddedNewRow.subscribe(
      this.evaluateMarket.bind(this)
    )
  }

  public stop() {
    this.session.presenter.onAddedNewRow.unsub(this.evaluateMarket)
  }

  evaluateMarket(_presenter: DepthFinderPresenter, _row: DepthFinderRow) {
    if (this.session.hasOpenTrade) {
      if (this.synth) this.synth.volume.value = 1
      this.previousPnL = this.currentPnL
      this.currentPnL = this.session.openPnL

      const pnlDelta: number = this.currentPnL.value - this.previousPnL.value

      if (pnlDelta > 10) {
        this.consecutiveLosses = 0
        this.synth?.triggerAttackRelease(
          this.winNotes[
            Math.min(this.winNotes.length - 1, this.consecutiveWins)
          ],
          '+0',
          0.25
        )
        this.consecutiveWins++
      } else if (pnlDelta < -10) {
        this.consecutiveWins = 0
        this.synth?.triggerAttackRelease(
          this.lossNotes[
            Math.min(this.lossNotes.length - 1, this.consecutiveLosses)
          ],
          '+0',
          0.25
        )
        this.consecutiveLosses++
      }
    } else {
      if (this.synth) {
        this.synth.volume.value = 0
        this.synth.dispose()
      }
    }
  }

  private createSynth() {
    this.synth = new Tone.PolySynth(Tone.MonoSynth, {
      volume: -8,
      oscillator: {
        type: 'square8',
      },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.4,
        release: 0.8,
      },
      filterEnvelope: {
        attack: 0.001,
        decay: 0.7,
        sustain: 0.1,
        release: 0.8,
        baseFrequency: 300,
        octaves: 4,
      },
    }).toDestination()
  }
}
