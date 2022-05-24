import * as THREE from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';

const ambientLightColor = 0x555555;     // lightens up all objects on the scene
const directionalLightColor = 0xffffff; // casts a directional light on the scene

let camera, scene, renderer, composer, controls;
let object, light;

let glitchPass;

function init() {

  // set up a renderer, add renderer to a document
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.domElement.setAttribute('style','position:fixed;top:0;left:0;z-index:33')
  document.body.appendChild( renderer.domElement );

  // set up a camera
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;
  
  // set up an orbital control
  controls = new OrbitControls(camera, renderer.domElement);

  // set up a scene
  scene = new THREE.Scene();

  // create and add new 3d object
  object = new THREE.Object3D();
  scene.add( object );

  const geometry = new THREE.SphereBufferGeometry( 1, 50, 50 );
  
  // add 100 meshes with the sphere geometry
  for ( let i = 0; i < 10; i ++ ) {
    // create future sphere mash and material
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random(), flatShading: true } );
    const mesh = new THREE.Mesh( geometry, material );
    
    // adjust mesh position, scale, and rotation to add uniquity
    mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
    mesh.position.multiplyScalar( Math.random() * 200 );
    mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
    
    // add mesh to the object (all other meshes)
    object.add( mesh );
  }

  // add a couple of lights to the scene
  scene.add( new THREE.AmbientLight(ambientLightColor) );
  
  light = new THREE.DirectionalLight(directionalLightColor);
  light.position.set( 1, 1, 1 );
  scene.add( light );

  // postprocessing
  composer = new EffectComposer( renderer );
  composer.addPass(new RenderPass( scene, camera ));
  
  glitchPass = new GlitchPass();
  let qqq=0;
  setInterval(_=>{
    if(qqq===0){
        glitchPass.goWild = true;
        qqq=1
    }else{
        qqq=0
        glitchPass.goWild = false;
    }
  },2000)
  composer.addPass(glitchPass);

  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );

  // add custom rotation effect
  object.rotation.x += 0.0005;
  object.rotation.y += 0.001;
  
  // render the scene
  composer.render();
}

init();
animate();
