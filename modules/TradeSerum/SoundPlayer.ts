import Logger from '@/modules/SceneGraph/Logger'
import * as Tone from 'tone/build/esm'
import { AudioClip } from '@/modules/SceneGraph/Audio/AudioClip'
import OnlineAssets from '@/assets/OnlineAssets'
import { Player } from 'tone/build/esm'
import { SettingsManager } from './SettingsManager'

export enum TradeSounds {
  ENGAGE,
  DISENGAGE,
  SYNCHRONIZING,
  TRADE_WIN,
  TRADE_LOSS,
  TRADE_WIN_SMALL,
  TRADE_LOSS_SMALL,
  ENTER_TRADE_LONG,
  ENTER_TRADE_SHORT,
  PLAYER_JOIN,
  GEM_COUNT_INCREASING,
  GEM_COUNT_DECREASING,
  LOBBY_MUSIC,
  MARKET_MOVES_UP_ONE,
  MARKET_MOVES_UP_TEN,
  MARKET_MOVES_DOWN_ONE,
  MARKET_MOVES_DOWN_TEN,
  POPUP_OPEN,
  POPUP_CLOSE,
  BUTTON_CLICK,
  SELECT_UP,
  SELECT_DOWN,
  PROGRESS_LOOP,
  PROGRESS_COMPLETE,
  PURCHASE_COMPLETE,
  COUNTDOWN_FIVE,
  COUNTDOWN_FOUR,
  COUNTDOWN_THREE,
  COUNTDOWN_TWO,
  COUNTDOWN_ONE,
  COUNTDOWN_TRADE,
  JOIN_ROUND,
  LEAVE_ROUND,
  POSITION_UP_TICK,
  POSITION_DOWN_TICK,
  PLAYER_TAKES_GEM,
  PLAYER_FORFEITS_GEM,
  ORDER_PLACED,
  ORDER_PLACED_PROGRESS,
  ORDER_CONFIRMED,
  ORDER_CANCEL_REQUESTED,
  SETTLING_FUNDS,
}

export class SoundPlayer {
  private static _instance: SoundPlayer

  private masterVolume = 0
  private musicVolume = -12

  private sounds: Map<TradeSounds, AudioClip> = new Map<
    TradeSounds,
    AudioClip
  >()

  musicPlayer?: Player

