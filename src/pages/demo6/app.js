// http://www.webgl3d.cn/threejs/examples/#webgl_video_panorama_equirectangular
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_video_panorama_equirectangular.html

// 3D video

import * as THREE from 'three'

var camera, scene, renderer

var isUserInteracting = false
var lon = 0
var lat = 0
var phi = 0
var theta = 0
var distance = 50
var onPointerDownPointerX = 0
var onPointerDownPointerY = 0
var onPointerDownLon = 0
var onPointerDownLat = 0

init()
animate()

function init() {
  var container, mesh, video

  container = document.createElement('div')
  video = document.createElement('video')
  video.src = 'static/video/pano.mp4'
  video.loop = true
  video.style.display = 'none'

  document.body.appendChild(container)
  container.appendChild(video)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / (window.innerHeight / 2), 1, 1100)
  camera.target = new THREE.Vector3(0, 0, 0)

  scene = new THREE.Scene()

  var geometry = new THREE.SphereBufferGeometry(500, 60, 40)

  geometry.scale(-1, 1, 1)

  video.play()

  var texture = new THREE.VideoTexture(video)
  var material = new THREE.MeshBasicMaterial({ map: texture })

  mesh = new THREE.Mesh(geometry, material)

  scene.add(mesh)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)
  container.appendChild(renderer.domElement)

  document.addEventListener('mousedown', onDocumentMouseDown, false)
  document.addEventListener('mousemove', onDocumentMouseMove, false)
  document.addEventListener('mouseup', onDocumentMouseUp, false)
  document.addEventListener('wheel', onDocumentMouseWheel, false)
}

function onDocumentMouseDown(event) {
  event.preventDefault()

  isUserInteracting = true

  onPointerDownPointerX = event.clientX
  onPointerDownPointerY = event.clientY

  onPointerDownLon = lon
  onPointerDownLat = lat
}

function onDocumentMouseMove(event) {
  if (isUserInteracting === true) {
    lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon
    lat = (onPointerDownPointerY - event.clientY) * 0.1 + onPointerDownLat
  }
}

function onDocumentMouseUp() {
  isUserInteracting = false
}

function onDocumentMouseWheel(event) {
  distance += event.deltaY * 0.05

  distance = THREE.MathUtils.clamp(distance, 1, 50)
}

function animate() {
  requestAnimationFrame(animate)
  update()
}

function update() {
  lat = Math.max(-85, Math.min(85, lat))
  phi = THREE.MathUtils.degToRad(90 - lat)
  theta = THREE.MathUtils.degToRad(lon)

  camera.position.x = distance * Math.sin(phi) * Math.cos(theta)
  camera.position.y = distance * Math.cos(phi)
  camera.position.z = distance * Math.sin(phi) * Math.sin(theta)

  camera.lookAt(camera.target)

  renderer.render(scene, camera)
}
