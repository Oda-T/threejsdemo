// https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_morph.html
// http://www.webgl3d.cn/threejs/examples/#webgl_animation_skinning_morph

import * as THREE from 'three'

import Stats from 'three/examples/jsm/libs/stats.module.js'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'

var container, clock, light, stats, loader, gui, mixer, actions, activeAction, previousAction

var camera, scene, renderer, model

var api = { state: 'Walking' }

init()
animate()

function init() {
  container = document.createElement('div')
  document.body.appendChild(container)

  // 相机
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100)
  camera.position.set(-5, 3, 10)
  camera.lookAt(new THREE.Vector3(0, 2, 0))

  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  // 跟踪时间
  clock = new THREE.Clock()

  // lights
  light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 20, 0)
  scene.add(light)

  // ground 地面材质
  //   var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }))
  //   mesh.rotation.x = -Math.PI / 2
  //   scene.add(mesh)

  //   var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
  //   grid.material.opacity = 0.2
  //   grid.material.transparent = true
  //   scene.add(grid)

  // 载入glb模型
  loader = new GLTFLoader()
  loader.load(
    'static/models/RobotExpressive.glb',
    gltf => {
      model = gltf.scene
      scene.add(model)

      //  gltf.animations 动画列表
      createGUI(model, gltf.animations)
    },
    undefined,
    e => {
      console.error(e)
    }
  )

  // render方法
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputEncoding = THREE.sRGBEncoding
  container.appendChild(renderer.domElement)

  // stats
  stats = new Stats()
  container.appendChild(stats.dom)
}

// 动画
function animate() {
  var dt = clock.getDelta()

  if (mixer) mixer.update(dt)

  requestAnimationFrame(animate) // key

  renderer.render(scene, camera)
}

// 载入成功回调
function createGUI(model, animations) {
  var states = []

  gui = new GUI()

  mixer = new THREE.AnimationMixer(model)

  actions = {}

  for (var i = 0; i < animations.length; i++) {
    var clip = animations[i]
    var action = mixer.clipAction(clip)

    states.push(clip.name)

    actions[clip.name] = action

    // 阻止loop

    // if (states.indexOf(clip.name) >= 4) {
    //   action.clampWhenFinished = true
    //   action.loop = THREE.LoopOnce
    // }
  }
  // states 动作
  var statesFolder = gui.addFolder('States')
  var clipCtrl = statesFolder.add(api, 'state').options(states)

  clipCtrl.onChange(() => {
    fadeToAction(api.state, 0.5)
  })

  statesFolder.open()

  activeAction = actions['Walking']
  activeAction.play()

  // 切换渐变
  function fadeToAction(name, duration) {
    previousAction = activeAction
    activeAction = actions[name]

    if (previousAction !== activeAction) {
      previousAction.fadeOut(duration)
    }

    activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play()
  }
}
