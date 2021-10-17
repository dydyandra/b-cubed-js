import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Grid
const gridSize = 11; // samain sama division pls
const gridDivisions = 11;
const gridSquare = gridSize / gridDivisions;
const grid = new THREE.GridHelper(gridSize, gridDivisions);
scene.add(grid);

// Grid Space
const gridSpace = new THREE.Object3D();
gridSpace.position.set(-(gridSize/2) + (gridSquare/2), 0,  - (gridSize/2) + (gridSquare/2));
scene.add(gridSpace);

// Game
let finish;
const start = indexToCoordinates(48);
const purpleTileIndex = [17,25,28,36,39,46,47,60,62,67,73,78,79,83,84]
// console.log(start);
let isOver = false;
let isFinish = false;

// Objects
const objects = []
const baseSize = 0.9
const boxSize = baseSize * gridSquare
const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

function indexToCoordinates(index){
    const x = index % gridDivisions * gridSquare;
    const z = Math.floor(index / gridDivisions) * gridSquare;
    return new THREE.Vector2(x, z);
}


//kurang, masi salah kalo griddivision != gridsize
function coordinatesToIndex(coord){
    return Math.floor(coord.y * gridDivisions + coord.x);
}

function buildPlane(index){
    const material = new THREE.MeshPhongMaterial({
        color: 'white'
    });
    const mesh = new THREE.Mesh(boxGeometry, material);
    
    const coord = indexToCoordinates(index);
    
    mesh.position.set(coord.x, 0, coord.y);
    gridSpace.add(mesh);
    objects.push(mesh);
}
const const_planeObjects = 99
let planeObjects = const_planeObjects;

for(let i = 0; i < planeObjects; i++){
    buildPlane(i);
}

// Player
const playerMaterial = new THREE.MeshPhongMaterial({
    color: 'gold'
});
const playerMesh = new THREE.Mesh(boxGeometry, playerMaterial);
playerMesh.name = 'Player'
gridSpace.add(playerMesh);

playerMesh.position.set(start.x, boxSize - (boxSize * 0.0001), start.y)

// Finish
const finishColor = 0xff0000
function setFinish(index){
    /**
     * @type {THREE.Mesh} obj
     */
    const obj = objects[index];
    obj.material.color.setHex(finishColor);
    finish = new THREE.Vector2(obj.position.x, obj.position.z);
}

// Purple tile
const purpleColor = 0xd50eff;
function setPurple(index){
    /**
     * @type {THREE.Mesh} obj
     */
    const obj = objects[index];
    obj.material.color.setHex(purpleColor);
}

// checkState

function checkState(idx){
    if(!isCollide(playerMesh, objects[idx])){
        // Game Over
        console.log('gameOver')
        isOver = true;
    }
    else{
        if(objects[idx].material.color.getHex() === finishColor && planeObjects === 1){
            console.log('Finish');
            isFinish = true;
        }
    }
}

setFinish(93);
purpleTileIndex.forEach(setPurple);

// Collision
function isCollide(box1, box2){
    if(box1 && box2){
        box1.geometry.computeBoundingBox();
        box2.geometry.computeBoundingBox();
        box1.updateMatrixWorld();
        box2.updateMatrixWorld();
        var bounding1 = box1.geometry.boundingBox.clone();
        bounding1.applyMatrix4(box1.matrixWorld);
        var bounding2 = box2.geometry.boundingBox.clone();
        bounding2.applyMatrix4(box2.matrixWorld);

        return bounding1.intersectsBox(bounding2);
    }

    return false;
}

// Game Controls

function onKeyDown(e){
    if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40){
        let prev = coordinatesToIndex(new THREE.Vector2(playerMesh.position.x, playerMesh.position.z));
        switch(e.keyCode){
            // left
            case 37:
                playerMesh.position.setX(playerMesh.position.x - (1 * gridSquare));

                break;
            // up
            case 38:
                playerMesh.position.setZ(playerMesh.position.z - (1 * gridSquare));
                break;
            
            // right
            case 39:
                playerMesh.position.setX(playerMesh.position.x + (1 * gridSquare));
                break;
            
            // down
            case 40:
                playerMesh.position.setZ(playerMesh.position.z + (1 * gridSquare));
                break;
        }

        let idx = coordinatesToIndex(new THREE.Vector2(playerMesh.position.x, playerMesh.position.z));
        disposeObject(objects[prev]);
        checkState(idx);
    }
}

