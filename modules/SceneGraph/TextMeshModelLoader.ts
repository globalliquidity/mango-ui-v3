import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SolidParticleMaterial } from './SolidParticleMaterial'
import { GLSGColor } from './Enums'
import { Scene } from './Scene'

export class TextMeshModelLoader {
  // private static _instance: TextMeshModelLoader;
  private static _instances: Map<string, TextMeshModelLoader> = new Map<
    string,
    TextMeshModelLoader
  >()

  private characterMeshes: Map<string, bjs.Mesh> = new Map<string, bjs.Mesh>()
  public isLoaded = false

  private textMaterial!: SolidParticleMaterial

  private characterPool: Map<string, Array<bjs.InstancedMesh>> = new Map<
    string,
    Array<bjs.InstancedMesh>
  >()
  private expandIndex = 0
  private scene!: Scene

  private characterSet!: bjs.TransformNode

  private constructor() {}

  public async init(scene: Scene) {
    if (!this.isLoaded) {
      this.scene = scene
      this.textMaterial = new SolidParticleMaterial('text', scene)
      this.textMaterial.roughness = 0.15
      this.textMaterial.metallic = 0.35
      //this.textMaterial.freeze();
      this.characterSet = new bjs.TransformNode('Character Set', scene.bjsScene)
      await this.loadMeshes(scene.bjsScene)
      this.isLoaded = true
    }
  }

  async loadMeshes(scene: bjs.Scene) {
    // let asset : GLSGAsset | undefined = AssetManager.Instance.getAsset("Font_Conthrax_New");

    // if (asset)
    // {

    const mesh = await bjs.SceneLoader.ImportMeshAsync(
      null,
      process.env.REACT_APP_TRADE_RESOURCE_MODELS_BASE_URL || '',
      'Font_Conthrax_New_With_SymbolsV13.babylon.gz',
      this.scene.bjsScene
    )
    const meshM = await bjs.SceneLoader.ImportMeshAsync(
      null,
      process.env.REACT_APP_TRADE_RESOURCE_MODELS_BASE_URL || '',
      'Font_Conthrax_New_M_OnlyV1.babylon.gz',
      this.scene.bjsScene
    )

    /*   await Promise.all([promise1,promise2]).then(

                let fontMeshes = promise1..meshes;


            );
*/

    // const minusmodel = await bjs.SceneLoader.ImportMeshAsync(null, process.env.TRADE_RESOURCE_MODELS_BASE_URL, 'Minus.glb', this.scene.bjsScene);

    const fontMeshes = mesh.meshes

    if (fontMeshes) {
      // Logger.log("TextMeshModelLoader - Loading " + fontMeshes?.length + " characters.")

      for (let i = 0; i <= 9; i++) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[i],
          scene
        )

        if (fontMesh) {
          this.characterMeshes.set(i.toString(), fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set(i.toString(), individualCharaterPool)
        }
      }

      if (fontMeshes[10]) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[10],
          scene
        )

        if (fontMesh) {
          this.characterMeshes.set('.', fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set('.', individualCharaterPool)
        }
      }