  isLoaded = false
  audioIsEnabled = true

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this())
  }

  private constructor() {}

  public intialize() {
    if (!this.isLoaded) {
      Logger.log('SoundPlayer : initialize')
      this.loadSounds()
      Tone.start()
      this.isLoaded = true
      SettingsManager.Instance.onEnableAudio.subscribe((isEnabled: boolean) => {
        this.audioIsEnabled = isEnabled
      })
    }
  }

  public loadSounds() {
    const engagedSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavEngageSound
    )
    this.sounds.set(TradeSounds.ENGAGE, engagedSound)

    const disengageSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavDisengageSound
    )
    this.sounds.set(TradeSounds.DISENGAGE, disengageSound)

    const tradeWinSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavTradeWinSound
    )
    this.sounds.set(TradeSounds.TRADE_WIN, tradeWinSound)

    const tradeLossSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavTradeLossSound
    )
    this.sounds.set(TradeSounds.TRADE_LOSS, tradeLossSound)

    const tradeWinSmallSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.TradeWinSmall
    )
    this.sounds.set(TradeSounds.TRADE_WIN_SMALL, tradeWinSmallSound)

    const tradeLossSmallSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.TradeLossSmall
    )
    this.sounds.set(TradeSounds.TRADE_LOSS_SMALL, tradeLossSmallSound)

    const enterTradeLongSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavBidFillSound
    )
    this.sounds.set(TradeSounds.ENTER_TRADE_LONG, enterTradeLongSound)

    const enterTradeShortSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavAskFillSound
    )
    this.sounds.set(TradeSounds.ENTER_TRADE_SHORT, enterTradeShortSound)

    const playerJoinSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavPlayerJoinSound
    )
    this.sounds.set(TradeSounds.PLAYER_JOIN, playerJoinSound)

    const gemCountIncreasingSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavTradeSoundF4
    )
    this.sounds.set(TradeSounds.GEM_COUNT_INCREASING, gemCountIncreasingSound)

    const gemCountDecreasingSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavTradeSoundE4
    )
    this.sounds.set(TradeSounds.GEM_COUNT_DECREASING, gemCountDecreasingSound)

    const marketMovesUpOneSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavMarketMovesUpOne
    )
    this.sounds.set(TradeSounds.MARKET_MOVES_UP_ONE, marketMovesUpOneSound)

    const marketMovesDownOneSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavMarketMovesDownOne
    )
    this.sounds.set(TradeSounds.MARKET_MOVES_DOWN_ONE, marketMovesDownOneSound)

    const marketMovesUpTenSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavMarketMovesUpTen
    )
    this.sounds.set(TradeSounds.MARKET_MOVES_UP_TEN, marketMovesUpTenSound)

    const marketMovesDownTenSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavMarketMovesDownTen
    )
    this.sounds.set(TradeSounds.MARKET_MOVES_DOWN_TEN, marketMovesDownTenSound)

    const popupOpenSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavPopupOpen
    )
    this.sounds.set(TradeSounds.POPUP_OPEN, popupOpenSound)

    const popupCloseSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavPopupClose
    )
    this.sounds.set(TradeSounds.POPUP_CLOSE, popupCloseSound)

    const buttonClickSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavButtonClick
    )
    this.sounds.set(TradeSounds.BUTTON_CLICK, buttonClickSound)

    const selectUpSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavSelectUp
    )
    this.sounds.set(TradeSounds.SELECT_UP, selectUpSound)

    const selectDownSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavSelectDown
    )
    this.sounds.set(TradeSounds.SELECT_DOWN, selectDownSound)

    const progressLoopSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavProgressLoop
    )
    this.sounds.set(TradeSounds.PROGRESS_LOOP, progressLoopSound)

    const progressCompleteSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavProgressComplete
    )
    this.sounds.set(TradeSounds.PROGRESS_COMPLETE, progressCompleteSound)

    const purchaseCompleteSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.WavPurchaseComplete
    )
    this.sounds.set(TradeSounds.PURCHASE_COMPLETE, purchaseCompleteSound)

    const countdownFiveSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.Mp3CountdownFive
    )
    this.sounds.set(TradeSounds.COUNTDOWN_FIVE, countdownFiveSound)

    const countdownFourSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.Mp3CountdownFour
    )
    this.sounds.set(TradeSounds.COUNTDOWN_FOUR, countdownFourSound)

    const countdownThreeSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.Mp3CountdownThree
    )
    this.sounds.set(TradeSounds.COUNTDOWN_THREE, countdownThreeSound)

    const countdownTwoSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.Mp3CountdownTwo
    )
    this.sounds.set(TradeSounds.COUNTDOWN_TWO, countdownTwoSound)

    const countdownOneSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.Mp3CountdownOne
    )
    this.sounds.set(TradeSounds.COUNTDOWN_ONE, countdownOneSound)

    const countdownTradeSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.Mp3CountdownTrade
    )
    this.sounds.set(TradeSounds.COUNTDOWN_TRADE, countdownTradeSound)

    const joinRoundSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.JoinRound
    )
    this.sounds.set(TradeSounds.JOIN_ROUND, joinRoundSound)

    const leaveRoundSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.LeaveRound
    )
    this.sounds.set(TradeSounds.LEAVE_ROUND, leaveRoundSound)

    const positionUpTickSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.PositionUpTick
    )
    this.sounds.set(TradeSounds.POSITION_UP_TICK, positionUpTickSound)

    const positionDownTickSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.PositionDownTick
    )
    this.sounds.set(TradeSounds.POSITION_DOWN_TICK, positionDownTickSound)

    const playerTakesGemSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.PlayerTakesGem
    )
    this.sounds.set(TradeSounds.PLAYER_TAKES_GEM, playerTakesGemSound)

    const playerForfeitsGemSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.PlayerForfeitsGem
    )
    this.sounds.set(TradeSounds.PLAYER_FORFEITS_GEM, playerForfeitsGemSound)

    const orderPlacedSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.OrderPlaced
    )
    this.sounds.set(TradeSounds.ORDER_PLACED, orderPlacedSound)

    const orderPlacedProgressSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.OrderPlacedProgress
    )
    this.sounds.set(TradeSounds.ORDER_PLACED_PROGRESS, orderPlacedProgressSound)

    const orderConfirmedSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.OrderConfirmed
    )
    this.sounds.set(TradeSounds.ORDER_CONFIRMED, orderConfirmedSound)

    const orderCancelRequested: AudioClip = new AudioClip(
      OnlineAssets.Sounds.OrderCancelRequested
    )
    this.sounds.set(TradeSounds.ORDER_CANCEL_REQUESTED, orderCancelRequested)

    const synchronizingSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.Synchronizing
    )
    this.sounds.set(TradeSounds.SYNCHRONIZING, synchronizingSound)

    const settlingFundsSound: AudioClip = new AudioClip(
      OnlineAssets.Sounds.SettlingFunds
    )
    this.sounds.set(TradeSounds.SETTLING_FUNDS, settlingFundsSound)

    // let lobbyMusicSound : AudioClip = new AudioClip(OnlineAssets.Sounds.Mp3LobbyMusic);
    // this.sounds.set(TradeSounds.LOBBY_MUSIC,lobbyMusicSound);

    this.musicPlayer = new Tone.Player(
      OnlineAssets.Sounds.Mp3LobbyMusic
    ).toDestination()
    this.musicPlayer.volume.value = this.musicVolume
    // play as soon as the buffer is loaded
    this.musicPlayer.sync().loop = false
    this.musicPlayer.sync().autostart = true
    //this.musicPlayer.autostart = true;
    //this.musicPlayer.dispose();
  }

  public stopMusic() {
    if (this.musicPlayer) {
      this.musicPlayer.stop('+0.1')
      this.musicPlayer.volume.value = -192
      Tone.Transport.pause()
    }
  }

  public playSound(
    sound: TradeSounds,
    volume: number = this.masterVolume,
    loop = false
  ) {
    /*
        if (sound === TradeSounds.ORDER_CONFIRMED)
        {
            // Logger.log("SoundPlayer     |   Playing Order Confirmed Sound")
        }
        else if (sound === TradeSounds.PLAYER_JOIN)
        {
            // Logger.log("SoundPlayer     |   Playing Player Joined Sound")
        }
        else if (sound === TradeSounds.MARKET_MOVES_UP_ONE)
        {
            // Logger.log("SoundPlayer     |   Playing MARKET_MOVES_UP_ONE")
        }
        else if (sound === TradeSounds.MARKET_MOVES_UP_TEN)
        {
            // Logger.log("SoundPlayer     |   Playing MARKET_MOVES_UP_TEN")
        }
        else if (sound === TradeSounds.MARKET_MOVES_DOWN_ONE)
        {
            // Logger.log("SoundPlayer     |   Playing MARKET_MOVES_DOWN_ONE")
        }
        else if (sound === TradeSounds.MARKET_MOVES_DOWN_TEN)
        {
            // Logger.log("SoundPlayer     |   Playing MARKET_MOVES_DOWN_TEN")
        }
        */

    if (this.audioIsEnabled) {
      if (this.sounds.has(sound)) {
        const clip: AudioClip | undefined = this.sounds.get(sound)

        if (clip) {
          this.sounds.get(sound)?.play(volume, Tone.Transport.now(), loop)
        }
      }
    }
  }

  public stopSound(sound: TradeSounds) {
    if (this.sounds.has(sound)) {
      const clip: AudioClip | undefined = this.sounds.get(sound)

      if (clip) {
        this.sounds.get(sound)?.stop()
      }
    }
  }
}
