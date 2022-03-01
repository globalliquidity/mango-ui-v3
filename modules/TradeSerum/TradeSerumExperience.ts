import { Experience } from '@/modules/SceneGraph/Experience'
import { SceneManager } from '@/modules/SceneGraph/SceneManager'
import { ViewportPosition } from '@/modules/SceneGraph/Enums'
import { TradeSerumScene } from './TradeSerumScene'
import Logger from '@/modules/SceneGraph/Logger'
import { Scene } from '@/modules/SceneGraph/Scene'
import { PriceDivisionManager } from './PriceDivision/PriceDivisionManager'
import { PriceDivisionSetting } from './PriceDivision/PriceDivisionSetting'
import { PriceRangePercentage } from './Enums'
export class TradeSerumExperience extends Experience {
  private scene!: TradeSerumScene

  private isLiveTrading = false

  public onSamplerLoad?: () => Record<string, unknown>
  public exchangeType = 'binance'
  public pairType = 'btc-usdt'
  public exchangeOptions?: Array<any>

  public assetsPath = [
    {
      type: 'cubetexture',
      name: 'BrighterSkyLow',
      url: this.experienceBaseUrl,
      fileName: 'ToonSkyFour.env',
      async: false,
    },
    {
      type: 'cubetexture',
      name: 'TokyoNightBlurLow',
      url: this.experienceBaseUrl,
      fileName: 'TokyoNightCrystal512.env',
      async: false,
    },
  ]

  constructor(
    public title: string,
    public canvas: HTMLCanvasElement,
    public useVR: boolean
  ) {
    super(title, canvas)
    const onePercentPriceDivisionSetting = new PriceDivisionSetting(
      PriceRangePercentage.OnePercent,
      3
    )
    //const twoPercentPriceDivisionSetting = new PriceDivisionSetting(PriceRangePercentage.TwoPercent, 3);
    //const fivePercentPriceDivisionSetting = new PriceDivisionSetting(PriceRangePercentage.FivePercent, 3);
    //const tenPercentPriceDivisionSetting = new PriceDivisionSetting(PriceRangePercentage.TenPercent, 3);
    //const oneHundredPercentPriceDivisionSetting = new PriceDivisionSetting(PriceRangePercentage.TenPercent, 3);

    PriceDivisionManager.Instance.initialize(
      onePercentPriceDivisionSetting,
      100
    ) // Default Division
    //PriceDivisionManager.Instance.addPriceDivisionSetting(twoPercentPriceDivisionSetting);
    //PriceDivisionManager.Instance.addPriceDivisionSetting(fivePercentPriceDivisionSetting);
    //PriceDivisionManager.Instance.addPriceDivisionSetting(tenPercentPriceDivisionSetting);
    //PriceDivisionManager.Instance.addPriceDivisionSetting(tenPercentPriceDivisionSetting);
    //PriceDivisionManager.Instance.addPriceDivisionSetting(oneHundredPercentPriceDivisionSetting);
    //PriceDivisionManager.Instance.setCurrentPriceRangePercentage(PriceRangePercentage.OnePercent);
  }

  protected onLoad() {
    Logger.log('Experience : onLoad')

    this.scene = new TradeSerumScene(
      'TradeSerum Scene',
      this.canvas,
      this.isLiveTrading
    )
    this.AddScene(this.scene)
    this.loadScene(this.scene)
  }

  loadScene(_scene: Scene) {
    if (SceneManager.Instance.scenes.length === 1) {
      if (SceneManager.Instance.scenes[0].title === 'emptyScene') {
        SceneManager.Instance.scenes.shift()
      }
    }

    if (SceneManager.Instance.scenes.length === 0) {
      this.AddScene(this.scene)
      SceneManager.Instance.LoadScene(
        this.scene,
        this.canvas,
        ViewportPosition.Full
      )
      this.scene.show()
    }
  }
}
