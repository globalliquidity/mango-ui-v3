import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneFormatType } from '@/modules/SceneGraph/Enums'
import { UILayer } from '@/modules/SceneGraph/UILayer'
// import { CurrentScoreElement } from '../DepthFinder/CurrentScoreElement';
// import { LocalGameSession } from '../../Elements/LocalGameSession';
// import { PlayerProfileControl } from '../../Elements/PlayerProfileControl';
// import { PlayerProfileDisplay } from '../../Elements/PlayerProfileDisplay';
// import { ReferenceElement } from '../../Elements/ReferenceElement';
// import { VersionDisplayElement } from '../Version/VersionDisplayElement';
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
import { LocalTradingSession } from '../LocalTradingSession'
import { BaseCurrencyBalanceDisplayElement } from './BaseCurrencyBalanceDisplayElement'
// import { GameRoundResultsControl } from '../../Elements/GameRoundResultsControl';
// import { StateMachineDisplayElement } from '../../Elements/StateMachineDisplayElement';
import { ExchangePairDisplayElement } from './ExchangePairDisplayElement'
import { MidPriceControl } from './MidPriceControl'
import { OrderMessageControl } from './OrderMessageControl'
import { QuoteCurrencyBalanceDisplayElement } from './QuoteCurrencyBalanceDisplayElement'
import { MinimumPriceControl } from './MinimumPriceControl'
import { MaximumPriceControl } from './MaximumPriceControl'

export class TradeSerumSceneUIDisplayLayer extends UILayer {
  public topLeft: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public bottomLeft: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public topRight: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public bottomRight: bjs.Vector3 = new bjs.Vector3(0, 0, 0)

  public center: bjs.Vector3 = new bjs.Vector3(0, 0, 0)

  public aspectRatio = 1

  // public versionInfo: VersionDisplayElement;
  public exchangePair?: ExchangePairDisplayElement

  public quoteCurrencyBalance?: QuoteCurrencyBalanceDisplayElement
  public baseCurrencyBalance?: BaseCurrencyBalanceDisplayElement

  public midPriceControl?: MidPriceControl
  public orderMessageControl?: OrderMessageControl
  public minimumPriceControl?: MinimumPriceControl
  public maximumPriceControl?: MaximumPriceControl

  // public currentScore: CurrentScoreElement;
  // public refereceElem: ReferenceElement;
  // public stateMachineDisplayElement: StateMachineDisplayElement;

  // public playerProfileControl : PlayerProfileControl;
  // public playerProfileDisplay: PlayerProfileDisplay;

  // public gameRoundResultsControl : GameRoundResultsControl;

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
    // // Creating Version Number
    //this.versionInfo = new VersionDisplayElement("Version Display", 0,0,0,this.scene);
    //this.addUIControl(this.versionInfo);

    //this.exchangePair = new ExchangePairDisplayElement("Exchange Pair Display", 0,0,0,this.scene);
    //this.addUIControl(this.exchangePair);

    this.baseCurrencyBalance = new BaseCurrencyBalanceDisplayElement(
      'Base Currency Balance Display',
      0,
      0,
      0,
      this.scene
    )
    this.addUIControl(this.baseCurrencyBalance)

    this.quoteCurrencyBalance = new QuoteCurrencyBalanceDisplayElement(
      'Quote Currency Balance Display',
      0,
      0,
      0,
      this.scene
    )
    this.addUIControl(this.quoteCurrencyBalance)

    // this.playerProfileControl = new PlayerProfileControl("Player Profile Control",0,0,0,this.scene,false);
    // this.playerProfileControl.setProfileElemPosition(new bjs.Vector3(0,0.5,0));
    // this.addUIControl(this.playerProfileControl);

    this.midPriceControl = new MidPriceControl(
      'Mid Price Control',
      0,
      0,
      0,
      this.scene,
      this.tradingSession
    )
    this.addUIControl(this.midPriceControl)

    this.minimumPriceControl = new MinimumPriceControl(
      'Minimum Price Control',
      0,
      0,
      0,
      this.scene,
      this.tradingSession
    )
    this.addUIControl(this.minimumPriceControl)

