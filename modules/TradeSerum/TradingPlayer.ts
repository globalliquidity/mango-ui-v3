import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { TradeSerumScene } from './TradeSerumScene'
import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from '@/modules/SceneGraph/Scene'
// import { APIService } from "../UserService/APIService";
// import { TelegramUser } from '../UserService/UserDataInterfaces';

export abstract class TradingPlayer extends SceneElement {
  // protected _tradingSession!: TradingSession;

  public telegramUserName?: string
  public firstName?: string
  public lastName?: string
  public playerImage?: string
  public gemCount = 0

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public playerId: string
  ) {
    super(name, x, y, z, scene)
  }

  public async getPlayerInfo() {
    // let user: TelegramUser | null | undefined = null
    // if ((this.playerId && this.playerId !== '') || getQueryParams().get('access_token')) {
    //     if (this.playerId && this.playerId !== '') {
    //         user = await APIService.getUserById(this.playerId);
    //     } else {
    //         const userDataStr = localStorage.getItem('user_data');
    //         if (userDataStr) {
    //             user = JSON.parse(userDataStr) as TelegramUser;
    //         }
    //     }
    // } else {
    //     Logger.log(`Get User Error: this.playerId is "${this.playerId}"`);
    // }
    // if(user)
    // {
    //     this.telegramUserName = user.tel_username;
    //     this.firstName = user.firstname;
    //     this.lastName = user.lastname;
    //     this.gemCount = user.gems;
    //     this.playerImage = user.avatar;// process.env.AZURE_USER_IMAGES_STORAGE_URL + user.tel_user_id + "_avatar.jpeg";
    // }
  }
}

export class LocalTradingPlayer extends TradingPlayer {
  // protected  _tradingSession?: LocalTradingSession;

  // public get tradingSession(): LocalTradingSession {
  //     return this._tradingSession as LocalTradingSession;
  // }

  get playerUsername(): string {
    return this.telegramUserName!
  }

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public playerId: string
  ) {
    super(name, x, y, z, scene, playerId)

    // if (this.scene)
    // {
    //     if(this.scene.depthFinderPresenter)
    //     {
    //         this._tradingSession = new LocalTradingSession("Trading Session : " + this.playerId,0,0,0,this.scene,this,this.scene.depthFinderPresenter);
    //         this.addChild(this.tradingSession);
    //     }
    // }
  }

  /*
    protected receiveEvent(eventMessage: Ably.Types.Message)
    {
        let message : string = eventMessage.name;
        let messageData : string = eventMessage.data;

        Logger.log('LocalGamePlayer: ReceivedEvent:  ' + message + ":" + messageData)

        switch(message)
        {
            case "SERVER_WELCOMES_PLAYER":
            case "PLAYER_JOINS_ROUND":
            case "PLAYER_LEAVES_ROUND":
            case "BUY_ORDER_FILLED":
            case "SELL_ORDER_FILLED":
            {
                // this.tradingSession.processEvent(message,messageData);
                break;           
            }
            case "SHOW_STATUS_MESSAGE":
                {
                    let message : string = String(messageData);
                    this.scene.showStatusMessage(message);
                }
            break;
        }
    }
    */

  protected onAddCustomProperties() {
    this.inspectableCustomProperties = [
      {
        label: 'Player Id',
        propertyName: 'playerId',
        type: bjs.InspectableType.String,
      },
      {
        label: 'Player Name',
        propertyName: 'playerUsername',
        type: bjs.InspectableType.String,
      },
    ]
  }
}
