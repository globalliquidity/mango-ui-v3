import { AudioEvent, BeatDivision } from '../Enums'
import { AudioClip } from './AudioClip'
import { AudioSequence } from './AudioSequence'
//import OnlineAssets from '@/Assets/OnlineAssets';
import { Synth } from 'tone/build/esm/instrument'
// import { Sequence } from 'tone/build/esm/event';
import * as Tone from 'tone/build/esm'
import { EventBus } from '../EventBus'
import OnlineAssets from '@/assets/OnlineAssets'

export class AudioSequencer {
  private static _instance: AudioSequencer
  sequences: Map<AudioEvent, AudioSequence> = new Map<
    AudioEvent,
    AudioSequence
  >()

  tempo = 120
  currentSequence!: AudioSequence
  currentStep = 0
  currentStepCount = 0
  timePerClip!: number
  clipVolume = -6

  maxScheduledTime = 0

  private playbackTimeout!: NodeJS.Timeout

  private started = false

  synth = new Synth().toDestination()

  upNotes: string[] = ['C4', 'E4', 'F4', 'G4', 'G4', 'B4', 'C5', 'E5', 'F5']

  isMuted = false

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this())
  }

  private constructor() {
    //this.createSequences();

    EventBus.Instance.eventHandler.subscribe((p, r) => {
      if (r === 'ROOM_SELECTED') {
        this.started = true
      } else if (r === 'LOCAL_MIC_ACTIVE') {
        this.isMuted = true
      } else if (r === 'LOCAL_MIC_MUTED') {
        this.isMuted = false
      }
    })
  }

  public init() {
    this.createSequences()
    Tone.Transport.timeSignature = 4
    Tone.Transport.bpm.value = 120
    Tone.Transport.start()
  }

  private createSequences() {
    //let bleepBf2Clip = new AudioClip(tradeSoundBf2);
    //let bleepC2Clip = new AudioClip(tradeSoundC2);
    //let bleepEf2Clip = new AudioClip(tradeSoundEf2);
    //let bleepE2Clip = new AudioClip(tradeSoundE2);
    //let bleepF2Clip = new AudioClip(tradeSoundF2);
    //let bleepG2Clip = new AudioClip(tradeSoundG2);
    //let bleepB2Clip = new AudioClip(tradeSoundB2);

    const bleepC3Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundC3)
    const bleepE3Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundE3)
    //let bleepEf3Clip = new AudioClip(bleepSoundEf3);
    const bleepF3Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundF3)
    const bleepG3Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundG3)
    const bleepB3Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundB3)
    const bleepC4Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundC4)
    const bleepE4Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundE4)
    const bleepF4Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundF4)
    const bleepG4Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundG4)
    const bleepB4Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundB4)
    const bleepC5Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundC5)
    const bleepE5Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundE5)
    const bleepF5Clip = new AudioClip(OnlineAssets.Sounds.WavTradeSoundF5)

    const tradesUpArray = new Array<AudioClip>()
    tradesUpArray.push(bleepC4Clip)
    tradesUpArray.push(bleepE4Clip)
    tradesUpArray.push(bleepF4Clip)
    tradesUpArray.push(bleepG4Clip)
    tradesUpArray.push(bleepB4Clip)
    tradesUpArray.push(bleepC5Clip)
    tradesUpArray.push(bleepE5Clip)
    tradesUpArray.push(bleepF5Clip)

    const tradesUpSequence = new AudioSequence(
      BeatDivision.EIGHTH_NOTE,
      tradesUpArray
    )

    this.addAudioSequence(AudioEvent.TRADES_THROUGH_UP, tradesUpSequence)

    const tradesDownArray = new Array<AudioClip>()

    tradesDownArray.push(bleepF4Clip)
    tradesDownArray.push(bleepE4Clip)
    tradesDownArray.push(bleepC4Clip)
    tradesDownArray.push(bleepB3Clip)
    tradesDownArray.push(bleepG3Clip)
    tradesDownArray.push(bleepF3Clip)
    tradesDownArray.push(bleepE3Clip)
    tradesDownArray.push(bleepC3Clip)

    const tradesDownSequence = new AudioSequence(
      BeatDivision.EIGHTH_NOTE,
      tradesDownArray
    )

    this.addAudioSequence(AudioEvent.TRADES_THROUGH_DOWN, tradesDownSequence)
  }

  public addAudioSequence(event: AudioEvent, sequence: AudioSequence) {
    this.sequences.set(event, sequence)
  }

  public playSequence(audioEvent: AudioEvent, stepCount = 0) {
    if (this.started) {
      if (this.sequences.has(audioEvent)) {
        const sequence: AudioSequence | undefined =
          this.sequences.get(audioEvent)

        if (sequence) {
          sequence.reset()
          this.currentSequence = sequence
          this.currentStep = 0

          if (stepCount === 0) {
            this.currentStepCount = this.currentSequence.stepCount()
          } else {
            this.currentStepCount = Math.min(
              stepCount,
              this.currentSequence.stepCount()
            )
          }

          this.startPlayback()
        }
      }
    }
  }

  private startPlayback() {
    if (this.currentSequence) {
      //Using Old Audio Player

      const timePerBeat: number = 60000 / this.tempo
      this.timePerClip =
        (timePerBeat / this.currentSequence.clipBeatDivision) * 0.001

      //let synth = new Synth().toDestination();
      //let notes : string[] = this.upNotes.slice(0,this.currentStepCount);

      for (let i = 0; i < this.currentStepCount; i++) {
        const nextClip: AudioClip | undefined =
          this.currentSequence.getNextClip()

        if (nextClip) {
          //synth.triggerAttackRelease(notes[i], 0.0625, this.timePerClip * i);
          const time = nextClip.now() + this.timePerClip * i

          if (time > this.maxScheduledTime) {
            this.maxScheduledTime = time

            if (!this.isMuted) {
              nextClip.play(this.clipVolume, time)
            }

            this.currentStep++
          } else {
            //time = this.maxScheduledTime + ((i == 0) ? 0.01 : this.timePerClip * i);
            //this.maxScheduledTime = time;
          }

          //Logger.log('check time:', time);

          //nextClip.play(1.0, time);
          //this.currentStep++;

          //if (this.currentStep < this.currentStepCount)
          //    this.playbackTimeout = setTimeout(this.playNextClip.bind(this), this.timePerClip, this) as NodeJS.Timeout;
        }
      }

      //Using Tone Library
      //let synth = new Synth().toDestination();
      /*
            const seq = new Sequence((time, note) => {
            synth.triggerAttackRelease(note, 0.0625, time);
	        // subdivisions are given as subarrays
            }, notes).start(0);
            */
    }
  }

  playNextClip() {
    const nextClip: AudioClip | undefined = this.currentSequence.getNextClip()

    if (nextClip) {
      if (!this.isMuted) {
        nextClip.play(this.clipVolume)
      }
      this.currentStep++
      if (this.currentStep < this.currentStepCount)
        this.playbackTimeout = setTimeout(
          this.playNextClip.bind(this),
          this.timePerClip,
          this
        ) as NodeJS.Timeout
    }
  }
}
