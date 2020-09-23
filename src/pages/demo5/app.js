// https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_minecraft.html
// http://www.webgl3d.cn/threejs/examples/#webgl_geometry_minecraft

// http://www.webgl3d.cn/threejs/examples/#misc_controls_pointerlock
// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
// 第一视角 移动

import * as THREE from 'three'

import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'

// import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'

// 柏林噪声
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'

import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

var container

var camera, controls, scene, renderer

var worldWidth = 128
var worldDepth = 128
var worldHalfWidth = worldWidth / 2
var worldHalfDepth = worldDepth / 2

var data = generateHeight(worldWidth, worldDepth)

var clock = new THREE.Clock()

init()

animate()

function init() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000)
  camera.position.y = getY(worldHalfWidth, worldHalfDepth) * 100 + 100

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xbfd1e5)

  // sides

  var matrix = new THREE.Matrix4()

  var pxGeometry = new THREE.PlaneBufferGeometry(100, 100)
  pxGeometry.attributes.uv.array[1] = 0.5
  pxGeometry.attributes.uv.array[3] = 0.5
  pxGeometry.rotateY(Math.PI / 2)
  pxGeometry.translate(50, 0, 0)

  var nxGeometry = new THREE.PlaneBufferGeometry(100, 100)
  nxGeometry.attributes.uv.array[1] = 0.5
  nxGeometry.attributes.uv.array[3] = 0.5
  nxGeometry.rotateY(-Math.PI / 2)
  nxGeometry.translate(-50, 0, 0)

  var pyGeometry = new THREE.PlaneBufferGeometry(100, 100)
  pyGeometry.attributes.uv.array[5] = 0.5
  pyGeometry.attributes.uv.array[7] = 0.5
  pyGeometry.rotateX(-Math.PI / 2)
  pyGeometry.translate(0, 50, 0)

  var pzGeometry = new THREE.PlaneBufferGeometry(100, 100)
  pzGeometry.attributes.uv.array[1] = 0.5
  pzGeometry.attributes.uv.array[3] = 0.5
  pzGeometry.translate(0, 0, 50)

  var nzGeometry = new THREE.PlaneBufferGeometry(100, 100)
  nzGeometry.attributes.uv.array[1] = 0.5
  nzGeometry.attributes.uv.array[3] = 0.5
  nzGeometry.rotateY(Math.PI)
  nzGeometry.translate(0, 0, -50)

  //

  var geometries = []

  for (var z = 0; z < worldDepth; z++) {
    for (var x = 0; x < worldWidth; x++) {
      var h = getY(x, z)

      matrix.makeTranslation(x * 100 - worldHalfWidth * 100, h * 100, z * 100 - worldHalfDepth * 100)

      var px = getY(x + 1, z)
      var nx = getY(x - 1, z)
      var pz = getY(x, z + 1)
      var nz = getY(x, z - 1)

      geometries.push(pyGeometry.clone().applyMatrix4(matrix))

      if ((px !== h && px !== h + 1) || x === 0) {
        geometries.push(pxGeometry.clone().applyMatrix4(matrix))
      }

      if ((nx !== h && nx !== h + 1) || x === worldWidth - 1) {
        geometries.push(nxGeometry.clone().applyMatrix4(matrix))
      }

      if ((pz !== h && pz !== h + 1) || z === worldDepth - 1) {
        geometries.push(pzGeometry.clone().applyMatrix4(matrix))
      }

      if ((nz !== h && nz !== h + 1) || z === 0) {
        geometries.push(nzGeometry.clone().applyMatrix4(matrix))
      }
    }
  }

  var geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)

  geometry.computeBoundingSphere()

  var texture = new THREE.TextureLoader().load('static/minecraft/atlas.png')

  texture.magFilter = THREE.NearestFilter

  var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }))
  scene.add(mesh)

  var ambientLight = new THREE.AmbientLight(0xcccccc)
  scene.add(ambientLight)

  var directionalLight = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight.position.set(1, 1, 0.5).normalize()
  scene.add(directionalLight)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  controls = new FirstPersonControls(camera, renderer.domElement)

  controls.movementSpeed = 1000
  controls.lookSpeed = 0.125
  controls.lookVertical = true
}

function generateHeight(width, height) {
  var data = []
  var perlin = new ImprovedNoise()
  var size = width * height
  var quality = 2
  var z = Math.random() * 100

  for (var j = 0; j < 4; j++) {
    if (j === 0) for (var i = 0; i < size; i++) data[i] = 0

    for (let i = 0; i < size; i++) {
      var x = i % width
      var y = (i / width) | 0
      data[i] += perlin.noise(x / quality, y / quality, z) * quality
    }

    quality *= 4
  }

  return data
}

function getY(x, z) {
  return (data[x + z * worldWidth] * 0.2) | 0
}

function animate() {
  requestAnimationFrame(animate)

  render()
}

function render() {
  controls.update(clock.getDelta())
  renderer.render(scene, camera)
}
