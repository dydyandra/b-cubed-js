import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// Debug
const gui = new dat.GUI()

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

setFinish(82);

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
    obj.geometry.dispose();
    obj.material.dispose();
    gridSpace.remove(obj);
    planeObjects--;
    // console.log(planeObjects);
    renderer.renderLists.dispose();
}

function restart(){
    objects.forEach((o) => disposeObject(o))
    objects.length = 0;
    planeObjects = const_planeObjects;
    
    for(let i = 0; i < planeObjects; i++){
        buildPlane(i);
    }
    playerMesh.position.set(start.x, boxSize - (boxSize * 0.0001), start.y)

    setFinish(coordinatesToIndex(finish));
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
camera.position.y = 0
camera.position.z = 2
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
 * Animate
 */

const clock = new THREE.Clock()
console.log(finish);
const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update Orbital Controls
    controls.update()

    if(isOver){
        if(!alert('Game Over!')){
            isOver = false;
            restart();
        }
    }
    else if(isFinish){
        if(!alert('Congratulations!')){
            isFinish = false;
            restart();
        }
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

window.addEventListener('keydown', onKeyDown, false);
tick()