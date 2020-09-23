// https://github.com/mrdoob/three.js/blob/master/examples/webgl_effects_parallaxbarrier.html
// http://www.webgl3d.cn/threejs/examples/#webgl_effects_parallaxbarrier

// https://github.com/mrdoob/three.js/blob/master/examples/webgl_lightprobe.html
// http://www.webgl3d.cn/threejs/examples/#webgl_lightprobe

// https://github.com/mrdoob/three.js/blob/master/examples/webgl_panorama_cube.html
// http://www.webgl3d.cn/threejs/examples/#webgl_panorama_cube

// https://github.com/mrdoob/three.js/blob/master/examples/webgl_panorama_equirectangular.html
// http://www.webgl3d.cn/threejs/examples/#webgl_panorama_equirectangular

// 裸眼3D

import * as THREE from 'three'

var container, mesh, camera, scene, renderer

var isUserInteracting = false
var onMouseDownMouseX = 0
var onMouseDownMouseY = 0
var lon = 0
var onMouseDownLon = 0
var lat = 0
var onMouseDownLat = 0
var phi = 0
var theta = 0

init()
animate()

function init() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100)
  camera.target = new THREE.Vector3(0, 0, 0)

  scene = new THREE.Scene()

  var geometry = new THREE.SphereBufferGeometry(500, 60, 40) // 球形缓慢旋转的几何体
  geometry.scale(-1, 1, 1)

  var texture = new THREE.TextureLoader().load('static/cube/2294472375_24a3b8ef46_o.jpg')

  var material = new THREE.MeshBasicMaterial({ map: texture })

  mesh = new THREE.Mesh(geometry, material)

  scene.add(mesh)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  // 鼠标事件监听
  document.addEventListener('mousedown', onPointerStart)
  document.addEventListener('mousemove', onPointerMove)
  document.addEventListener('mouseup', onPointerUp)

  // 触摸
  document.addEventListener('touchstart', onPointerStart)
  document.addEventListener('touchmove', onPointerMove)
  document.addEventListener('touchend', onPointerUp)

  // 滚轮
  document.addEventListener('wheel', onDocumentMouseWheel)

  // 拖拽
  document.addEventListener('dragover', function (event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  })

  document.addEventListener('dragenter', function () {
    document.body.style.opacity = 0.5
  })

  document.addEventListener('dragleave', function () {
    document.body.style.opacity = 1
  })

  document.addEventListener('drop', function (event) {
    event.preventDefault()

    var reader = new FileReader()

    reader.addEventListener('load', function (event) {
      material.map.image.src = event.target.result
      material.map.needsUpdate = true
    })
    reader.readAsDataURL(event.dataTransfer.files[0])

    document.body.style.opacity = 1
  })
}

function onPointerStart(event) {
  isUserInteracting = true

  var clientX = event.clientX || event.touches[0].clientX
  var clientY = event.clientY || event.touches[0].clientY

  onMouseDownMouseX = clientX
  onMouseDownMouseY = clientY

  onMouseDownLon = lon
  onMouseDownLat = lat
}

function onPointerMove(event) {
  if (isUserInteracting === true) {
    var clientX = event.clientX || event.touches[0].clientX
    var clientY = event.clientY || event.touches[0].clientY

    lon = (onMouseDownMouseX - clientX) * 0.1 + onMouseDownLon
    lat = (clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat
  }
}

function onPointerUp() {
  isUserInteracting = false
}

function onDocumentMouseWheel(event) {
  var fov = camera.fov + event.deltaY * 0.05

  camera.fov = THREE.MathUtils.clamp(fov, 10, 75)

  camera.updateProjectionMatrix()
}

function animate() {
  requestAnimationFrame(animate)

  // 自旋
  // if (isUserInteracting === false) {
  //   lon += 0.1
  // }

  lat = Math.max(-85, Math.min(85, lat))
  phi = THREE.MathUtils.degToRad(90 - lat)
  theta = THREE.MathUtils.degToRad(lon)

  camera.target.x = 500 * Math.sin(phi) * Math.cos(theta)
  camera.target.y = 500 * Math.cos(phi)
  camera.target.z = 500 * Math.sin(phi) * Math.sin(theta)

  camera.lookAt(camera.target)

  renderer.render(scene, camera)
}