function disposeObject(obj){
    if(!isOver && !isFinish){
        if(obj.material.color.getHex() === 0xffffff || obj.material.color.getHex() === finishColor){
            obj.geometry.dispose();
            obj.material.dispose();
            gridSpace.remove(obj);
            planeObjects--;
            // console.log(planeObjects);
            renderer.renderLists.dispose();
        }
        else if (obj.material.color.getHex() === purpleColor) {
            obj.material.color.setHex(0xffffff);
        }
        console.log(planeObjects);
    }
    else {
        obj.geometry.dispose();
        obj.material.dispose();
        gridSpace.remove(obj);
        planeObjects--;
        // console.log(planeObjects);
        renderer.renderLists.dispose();
    }
}

let timeinterval;
function getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    
    return {
      minutes,
      seconds
    };
  }
  
  function initializeClock(id, endtime) {
    const clock2 = document.getElementById(id);
    const minutesSpan = clock2.querySelector('.minutes');
    const secondsSpan = clock2.querySelector('.seconds');
  
    function updateClock() {
      const t = getTimeRemaining(endtime);
  
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
      if (t.minutes <= 0 && t.seconds <= 0 && !isOver && !isFinish) {
        clearInterval(timeinterval);
        isOver = true;
      }
    }
  
    updateClock();
    timeinterval = setInterval(updateClock, 1000);
  }
  
let deadline = new Date(Date.parse(new Date()) + 180 * 1000);
initializeClock('clockdiv', deadline);

function restart(){
    objects.forEach((o) => disposeObject(o))
    objects.length = 0;
    planeObjects = const_planeObjects;
    
    for(let i = 0; i < planeObjects; i++){
        buildPlane(i);
    }
    playerMesh.position.set(start.x, boxSize - (boxSize * 0.0001), start.y)

    setFinish(coordinatesToIndex(finish));
    purpleTileIndex.forEach(setPurple);
    deadline = new Date(Date.parse(new Date()) + 180 * 1000);
    initializeClock('clockdiv', deadline);
}

// Lights

const skyColor = 0xB1E1FF;
const groundColor = 0xB97A20;
const intensity = 1;
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 7
camera.position.z = 7
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Raycast
 */

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event){
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

const colors = [
    new THREE.Color(0xff0000),
    new THREE.Color(0xffff00),
    new THREE.Color(0x00ff00),
    new THREE.Color(0x0000ff)
]

const duration = 4;

function hover(t){
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    // console.log(intersects[0]);
    if(intersects.length > 0){
        if(intersects[0].object.name === 'Player'){
            console.log('intersect')
            animatePlayerColor(t);
        }
    }
}

function animatePlayerColor(t){
    const f = Math.floor(duration / colors.length);
    const index1 = Math.floor((t / f) % colors.length);

    let index2 = index1 + 1;

    if(index2 === colors.length) index2 = 0;
    
    const color1 = colors[index1];
    const color2 = colors[index2];

    const alpha = (t / f) % colors.length % 1;
    playerMesh.material.color.copy(color1);
    playerMesh.material.color.lerp(color2, alpha);
}

/**
 * Animate
 */

const clock = new THREE.Clock()
console.log(finish);
const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update Orbital Controls
    controls.update()

    hover(elapsedTime);
     
    if(isOver){
        if(!alert('Game Over!')){
            clearInterval(timeinterval);
            restart();
            isOver = false;
        }
    }
    else if(isFinish){
        if(!alert('Congratulations!')){
            clearInterval(timeinterval);
            restart();
            isFinish = false;
        }
    }
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

window.addEventListener('keydown', onKeyDown, false);
tick()