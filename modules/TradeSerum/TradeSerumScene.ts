import * as bjs from '@babylonjs/core/Legacy/legacy'
import '@babylonjs/core/Debug/debugLayer'
import currency from 'currency.js'
import { Queue } from 'queue-typescript'
import { ExchangeOrder } from './Market/ExchangeOrder'
import { MarketDataSampler } from './Market/MarketDataSampler'
import { SerumMarketDataSource } from './Market/SerumMarketDataSource'
import { TextMeshModelLoader } from '@/modules/SceneGraph/TextMeshModelLoader'
import Logger from '@/modules/SceneGraph/Logger'
import { DepthFinderElement } from './Elements/DepthFinder/DepthFinderElement'
import { DepthFinderPresenter } from './Elements/DepthFinder/DepthFinderPresenter'
import { EventBus } from '@/modules/SceneGraph/EventBus'
import { Scene } from '@/modules/SceneGraph/Scene'
import { ThemeController } from './Elements/Theme/ThemeController'
import { DayTheme } from './Elements/Theme/DayTheme'
import { NightTheme } from './Elements/Theme/NightTheme'
import { interpret, Interpreter, Machine, StateMachine } from 'xstate'
import { GLSGColor, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { TradeSerumSceneUIElement } from './Elements/SceneUI/TradeSerumSceneUIElement'
import { SmartOrderType } from './Enums'
import { SoundPlayer, TradeSounds } from './SoundPlayer'
import AudioPlayer from '@/modules/SceneGraph/Audio/AudioPlayer'
import { DepthFinderUpdateMessage } from './Elements/DepthFinder/DepthFinderUpdateMessage'
import { LocalTradingSession } from './Elements/LocalTradingSession'
import { SerumDexUIAdapter } from './SerumDexUIAdapter'
import { FullScreenGUIElement } from './Elements/FullScreenGUI/FullScreenGUIElement'
import { SettingsManager } from './SettingsManager'
// import { pipeline } from 'stream';

// const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

// enum MenuPosition {
//     TOP_LEFT = 0,
//     TOP_RIGHT,
//     BOTTOM_LEFT,
//     BOTTOM_RIGHT
// };

// The hierarchical (recursive) schema for the states
interface TradeSerumSceneSchema {
  states: {
    loading: {}
    loaded: {
      states: {
        start_menu: {}
        playing_game: {}
        game_over: {}
        resetting: {}
      }
    }
  }
}

// The events that the machine handles
type TradeSerumSceneEventType =
  | { type: 'LOAD_GAME' }
  | { type: 'LOAD_GAME_COMPLETE' }
  | { type: 'SHOW_START_SCREEN' }
  | { type: 'PLAY_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'GAME_OVER' }

// The context (extended state) of the machine
interface TradeSerumSceneContext {
  isInitialized: boolean
  isResetting: boolean
}

export class TradeSerumScene extends Scene {
  //implements IMessageBusClient
  // player? : LocalTradingPlayer;

  directionalLight?: bjs.DirectionalLight
  // private playerInfo : PlayerInfoElement;

  fullScreenGUI?: FullScreenGUIElement

  sceneUI?: TradeSerumSceneUIElement
  depthFinder?: DepthFinderElement

  orderUpdateQueue: Queue<ExchangeOrder> = new Queue<ExchangeOrder>()
  tradeHistoryQueue: Queue<ExchangeOrder> = new Queue<ExchangeOrder>()
  activeMenuItemText = ''

  public rowCount = 50
  public columnCount = 100
  public cellWidth = 0.5

  public cellHeight = 0.005
  public cellDepth = 1

  public rowDepthMultiplier = 1
  public cellHeightMultiplier = 1.0
  public maxCellHeight = 20
  private cameraHomeAlpha: number = -Math.PI / 2
  private cameraHomeBeta: number = Math.PI / 2 - Math.PI / 16
  //private cameraStartingRadius: number = 150;
  private cameraHomeRadius: number = this.columnCount
  private cameraTradeRadius = 30

  private cameraHomeTarget: bjs.Vector3 = new bjs.Vector3(0, 9, 10)
  private cameraLongTarget: bjs.Vector3 = new bjs.Vector3(0, 6.737, 4.859)
  private cameraShortTarget: bjs.Vector3 = new bjs.Vector3(0, 6.737, 4.859)
  public audioIsEnabled = false

  distance = 20

  private inspectorIsVisible = false

  horizonRing?: bjs.Mesh
  horizonRingMaterial?: bjs.PBRMaterial
  themeController?: ThemeController

  fadeLevel = 0.0

  public sampler: MarketDataSampler | undefined
  depthFinderPresenter: DepthFinderPresenter | undefined

  tradingSession?: LocalTradingSession

  private simulationMode = false
  private samplerGenerations = 2 // 50
  public samplingInterval = 400
  public exchangeType = 'binance'
  public pairType = 'btc-usdt'

  public settings: any = { dataSource: 'serum' }
  xr: bjs.WebXRDefaultExperience | undefined

  private audioIsInitalized = false
  private upTickSound: AudioPlayer | undefined
  private downTickSound: AudioPlayer | undefined
  private previousMidPrice: currency = currency(0)

  private isFullscreen = false

  assetsPath: Array<Record<string, unknown>> = [
    {
      type: 'mesh',
      name: 'simplecube',
      url: this.sceneBaseUrl,
      fileName: 'simplecube.babylon.gz',
      async: false,
    },
    {
      type: 'mesh',
      name: 'histogramBlock',
      url: this.sceneBaseUrl,
      fileName: 'simplecube.babylon.gz',
      async: false,
    },
    {
      type: 'mesh',
      name: 'rightArrow',
      url: this.sceneBaseUrl,
      fileName: 'RightArrowSmooth.glb',
      async: false,
    },
    {
      type: 'mesh',
      name: 'Arrow',
      url: this.sceneBaseUrl,
      fileName: 'Arrow.glb',
      async: false,
    },
    {
      type: 'mesh',
      name: 'arrowBackground',
      url: this.sceneBaseUrl,
      fileName: 'ArrowBackground.glb',
      async: false,
    },
    {
      type: 'mesh',
      name: 'hudFrame',
      url: this.sceneBaseUrl,
      fileName: 'HUDFrame600.babylon.gz',
      async: false,
    },
    {
      type: 'mesh',
      name: 'positionPointer',
      url: this.sceneBaseUrl,
      fileName: 'PositionPointer.glb',
      async: false,
    },
    {
      type: 'mesh',
      name: 'tubeSegment',
      url: this.sceneBaseUrl,
      fileName: 'TubeSegment.babylon.gz',
      async: false,
    },
    {
      type: 'mesh',
      name: 'Plus',
      url: this.sceneBaseUrl,
      fileName: 'Plus.glb',
      async: false,
    },
    {
      type: 'mesh',
      name: 'Minus',
      url: this.sceneBaseUrl,
      fileName: 'Minus.glb',
      async: false,
    },
    {
      type: 'mesh',
      name: 'ThemeButton',
      url: this.sceneBaseUrl,
      fileName: 'ThemeButton.glb',
      async: false,
    },
    {
      type: 'mesh',
      name: 'Board',
      url: this.sceneBaseUrl,
      fileName: 'Board.glb',
      async: false,
    },
    // {type: 'cubetexture', name:'MorningSkyRipple1', url: this.sceneBaseUrl, fileName: 'MorningSkyRipple1.env', async: true},
    // {type: 'mesh', name:'SmoothCube', url: this.sceneBaseUrl, fileName: 'SmoothCube.babylon.gz', async: false},
    // {type: 'cubetexture', name:'MorningSkyRipple', url: this.experienceBaseUrl, fileName: 'MorningSkyRipple.env', async: false},
    {
      type: 'mesh',
      name: 'steelRing',
      url: this.sceneBaseUrl,
      fileName: 'SteelRingSeams.glb',
      async: false,
    },
    {
      type: 'mesh',
      name: 'orderMarkerFrame',
      url: this.sceneBaseUrl,
      fileName: 'OrderMarkerFrameV2.glb',
      async: false,
    },

    {
      type: 'cubetexture',
      name: 'BrighterSky',
      url: this.sceneBaseUrl,
      fileName: 'ToonSky4.env',
      async: false,
    },
    // {type: 'cubetexture', name:'TokyoNightBlur', url: this.sceneBaseUrl, fileName: 'TokyoNightBlur.env', async: false},
    // {type: 'cubetexture', name:'BrighterSky2048', url: this.sceneBaseUrl, fileName: 'BrighterSky2048.env', async: true},
    // {type: 'cubetexture', name:'TokyoNightBlurSpecularHDR', url: this.sceneBaseUrl, fileName: 'TokyoNightBlur.env', async: true},
  ]

  private stateMachine: StateMachine<
    TradeSerumSceneContext,
    TradeSerumSceneSchema,
    TradeSerumSceneEventType
  >
  private stateMachineService?: Interpreter<
    TradeSerumSceneContext,
    TradeSerumSceneSchema,
    TradeSerumSceneEventType
  >

  constructor(
    public title: string,
    public canvas: HTMLElement,
    public isLiveTrading: boolean
  ) {
    super(title, canvas)
    this.sceneType = SceneFormatType.Landscape

    this.stateMachine = Machine<
      TradeSerumSceneContext,
      TradeSerumSceneSchema,
      TradeSerumSceneEventType
    >(
      {
        id: 'trade_scene',
        initial: 'loading',
        states: {
          loading: {
            id: 'loading',
            onEntry: 'onEnterLoading',
            on: {
              LOAD_GAME_COMPLETE: 'loaded',
            },
          },
          loaded: {
            initial: 'playing_game', // start_menu
            onEntry: 'onEnterLoaded',
            states: {
              start_menu: {
                id: 'start_menu_shown',
                onEntry: 'onEnterStartMenu',
                onExit: 'onExitStartMenu',
                on: {
                  PLAY_GAME: 'playing_game',
                },
              },
              playing_game: {
                id: 'playing_game',
                onEntry: 'onEnterPlayingGame',
                onExit: 'onExitPlayingGame',
                on: {
                  GAME_OVER: 'game_over',
                },
              },
              game_over: {
                id: 'game_over',
                onEntry: 'onEnterGameOver',
                on: {
                  RESET_GAME: 'resetting',
                },
              },
              resetting: {
                id: 'resetting',
                onEntry: 'onEnterResetting',
                on: {
                  PLAY_GAME: 'playing_game',
                },
              },
            },
          },
        }, //states
      },
      {
        actions: {
          onEnterLoading: async (_ctx, _event) => {
            Logger.log('TradeSerumScene : Entering Loading State')

            SoundPlayer.Instance.intialize()

            this.depthFinderPresenter = new DepthFinderPresenter(
              this.rowCount,
              this.columnCount
            )

            // Creating Market Data Source
            const marketDataSource = new SerumMarketDataSource(this.pairType)

            this.sampler = new MarketDataSampler(
              this.pairType,
              this.samplerGenerations,
              this.samplingInterval,
              marketDataSource
            )
            this.sampler.connect()

            this.sampler.onSampleCaptured.subscribe((_sampler, sample) => {
              // Logger.log('sample captured');
              const message = new DepthFinderUpdateMessage(sample)
              this.depthFinderPresenter?.processMessage(message)
              // this.rowDepthMultiplier = 0;
            })
          },
          onEnterLoaded: (_ctx, _event) => {
            Logger.log('TradeSerumScene   |   Entering Loaded State')
            // const progressBarHandler: any = $(".progress-bar");
            // progressBarHandler.circlos({
            //     increase: 14
            // });

            // const playerId = 'test-id';
            // if (this.player === undefined)
            //     this.player  = new LocalTradingPlayer("Local Trading Player", 0, 0, 0, this, playerId);

            if (this.depthFinderPresenter && !this.depthFinder) {
              this.tradingSession = new LocalTradingSession(
                'Trading Session : ',
                0,
                0,
                0,
                this,
                this.depthFinderPresenter
              )
              // this.addChild(this.tradingSession);

              this.sceneUI = new TradeSerumSceneUIElement(
                'Full Screen UI',
                0,
                0,
                0,
                this,
                this.tradingSession,
                this.glowLayer
              )
              this.AddSceneElement(this.sceneUI)

              // this.depthFinderPresenter.start(this.samplingInterval); // update interval
              this.depthFinder = new DepthFinderElement(
                'Depth Finder', //name,
                0, //x
                1.8, //y
                0, //z
                this,
                this.rowCount,
                this.columnCount,
                this.cellWidth,
                this.cellHeight,
                this.cellDepth,
                this.depthFinderPresenter,
                this.tradingSession,
                this.glowLayer
              )

              this.depthFinder.rotation.y = 0
              this.AddSceneElement(this.depthFinder)
            }
          },
          onEnterStartMenu: (_ctx, _event) => {
            Logger.log('TradeSerumScene : Entering Start Menu State')
            //show Start Menu
          },
          onExitStartMenu: (_ctx, _event) => {
            Logger.log('TradeSerumScene : Exiting Start Menu State')
            //Hide StartMenu
          },
          onEnterPlayingGame: (_ctx, _event) => {
            Logger.log('TradeSerumScene : Entering Playing Game State')

            this.reset()
            this.directionalLight?.setEnabled(true)

            const aspectRatio =
              (this.canvas.clientHeight * this.camera.viewport.height) /
              (this.canvas.clientWidth * this.camera.viewport.width)

            if (aspectRatio > 1) this.format(SceneFormatType.Portrait)
            else this.format(SceneFormatType.Landscape)

            if (this.sceneUI) this.sceneUI.show()

            this.depthFinder?.Show()
          },
          onEnterGameOver: (_ctx, _event) => {
            Logger.log('TradeSerumScene : Entering Game Over State')

            this.directionalLight?.setEnabled(false)
            this.depthFinderPresenter?.stop()
            this.depthFinder?.Hide()

            this.DeleteSceneElement('Depth Finder')
            this.depthFinder?.destroy()
            this.depthFinder = undefined
            delete this.depthFinder
          },
          onEnterResetting: (_ctx, _event) => {
            Logger.log('TradeSerumScene : Entering Resetting State')
            // this.tradingSession.tradingTimer.show();
            // this.tradingSession.volatilityDrone.resume();
            this.stateMachineService?.send('PLAY_GAME')
          },
        },
      }
    )

    this.stateMachineService = interpret(this.stateMachine, { devTools: false })
    this.stateMachineService.start()

    EventBus.Instance.eventHandler.subscribe((_p, r) => {
      if (r === 'BEGIN') {
        // this.createFullScreenUI();
        this.stateMachineService?.send('PLAY_GAME')
      } else if (r === 'TIMER_DONE') {
        this.stateMachineService?.send('GAME_OVER')
      } else if (r === 'SWITCH_TO_PORTRAIT') {
        if (this.sceneType === SceneFormatType.Landscape) {
          this.format(SceneFormatType.Portrait)
        }
      } else if (r === 'SWITCH_TO_LANDSCAPE') {
        if (this.sceneType === SceneFormatType.Portrait) {
          this.format(SceneFormatType.Landscape)
        }
      }
    })
  }

  protected async createScene() {
    this.bjsScene.autoClear = false // Color buffer
    this.bjsScene.autoClearDepthAndStencil = false // Depth and stencil, obviously

    //Make the glow layer first because TextMeshModelLoader uses it.
    this.glowLayer = new bjs.GlowLayer('glow', this.bjsScene) // {renderingGroupId: 2}
    this.glowLayer.intensity = 1

    const hemisphereLight: bjs.HemisphericLight = new bjs.HemisphericLight(
      'Hemi Light',
      new bjs.Vector3(0.4, 0, 1),
      this.bjsScene
    )
    hemisphereLight.diffuse = new bjs.Color3(0.416, 0.435, 0.553) //.toLinearSpace();

    await TextMeshModelLoader.Instance(this.title).init(this)

    this.bjsScene.clearColor = bjs.Color4.FromInts(114, 114, 209, 255)
    this.directionalLight = new bjs.DirectionalLight(
      'dir01',
      new bjs.Vector3(-0.75, -1, -0.3),
      this.bjsScene
    )
    this.directionalLight.setEnabled(false)

    // Initialize camera params
    this.camera.lowerRadiusLimit = 1
    //this.camera.upperBetaLimit = this.camera.beta + (Math.PI) / 12;
    this.camera.target = this.cameraHomeTarget
    this.camera.alpha = this.cameraHomeAlpha - Math.PI
    this.camera.beta = this.cameraHomeBeta
    this.camera.radius = this.cameraHomeRadius
    this.camera.fov = 0.5
    this.camera.angularSensibilityX = 2000
    this.camera.angularSensibilityY = 2000
    this.camera.panningSensibility = 2000

    // Setting up themes and apply default theme
    this.themeController = new ThemeController(
      'Theme Controller',
      0,
      0,
      0,
      this
    )
    this.AddSceneElement(this.themeController)

    this.themeController.addTheme('Day', new DayTheme('Day', 0, 0, 0, this))
    this.themeController.addTheme(
      'Night',
      new NightTheme('Night', 0, 0, 0, this)
    )
    this.themeController.applyTheme(1)

    this.hdrSkybox?.setEnabled(false)

    this.fullScreenGUI = new FullScreenGUIElement(
      'FullScreen GUI',
      0,
      0,
      0,
      this,
      this.glowLayer
    )

    //const postProcess = new bjs.FxaaPostProcess("fxaa", 2.0, this.camera);
    const defaultPipeline = new bjs.DefaultRenderingPipeline(
      'default',
      true,
      this.bjsScene,
      [this.camera]
    )
    defaultPipeline.samples = 4
    defaultPipeline.fxaaEnabled = true
    defaultPipeline.imageProcessingEnabled = true
    //defaultPipeline.imageProcessing.toneMappingEnabled = true;
    //defaultPipeline.imageProcessing.contrast = 1.5;

    //var postProcess = new bjs.ColorCorrectionPostProcess("color_correction", "https://globalliquidity.blob.core.windows.net/bionictraderassets/images/lut-8mm.png", 1.0, this.camera);

    //defaultPipeline.sharpenEnabled = true;
    //defaultPipeline.sharpen.edgeAmount = 0.3;

    /*
        var colorGradingLUT = new bjs.ColorGradingTexture("https://globalliquidity.blob.core.windows.net/bionictraderassets/images/TRADE_8mm.3dl", this.bjsScene);
        defaultPipeline.imageProcessing.colorGradingEnabled = true;
        defaultPipeline.imageProcessing.colorGradingTexture = colorGradingLUT;
        */

    /*
        var curve = new bjs.ColorCurves();
        curve.globalHue = 200;
        curve.globalDensity = 50;
        curve.globalSaturation = 50;
        curve.highlightsHue = 20;
        curve.highlightsDensity = 50;
        curve.highlightsSaturation = -80;
        curve.shadowsHue = 2;
        curve.shadowsDensity = 80;
        curve.shadowsSaturation = 40;
        defaultPipeline.imageProcessing.colorCurves = curve;
        defaultPipeline.depthOfField.focalLength = 150;
        defaultPipeline.imageProcessing.colorCurvesEnabled = true;
        */

    //var postProcessTM = new bjs.TonemapPostProcess("tonemap", bjs.TonemappingOperator.Hable, 1.0, this.camera);

    /*
        this.xr = await this.bjsScene.createDefaultXRExperienceAsync({
            // floorMeshes: [(this.themeController.themes[0] as DayTheme).water?.water as bjs.Mesh]
        });

        if (this.xr && this.xr.baseExperience) 
        {
            this.xr.baseExperience.onStateChangedObservable.add((state) => {
                switch (state) 
                {
                    case bjs.WebXRState.IN_XR:
                        console.log("WebXRState : IN_XR");
                        // Start XR camera facing forward, not tilt.
                        //xrHelp.baseExperience.camera.rotate
                        //this.xr.baseExperience.camera.setTransformationFromNonVRCamera(this.camera,true);
                        //this.xr.baseExperience.camera.rotationQuaternion = bjs.Quaternion.FromEulerVector(new bjs.Vector3(0,Math.PI/2,0));
                        break;
                }
            });
        }
        */

    const url =
      'https://globalliquidity.blob.core.windows.net/bionictraderassets/images/UnderwaterGradientV1.jpg'
    const background = new bjs.Layer('back', url, this.bjsScene)
    background.isBackground = true

    this.registerActions()
    this.stateMachineService?.send('LOAD_GAME_COMPLETE')
    Logger.log('SCENE HAS CREATED_____________________________')

    SerumDexUIAdapter.Instance.onWalletConnected.subscribe(
      this.onWalletConnected.bind(this)
    )
    SerumDexUIAdapter.Instance.onWalletDisconnected.subscribe(
      this.onWalletDisconnected.bind(this)
    )
    SerumDexUIAdapter.Instance.onInitializationInProgress.subscribe(
      this.onInitializationInProgress.bind(this)
    )
    SerumDexUIAdapter.Instance.onInitializationComplete.subscribe(
      this.onInitializationComplete.bind(this)
    )
    SerumDexUIAdapter.Instance.onSettlementInProgress.subscribe(
      this.onSettlementInProgress.bind(this)
    )
    SerumDexUIAdapter.Instance.onSettlementComplete.subscribe(
      this.onSettlementComplete.bind(this)
    )
    SerumDexUIAdapter.Instance.onOrderTypeChanged.subscribe(
      this.onOrderTypeChanged.bind(this)
    )

    SettingsManager.Instance.onShowSkybox.subscribe((isEnabled: boolean) => {
      this.hdrSkybox?.setEnabled(isEnabled)
    })

    EventBus.Instance.emit('LOAD_GAME_COMPLETE')
  }

  public nextTheme = () => {
    EventBus.Instance.emit('NEXT_THEME')
    //this.themeController.nextTheme();
  }

  /*
    public onRaiseDivision = () => {      
       // this.priceDivisionManager.smaller();
    }

    public onDecreaseDivision = () => {
        //this.priceZoomInSound?.start(Tone.now());
       // this.priceDivisionManager.larger();
    }
    */

  private registerActions() {
    this.bjsScene.actionManager = new bjs.ActionManager(this.bjsScene)

    this.bjsScene.actionManager.registerAction(
      new bjs.ExecuteCodeAction(
        {
          trigger: bjs.ActionManager.OnKeyUpTrigger,
          parameter: '`',
        },
        this.toggleInspector.bind(this)
      )
    )

    this.bjsScene.actionManager.registerAction(
      new bjs.ExecuteCodeAction(
        {
          trigger: bjs.ActionManager.OnKeyUpTrigger,
          parameter: '.',
        },
        this.nextTheme.bind(this)
      )
    )

    // Add Events to raise and decrease Divison Manager
    /*
        this.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyDownTrigger,
                    parameter: '+'
                },
                this.onRaiseDivision
            )
        );

        this.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyDownTrigger,
                    parameter: '='
                },
                this.onRaiseDivision
            )
        );

        this.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyDownTrigger,
                    parameter: '-'
                },
                this.onDecreaseDivision
            )
        );

        this.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyDownTrigger,
                    parameter: 'd'
                },
                this.placeMarketBuyOrder.bind(this)
            )
        );

        this.bjsScene.actionManager.registerAction(
            new bjs.ExecuteCodeAction(
                {
                    trigger: bjs.ActionManager.OnKeyDownTrigger,
                    parameter: 'a'
                },
                this.placeMarketSellOrder.bind(this)
            )
        );
*/
    this.bjsScene.actionManager.registerAction(
      new bjs.ExecuteCodeAction(
        {
          trigger: bjs.ActionManager.OnKeyDownTrigger,
          parameter: 'c',
        },
        this.attachCamera.bind(this)
      )
    )

    this.bjsScene.actionManager.registerAction(
      new bjs.ExecuteCodeAction(
        {
          trigger: bjs.ActionManager.OnKeyUpTrigger,
          parameter: 'c',
        },
        this.detachCamera.bind(this)
      )
    )

    this.bjsScene.actionManager.registerAction(
      new bjs.ExecuteCodeAction(
        {
          trigger: bjs.ActionManager.OnKeyUpTrigger,
          parameter: 'f',
        },
        this.toggleFullscreen.bind(this)
      )
    )
  }

  public toggleFullscreen() {
    if (!this.isFullscreen) {
      this.engine?.enterFullscreen(false)
      this.isFullscreen = true
      this.fullScreenGUI?.showSmartOrderPanel()
    } else {
      this.engine?.exitFullscreen()
      this.isFullscreen = false
      this.fullScreenGUI?.hideSmartOrderPanel()
    }
  }

  public processEvent(_event: string, _eventData: string) {
    // switch(event)
    // {
    //     case "RESET_GAME":
    //     {
    //         Logger.log("LocalGameSession : Processing Event : " + event);
    //         this.stateMachineService.send( { type: event, data:eventData } );
    //         break;
    //     }
    // }
  }

  /*
    public placeMarketBuyOrder()
    {   
        Logger.log("TradeSerumScene : Placing Market Buy Order"); 
        this.tradingSession?.processEvent("BUY_AT_MARKET","");
        EventBus.Instance.emit('ENGAGED_BUY_BUTTON');
        //this.isInTrade = true;
    }

    public placeMarketSellOrder()
    {   
        Logger.log("GameplayScene : Placing Market Sell Order");
        this.tradingSession?.processEvent("SELL_AT_MARKET","");
        EventBus.Instance.emit('ENGAGED_SELL_BUTTON');
        //this.isInTrade = true;    
    }
    */

  protected async setupCamera() {
    this.camera = new bjs.ArcRotateCamera(
      'MainCamera',
      0,
      0,
      0,
      new bjs.Vector3(0, 0, 0),
      this.bjsScene
    )

    if (this.camera && this.bjsScene) {
      this.camera.attachControl(this.canvas, true)
    }

    this.camera.detachControl()
  }

  public reset() {
    if (this.sampler) this.sampler.clear()
    // EventBus.Instance.emit('INIT_THEME');
    // this.depthFinder?.reset();
    // this.fullScreenUI?.reset();
    // EventBus.Instance.emit("LOCAL_MIC_MUTED");
  }

  public stop() {
    if (this.sampler) this.sampler.stop()
  }

  public resume() {}

  public showStatusMessage(
    message: string,
    color: GLSGColor = GLSGColor.Aqua,
    persist = false
  ) {
    if (this.depthFinder)
      this.depthFinder.hud?.showStatus(message, color, persist)
  }

  onStatusMessage(message: string) {
    this.showStatusMessage(message)
  }

  onWalletConnected(_walletAddress: string) {
    SoundPlayer.Instance.playSound(TradeSounds.ENGAGE, -12)
    this.showStatusMessage('WALLET CONNECTED')
  }

  onWalletDisconnected() {
    SoundPlayer.Instance.playSound(TradeSounds.DISENGAGE, -12)
    this.showStatusMessage('WALLET DISCONNECTED')
  }

  onInitializationInProgress() {
    SoundPlayer.Instance.playSound(TradeSounds.SYNCHRONIZING, -18, true)
    this.showStatusMessage('SYNCHRONIZING', GLSGColor.Yellow, true)
  }

  onInitializationComplete() {
    SoundPlayer.Instance.playSound(TradeSounds.PROGRESS_COMPLETE, -12)
    SoundPlayer.Instance.stopSound(TradeSounds.SYNCHRONIZING)
    this.showStatusMessage('READY TO TRADE', GLSGColor.Orange)
  }

  onSettlementInProgress() {
    SoundPlayer.Instance.playSound(TradeSounds.SETTLING_FUNDS, -18, true)
    this.showStatusMessage('SETTLING FUNDS', GLSGColor.Blue, false)
  }

  onSettlementComplete() {
    SoundPlayer.Instance.playSound(TradeSounds.PURCHASE_COMPLETE, -12)
    SoundPlayer.Instance.stopSound(TradeSounds.SETTLING_FUNDS)
    this.showStatusMessage('FUNDS SETTLED', GLSGColor.Orange)
  }

  onOrderTypeChanged(orderType: SmartOrderType) {
    SoundPlayer.Instance.playSound(TradeSounds.SELECT_UP, 0)

    let statusMessage = ''
    let statusMessageColor: GLSGColor = GLSGColor.Blue

    statusMessage = SmartOrderType[orderType]
    statusMessage = statusMessage.replace('_', ' ')

    if (statusMessage.includes('BID')) statusMessageColor = GLSGColor.DarkGreen
    else if (statusMessage.includes('BUY')) statusMessageColor = GLSGColor.Green
    else if (statusMessage.includes('OFFER'))
      statusMessageColor = GLSGColor.DarkRed
    else if (statusMessage.includes('SELL')) statusMessageColor = GLSGColor.Red

    this.showStatusMessage(statusMessage, statusMessageColor)

    switch (orderType) {
      case SmartOrderType.JOIN_BID:
        statusMessage = 'JOIN BID'
        break
      case SmartOrderType.SHAVE_BID:
        statusMessage = 'SHAVE BID'
    }
  }

  protected async onPreRender() {
    if (this.sampler && this.sampler.isLoaded) {
      let orderImbalanceFactor: number = this.sampler.orderImbalance * 0.025

      if (orderImbalanceFactor < 0) {
        orderImbalanceFactor = Math.max(-Math.PI / 6, orderImbalanceFactor)
      } else {
        orderImbalanceFactor = Math.min(Math.PI / 6, orderImbalanceFactor)
      }

      if (this.audioIsEnabled) {
        if (!this.audioIsInitalized) {
          this.audioIsInitalized = true
        }

        if (this.previousMidPrice.value === 0) {
          Logger.log(
            'DepthFinderScene : Setting Initial Midprice ' +
              this.sampler.midPrice
          )
          this.previousMidPrice = this.sampler.midPrice
        } else {
          if (this.sampler.midPrice < this.previousMidPrice) {
            Logger.log('DepthFinderScene : MidPrice Uptick')
            this.previousMidPrice = this.sampler.midPrice
            // this.playSound(DepthFinderSound.UpTick);
          } else if (this.sampler.midPrice > this.previousMidPrice) {
            Logger.log('DepthFinderScene : MidPrice Downtick')
            this.previousMidPrice = this.sampler.midPrice
            //this.playSound(DepthFinderSound.DownTick);
          }
        }
      }
    }
  }

  public resumeSounds() {
    if (this.upTickSound) {
      if (this.upTickSound.context) {
        if (this.upTickSound.context.state === 'suspended') {
          this.upTickSound.resume()
        }
      }
    }

    if (this.downTickSound) {
      if (this.downTickSound.context) {
        if (this.downTickSound.context.state === 'suspended') {
          this.downTickSound.resume()
        }
      }
    }
  }

  protected toggleInspector(): void {
    if (this.inspectorIsVisible) {
      this.bjsScene.debugLayer.hide()
      this.inspectorIsVisible = false
    } else {
      this.bjsScene.debugLayer.show({ overlay: true })
      this.inspectorIsVisible = true
    }
  }

  protected onRender() {
    const aspectRatio =
      (this.canvas.clientHeight * this.camera.viewport.height) /
      (this.canvas.clientWidth * this.camera.viewport.width)

    if (aspectRatio < 1) {
      this.camera.fov = 0.5 - (1 - aspectRatio) * 0.2
      //4 this.cameraHomeRadius = this.cameraStartingRadius + ((1 / aspectRatio));
      // let betaAdjustFactor: number = (1 / aspectRatio) * 2.83;
      // this.cameraHomeBeta = Math.PI / 2 - (Math.PI) / (4 + betaAdjustFactor);
    } else if (aspectRatio === 1) {
      // this.cameraHomeRadius = this.cameraStartingRadius;
    } else {
      // this.camera.radius = this.camera.radius * (1 - aspectRatio * 0.005);
      this.camera.fov = 0.5 + aspectRatio * 0.6
      // this.cameraHomeRadius = this.cameraStartingRadius + (aspectRatio);
      //   let betaAdjustFactor: number = (aspectRatio * 0.25);
      //this.cameraHomeBeta = Math.PI / 2 - (Math.PI) / (20 - betaAdjustFactor);
    }

    //const inTradeCameraOffsetAlpha : number = Math.PI/8;
    // const inTradeCameraOffsetBeta : number = Math.PI/36;

    /*
        if (false)
        {
            //this.camera.radius = bjs.Scalar.Lerp(this.camera.radius,this.cameraTradeRadius,0.1);

            if (this.tradingSession?.openTradeDirection === TradeDirection.Long)
            {
                this.camera.target = bjs.Vector3.Lerp(this.camera.target, this.cameraLongTarget,0.05);
                this.camera.alpha = bjs.Scalar.Lerp(this.camera.alpha, this.cameraHomeAlpha + inTradeCameraOffsetAlpha, 0.05);
            }
            else
            {
                
                this.camera.target = bjs.Vector3.Lerp(this.camera.target, this.cameraShortTarget,0.05);
                this.camera.alpha = bjs.Scalar.Lerp(this.camera.alpha, this.cameraHomeAlpha - inTradeCameraOffsetAlpha, 0.05);
                //this.camera.beta = bjs.Scalar.Lerp(this.camera.beta, this.cameraHomeBeta + inTradeCameraOffsetBeta, 0.05);
            }
        }
        else
        {
            //this.camera.radius = bjs.Scalar.Lerp(this.camera.radius,this.cameraHomeRadius,0.1);
            //this.camera.target = bjs.Vector3.Lerp(this.camera.target, this.cameraHomeTarget,0.1);
            //this.camera.alpha = bjs.Scalar.Lerp(this.camera.alpha, this.cameraHomeAlpha, 0.1);
            //this.camera.beta = bjs.Scalar.Lerp(this.camera.beta, this.cameraHomeBeta, 0.1);
        }
        */
  }

  public destroy() {
    this.bjsScene.dispose()
  }

  public initCamera() {
    if (this.sceneType === SceneFormatType.Portrait) {
      this.cameraHomeAlpha = Math.PI / 2 - Math.PI / 3
      this.cameraHomeBeta = Math.PI / 2
      //this.cameraHomeRadius = 42;
      this.camera.target = new bjs.Vector3(-0.08, 9.77, -1.01) //Portrait mode
      this.camera.alpha = this.cameraHomeAlpha //Portrait mode
      this.camera.beta = this.cameraHomeBeta
    } else {
      this.cameraHomeAlpha = -Math.PI / 2
      this.cameraHomeBeta = Math.PI / 2 - Math.PI / 16
      //this.cameraHomeRadius = 75;
      this.camera.target = new bjs.Vector3(0, 9, 10)
      this.camera.alpha = this.cameraHomeAlpha
      this.camera.beta = this.cameraHomeBeta
    }

    this.camera.radius = this.cameraHomeRadius
  }

  protected onFormat() {
    this.initCamera()
  }
}
