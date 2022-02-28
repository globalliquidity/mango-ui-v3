import * as Tone from 'tone/build/esm'
// import { ToneAudioBuffer } from 'tone/build/esm';
import Logger from '../Logger'

export class AudioClip {
  //public player : Tone.Player;
  public volume!: Tone.Volume

  public numPlayers = 3
  public currentPlayerIndex = 0
  public players: Tone.Player[] = new Array<Tone.Player>()
  audioBuffer!: Tone.ToneAudioBuffer

  constructor(url: string) {
    this.loadAudio(url)
  }

  private async loadAudio(url) {
    this.volume = new Tone.Volume(0).toDestination()
    //this.player = new Tone.Player(url).toDestination();

    this.audioBuffer = new Tone.ToneAudioBuffer(url, () => {
      for (let i = 0; i < this.numPlayers; i++) {
        this.players.push(new Tone.Player(this.audioBuffer).toDestination())
      }
    })

    //await this.player.loadAudioStream();
  }

  public now() {
    return this.players[0].now()
  }

  public play(volume = 1.0, time: Tone.Unit.Time = 0, loop = false) {
    const player: Tone.Player = this.players[this.currentPlayerIndex]
    if (player) {
      //const time = this.player.now() + when;
      //this.player.start(Tone.now()+when);
      this.volume.volume.value = volume
      this.volume.mute = true
      player.volume.value = volume
      player.loop = loop

      try {
        player.connect(this.volume).fan().start(time)
      } catch (e) {
        Logger.log(
          'The error happened while play audio clip, and this is almost happening when sound muted : '
        )
      }

      if (this.currentPlayerIndex < this.numPlayers - 1) {
        this.currentPlayerIndex++
      } else {
        this.currentPlayerIndex = 0
      }
    }
  }

  public stop() {
    for (let i = 0; i < this.numPlayers; i++) {
      this.players[i].stop()
    }
  }

  /*
    public play(volume : number = 1.0, when : number = 0)
    {
        if (this.player) 
        {
          const time = this.player.now() + when;
          //this.player.start(Tone.now()+when);
          this.player.start(time);
        }
    }
    */
}
