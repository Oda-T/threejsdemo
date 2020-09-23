// https://github.com/mrdoob/three.js/blob/master/examples/webgl_multiple_elements.html
// http://www.webgl3d.cn/threejs/examples/#webgl_multiple_elements

// https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_multiple.html
// http://www.webgl3d.cn/threejs/examples/#webgl_animation_multiple

// 多对象
import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'

var worldScene = null
var renderer = null
var camera = null
var clock = null
var mixers = []

// 模型组
var MODELS = [{ name: 'Soldier' }, { name: 'Parrot' }]
// 定义模型位置、缩放、动画
var UNITS = [
  {
    modelName: 'Soldier',
    meshName: 'vanguard_Mesh',
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    animationName: 'Idle'
  },
  {
    modelName: 'Soldier',
    meshName: 'vanguard_Mesh',
    position: { x: 3, y: 0, z: 0 },
    scale: 2,
    animationName: 'Walk'
  },
  {
    modelName: 'Soldier',
    meshName: 'vanguard_Mesh',
    position: { x: 1, y: 0, z: 0 },
    scale: 1,
    animationName: 'Run'
  },
  {
    modelName: 'Parrot',
    meshName: 'mesh_0',
    position: { x: -4, y: 0, z: 0 },
    rotation: { x: 0, y: Math.PI, z: 0 },
    scale: 0.01,
    animationName: 'parrot_A_'
  },
  {
    modelName: 'Parrot',
    meshName: 'mesh_0',
    position: { x: -2, y: 0, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    scale: 0.02,
    animationName: null
  }
]

var numLoadedModels = 0

initScene()
initRenderer()
loadModels()
animate()

function initScene() {
  // 相机
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.set(3, 6, -10)
  camera.lookAt(0, 1, 0)

  // 时钟
  clock = new THREE.Clock()

  // 场景
  worldScene = new THREE.Scene()
  worldScene.background = new THREE.Color(0xa0a0a0)
  worldScene.fog = new THREE.Fog(0xa0a0a0, 10, 22)

  // 光影1
  var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
  hemiLight.position.set(0, 20, 0)
  worldScene.add(hemiLight)

  // 光影2
  var dirLight = new THREE.DirectionalLight(0xffffff)
  dirLight.position.set(-3, 10, -10)
  dirLight.castShadow = true
  dirLight.shadow.camera.top = 10
  dirLight.shadow.camera.bottom = -10
  dirLight.shadow.camera.left = -10
  dirLight.shadow.camera.right = 10
  dirLight.shadow.camera.near = 0.1
  dirLight.shadow.camera.far = 40
  worldScene.add(dirLight)

  // 地面
  var groundMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(40, 40),
    new THREE.MeshPhongMaterial({
      color: 0x999999,
      depthWrite: false
    })
  )

  groundMesh.rotation.x = -Math.PI / 2
  groundMesh.receiveShadow = true
  worldScene.add(groundMesh)
}

// 初始化render
function initRenderer() {
  var container = document.createElement('div')
  document.body.appendChild(container)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  renderer.outputEncoding = THREE.sRGBEncoding

  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)
}

// loader 模型
function loadModels() {
  for (var i = 0; i < MODELS.length; ++i) {
    var m = MODELS[i]

    loadGltfModel(m, function () {
      ++numLoadedModels

      if (numLoadedModels === MODELS.length) {
        instantiateUnits()
      }
    })
  }
}

// gltf loader
function loadGltfModel(model, onLoaded) {
  var loader = new GLTFLoader()

  var modelName = 'static/models/gltf/' + model.name + '.glb'

  loader.load(modelName, function (gltf) {
    var scene = gltf.scene

    model.animations = gltf.animations
    model.scene = scene

    // 加载影子

    gltf.scene.traverse(function (object) {
      if (object.isMesh) {
        object.castShadow = true
      }
    })

    onLoaded()
  })
}

// 加载成功回调
function instantiateUnits() {
  for (var i = 0; i < UNITS.length; ++i) {
    var u = UNITS[i]
    var model = getModelByName(u.modelName)

    // 场景克隆并 组合
    if (model) {
      var clonedScene = SkeletonUtils.clone(model.scene)

      if (clonedScene) {
        var clonedMesh = clonedScene.getObjectByName(u.meshName)

        if (clonedMesh) {
          var mixer = startAnimation(clonedMesh, model.animations, u.animationName)

          mixers.push(mixer)
        }
        worldScene.add(clonedScene)

        if (u.position) {
          clonedScene.position.set(u.position.x, u.position.y, u.position.z)
        }

        if (u.scale) {
          clonedScene.scale.set(u.scale, u.scale, u.scale)
        }

        if (u.rotation) {
          clonedScene.rotation.x = u.rotation.x
          clonedScene.rotation.y = u.rotation.y
          clonedScene.rotation.z = u.rotation.z
        }
      }
    } else {
      console.error('Can not find model', u.modelName)
    }
  }
}

function getModelByName(name) {
  for (var i = 0; i < MODELS.length; ++i) {
    if (MODELS[i].name === name) {
      return MODELS[i]
    }
  }

  return null
}

function startAnimation(skinnedMesh, animations, animationName) {
  var mixer = new THREE.AnimationMixer(skinnedMesh)
  var clip = THREE.AnimationClip.findByName(animations, animationName)

  if (clip) {
    var action = mixer.clipAction(clip)
    action.play()
  }

  return mixer
}

function animate() {
  requestAnimationFrame(animate)

  var mixerUpdateDelta = clock.getDelta()

  for (var i = 0; i < mixers.length; ++i) {
    mixers[i].update(mixerUpdateDelta)
  }

  renderer.render(worldScene, camera)
}