    this.maximumPriceControl = new MaximumPriceControl(
      'Maximum Price Control',
      0,
      0,
      0,
      this.scene,
      this.tradingSession
    )
    this.addUIControl(this.maximumPriceControl)

    /*
        this.orderMessageControl = new OrderMessageControl("Order Message Control", 0,0,0,this.scene, this.tradingSession);
        this.addUIControl(this.orderMessageControl);
        */

    // // Show Current Score
    // //this.currentScore = new CurrentScoreElement("Current Score Elem", 0,0,0,this.scene, this.gameSession);
    // //this.addUIControl(this.currentScore);

    // this.gameRoundResultsControl = new GameRoundResultsControl("Game Round Results",0,0,0,this.scene);
    // this.addUIControl(this.gameRoundResultsControl);
  }

  public reset() {
    // this.gameRoundResultsControl.gameRoundResultsElement?.setEnabled(false);
  }

  protected onFormat() {
    let distBaseScale = 1 //this.distance / this.scene.camera.radius;
    //this.refereceElem.updateBackgroundSize(this.bottomRight.x - this.bottomLeft.x, this.topLeft.y - this.bottomLeft.y);

    // const w = this.bottomRight.x - this.bottomLeft.x;
    // const h = this.topLeft.y - this.bottomLeft.y;

    if (this.scene.sceneType === SceneFormatType.Portrait) {
      distBaseScale = this.distance / 42
      if (this.midPriceControl) {
        this.midPriceControl.scaling = new bjs.Vector3(
          distBaseScale / 1.5,
          distBaseScale / 1.5,
          distBaseScale / 1.5
        )
      }

      // const ratio = 0.586498720724267;
      //this.refereceElem.referencePlane.scaling = new bjs.Vector3(h * 0.2 * ratio, h * 0.2, 1);
      //this.refereceElem.referencePlane.position.y = 0;
      //this.refereceElem.referencePlane.position.z = -11;
      //this.stateMachineDisplayElement.stateMachinePlane.scaling = new bjs.Vector3(h * 0.2 * ratio, h * 0.2, 1);
      //this.stateMachineDisplayElement.stateMachinePlane.position.y = 0;
      //this.stateMachineDisplayElement.stateMachinePlane.position.z = -11;
    } else {
      distBaseScale = this.distance / 85
      if (this.midPriceControl) {
        this.midPriceControl.scaling = new bjs.Vector3(
          distBaseScale,
          distBaseScale,
          distBaseScale
        )
      }

      if (this.orderMessageControl) {
        this.orderMessageControl.scaling = new bjs.Vector3(
          distBaseScale,
          distBaseScale,
          distBaseScale
        )
      }

      if (this.minimumPriceControl) {
        this.minimumPriceControl.scaling = new bjs.Vector3(
          distBaseScale,
          distBaseScale,
          distBaseScale
        )
      }

      if (this.maximumPriceControl) {
        this.maximumPriceControl.scaling = new bjs.Vector3(
          distBaseScale,
          distBaseScale,
          distBaseScale
        )
      }

      //this.currentScore.scaling = new bjs.Vector3(distBaseScale, distBaseScale, distBaseScale);
      // const ratio = 0.483478260869565;
      //this.stateMachineDisplayElement.stateMachinePlane.scaling = new bjs.Vector3(w * 0.45, w * 0.45 * ratio, 1);
      //this.stateMachineDisplayElement.stateMachinePlane.position.y = 0.3;
      //this.stateMachineDisplayElement.stateMachinePlane.position.z = -5;
    }

    //this.versionInfo.scaling = new bjs.Vector3(distBaseScale, distBaseScale, distBaseScale);
    //this.tradingTimer.scaling = new bjs.Vector3(distBaseScale, distBaseScale, distBaseScale);
    //this.playerProfileDisplay.scaling = new bjs.Vector3(distBaseScale, distBaseScale, distBaseScale);
  }
}