      if (fontMeshes[11]) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[11],
          scene
        )

        if (fontMesh) {
          this.characterMeshes.set('/', fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set('/', individualCharaterPool)
          this.isLoaded = true
        }
      }

      for (let j = 12; j < 38; j++) {
        let fontMesh: bjs.Mesh | undefined

        if (j === 24) {
          const mMesh: bjs.Mesh = meshM.meshes[0] as bjs.Mesh

          // let clonedM : bjs.Mesh = mMesh.clone();

          fontMesh = this.configureMesh(mMesh, scene)

          if (fontMesh) {
            //fontMesh.rotate(bjs.Axis.X,Math.PI,bjs.Space.LOCAL);
            //fontMesh.rotate(bjs.Axis.Y,Math.PI,bjs.Space.LOCAL);
            const currentCharacter = 'M'
            this.characterMeshes.set(currentCharacter, fontMesh)
            const individualCharaterPool = new Array<bjs.InstancedMesh>()
            this.characterPool.set(currentCharacter, individualCharaterPool)
          }
        } else {
          fontMesh = this.configureMesh(fontMeshes[j], scene)

          const asciiValueOfA = 65

          if (fontMesh) {
            const currentAsciiValue = asciiValueOfA + (j - 12)
            const currentCharacter = String.fromCharCode(currentAsciiValue)
            this.characterMeshes.set(currentCharacter, fontMesh)
            const individualCharaterPool = new Array<bjs.InstancedMesh>()
            this.characterPool.set(currentCharacter, individualCharaterPool)
          }
        }
      }

      if (fontMeshes[38]) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[38],
          scene
        )
        if (fontMesh) {
          this.characterMeshes.set('+', fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set('+', individualCharaterPool)
        }
      }

      if (fontMeshes[39]) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[39],
          scene
        )
        if (fontMesh) {
          this.characterMeshes.set('-', fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set('-', individualCharaterPool)
        }
      }

      if (fontMeshes[40]) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[40],
          scene
        )
        if (fontMesh) {
          this.characterMeshes.set('?', fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set('?', individualCharaterPool)
        }
      }

      if (fontMeshes[41]) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[41],
          scene
        )
        if (fontMesh) {
          this.characterMeshes.set('$', fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set('$', individualCharaterPool)
        }
      }

      if (fontMeshes[42]) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[42],
          scene
        )
        if (fontMesh) {
          this.characterMeshes.set(':', fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set(':', individualCharaterPool)
        }
      }

      if (fontMeshes[43]) {
        const fontMesh: bjs.Mesh | undefined = this.configureMesh(
          fontMeshes[43],
          scene
        )
        if (fontMesh) {
          this.characterMeshes.set(',', fontMesh)
          const individualCharaterPool = new Array<bjs.InstancedMesh>()
          this.characterPool.set(',', individualCharaterPool)
        }
      }
    }

    /*
            if (minusMesh)
            {
                const minusMeshAdjusted : bjs.Mesh | undefined = this.configureMesh(minusMesh, scene);

                if (minusMeshAdjusted)
                    this.characterMeshes.set("-",minusMeshAdjusted);
            }
            */
    // }
  }

  private configureMesh(
    abMesh: bjs.AbstractMesh,
    scene: bjs.Scene
  ): bjs.Mesh | undefined {
    const mesh = abMesh as bjs.Mesh

    if (!mesh) return undefined

    //mesh.convertToUnIndexedMesh();
    mesh.material = this.textMaterial
    mesh.material['disableLighting'] = true
    mesh.rotation.x = -Math.PI / 2
    mesh.isVisible = false
    mesh._scene = scene
    mesh.parent = this.characterSet
    mesh.alwaysSelectAsActiveMesh = true
    mesh.registerInstancedBuffer('uv', 4)
    mesh.instancedBuffers.uv = SolidParticleMaterial.getUVSforColor(
      GLSGColor.Purple
    )
    this.scene.glowLayer.addIncludedOnlyMesh(mesh)
    return mesh
  }

  public getCharacterMesh(character: string): bjs.Mesh | undefined {
    if (this.isLoaded) {
      if (this.characterMeshes.has(character)) {
        const characterMesh: bjs.Mesh | undefined =
          this.characterMeshes.get(character)

        if (characterMesh) return characterMesh
        else return undefined
      }
    }
    return undefined
  }

  public getCharacterInstance(
    character: string
  ): bjs.InstancedMesh | undefined {
    const individualCharaterPool = this.characterPool.get(character)

    if (individualCharaterPool === null || individualCharaterPool === undefined)
      return undefined

    if (individualCharaterPool.length === 0) {
      const characterMesh: bjs.Mesh | undefined =
        this.characterMeshes.get(character)

      if (characterMesh)
        return characterMesh.createInstance(
          character + '_' + (this.expandIndex++).toString()
        )
    }

    return individualCharaterPool.pop()
  }

  public storeCharacterInstance(character: bjs.InstancedMesh): void {
    const key = character.name.split('_')[0]
    const individualCharaterPool = this.characterPool.get(key)

    if (individualCharaterPool) {
      character.parent = this.characterSet
      individualCharaterPool.push(character)
      character.isVisible = false
    }
  }

  // public static get Instance()
  // {
  //     // Do you need arguments? Make it a regular static method instead.
  //     return this._instance || (this._instance = new this());
  // }

  public static Instance(scene = 'Bionic Trader') {
    let instance = this._instances.get(scene)
    if (instance) return instance

    instance = new this()
    this._instances.set(scene, instance)

    return instance
  }
}
