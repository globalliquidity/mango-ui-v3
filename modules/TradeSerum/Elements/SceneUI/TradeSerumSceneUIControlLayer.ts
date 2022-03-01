import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneFormatType } from '@/modules/SceneGraph/Enums'
import { LocalTradingSession } from '../LocalTradingSession'
import { UILayer } from '@/modules/SceneGraph/UILayer'
import { PriceZoomElement } from './PriceZoomElement'
// import { ThemeButtonElement } from './ThemeButtonElement';
import { OrderEntryElement } from './OrderEntryElement'
// import { InfoButtonElement } from '../../Elements/InfoButtonElement';
// import { MicMuteControl } from '../../Elements/MicMuteControl';
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
// import { JoinLeaveControl } from '../../Elements/JoinLeaveControl';
// import { GoBackToLobbyElement } from '../../Elements/GoBackToLobbyElement';

export class TradeSerumSceneUIControlLayer extends UILayer {
  priceZoom?: PriceZoomElement
  // themeButton?: ThemeButtonElement;
  // infoButton: InfoButtonElement;
  orderEntry?: OrderEntryElement
  // goBackToLobby: GoBackToLobbyElement;

  // public joinLeaveControl : JoinLeaveControl;
  // public micMuteControl : MicMuteControl;

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public tradingSession: LocalTradingSession,
    public glowLayer: bjs.GlowLayer,
    public distance: number
  ) {
    super(name, x, y, z, scene, distance)
    this.create()
  }

  protected onCreate() {
    // // Creating Go Back To Lobby Element
    // this.goBackToLobby = new GoBackToLobbyElement("Go Back To Lobby",0,0,0,this.scene,this.glowLayer);
    // this.addUIControl(this.goBackToLobby);
    // // Creating Order Entry Element
    /*
        this.orderEntry = new OrderEntryElement("Order Entry",0,0,0,this.scene,this.tradingSession, this.glowLayer);
        this.addUIControl(this.orderEntry);
        this.orderEntry.setEnabled(true);
        */
    // this.joinLeaveControl = new JoinLeaveControl("Join Leave", -1.5,0,0,this.scene, this.gameSession);
    // this.joinLeaveControl.scaling = new bjs.Vector3(0.6, 0.6, 0.6);
    // this.joinLeaveControl.setEnabled(true);
    // this.addUIControl(this.joinLeaveControl);
    // this.micMuteControl = new MicMuteControl("Gameplay Mic Mute", 0,0,0,this.scene);
    // this.micMuteControl.scaling = new bjs.Vector3(0.6, 0.6, 0.6);
    // //this.micMuteControl.setEnabled(false);
    // this.addUIControl(this.micMuteControl);
  }

  public reset() {
    // this.micMuteControl.reset();
  }

  protected onFormat() {
    let distBaseScale = 1 //this.distance / this.scene.camera.radius;

    if (this.scene.sceneType === SceneFormatType.Portrait) {
      const w = this.bottomRight.x - this.bottomLeft.x
      if (this.orderEntry) this.orderEntry.position.x = w / 4
      distBaseScale = this.distance / 42
    } else {
      distBaseScale = this.distance / 85
    }

    if (this.orderEntry)
      this.orderEntry.scaling = new bjs.Vector3(
        distBaseScale,
        distBaseScale,
        distBaseScale
      )
  }
}
