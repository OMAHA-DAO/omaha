/* import {Clock,WebGLRenderer,Scene,PerspectiveCamera,PointLight,Color,Mesh,MeshBasicMaterial,MeshStandardMaterial} from 'three' */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//import * as dat from 'dat.gui'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';

//import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils'
//import {RectAreaLightHelper} from 'three/examples/jsm/helpers/RectAreaLightHelper'

import anime from 'animejs';
let startThree=setInterval(_=>{
    if(window.toStartThree===undefined||window.toStartThree===0){
        throw "CUSTOM ERROR: Waiting for preload ended";
    }
    clearInterval(startThree);
    startThree=null;
},500);
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()


const lightHolder = new THREE.Group();
const aLight=new THREE.DirectionalLight(0xffffff,2);
aLight.position.set(-1.5,1.7,.7);
lightHolder.add(aLight);

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

    controls.update()
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(15, sizes.width / sizes.height, .001, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 10
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor("#333", 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true


/////////
const loader = new GLTFLoader();

//for video
const video_scr_1_group=new THREE.Group();
let videoWithOpacity,sixScrVideo,sevenScr,anime7scr

// Load a glTF resource
loader.load(
	// resource URL
	'model/girl.glb',
	// called when the resource is loaded
	function ( gltf ) {
        gltf.scene.position.y = -1
        gltf.scene.position.x = .2
		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object
        gltf.scene.children[0].material.colorWrite=true
        gltf.scene.children[0].material.color={r:1,g:1,b:1}
        //gltf.scene.children[0].material.emissive={r:.1,g:0,b:0}
        gltf.scene.children[0].material.roughness=0
        gltf.scene.children[0].material.metalness=0
        scene.add(gltf.scene)
        gltf.scene.children[0].material.transparent=true

        anime.timeline()
.add({targets:gltf.scene.position,y:-1,z:[-15,0],duration:1000,delay:3000,easing:'linear'})
.add({targets:gltf.scene.position,y:[-1,-1.9],z:[0,8.5],duration:1000,easing:'linear'})
.add({targets:gltf.scene.rotation,
    /* keyframes: [
        {y:[0.4]},
        {y:[-0.2]},
        {y:[0.2]},
        {y:[-0.1]},
      ]
    , */duration:1000,easing:'linear'})

        anime.timeline()
.add({targets:gltf.scene.children[0].material,opacity:[0,1],duration:2500,easing:'linear'})

        const spotLight = new THREE.SpotLight( 0xffffff,.8 );
            spotLight.position.set(0,1,2);
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            scene.add(spotLight);

        anime.timeline()
.add({targets:spotLight.position,z:[2,10],duration:2000,/* delay:2000, */easing:'linear'})

        //Mouse wheel
        window.addEventListener('wheel',e=>{
            if(window.toThreeUp===0){//Scroll down
                window.toThree+=2
            }

            const twoScrCandle=document.querySelector('.two-scr-candle')//candle two scr
            const duration=600
            switch (window.toThree) {//2-ой,3-ий экраны|window.toThree=0 in FScr
                case 1:
                    anime({targets:gltf.scene.position,x:.2,y:-1.9,z:8.5,duration:1000,easing:'linear'})
                    anime({targets:gltf.scene.rotation,x:0,y:0,duration:1000,easing:'linear'})
                        anime({targets:video_scr_1_group.position,x:-8,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.rotation,y:.4,duration,easing:'linear'})
                        if(twoScrCandle)twoScrCandle.classList.remove('two-scr-candleCl')
                    break;
                case 2:
                    anime({targets:gltf.scene.position,x:.7,y:-1.55,z:4.5,duration,easing:'linear'})
                    anime({targets:gltf.scene.rotation,x:0,y:0,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.position,x:-1.5,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.rotation,y:.2,duration,easing:'linear'})
                            if(twoScrCandle)twoScrCandle.classList.add('two-scr-candleCl')
                            if(twoScrCandle)twoScrCandle.classList.remove('two-scr-candleClOut')
                    break;
                case 3:
                    anime({targets:gltf.scene.position,x:-.7,y:-1.45,z:4.5,duration,easing:'linear'})
                    anime({targets:gltf.scene.rotation,x:0,y:1.55,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.position,x:2,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.rotation,y:-1,duration,easing:'linear'})
                            if(twoScrCandle)twoScrCandle.classList.add('two-scr-candleClOut')
                    break;
                case 4:
                    anime({targets:gltf.scene.position,x:.1,y:-1.6,z:6,duration,easing:'linear'})
                    anime({targets:gltf.scene.rotation,x:.5,y:3.55,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.position,x:7,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.rotation,y:-1.2,duration,easing:'linear'})
                        anime({targets:videoWithOpacity.position,z:25,duration,easing:'linear'})
                        anime({targets:videoWithOpacity.material,opacity:0,duration,easing:'linear'})
                    break;
                case 5:
                    anime({targets:gltf.scene.position,x:-.7,y:-1.4,z:3.5,duration,easing:'linear'})
                    anime({targets:gltf.scene.rotation,x:0,y:1.15,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.position,x:24,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.rotation,y:-1.2,duration,easing:'linear'})
                        anime({targets:videoWithOpacity.position,z:0,duration,easing:'linear'})
                        anime({targets:videoWithOpacity.material,opacity:1,duration,easing:'linear'})
                        anime({targets:sixScrVideo.position,x:-5,duration,easing:'linear'})
                    break;
                case 6:
                    anime({targets:gltf.scene.position,x:.4,y:-1.75,z:7,duration,easing:'linear'})
                    anime({targets:gltf.scene.rotation,x:0,y:-1.55,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.position,x:28,duration,easing:'linear'})
                        anime({targets:video_scr_1_group.rotation,y:-1.6,duration,easing:'linear'})
                        anime({targets:sixScrVideo.position,x:-.5,duration,easing:'linear'})
                        sixScrVideo.material.opacity=1
                            anime({targets:sevenScr.position,y:-5,duration,easing:'linear'})
                            if(anime7scr)anime7scr.pause()
                    break;
                case 7:
                    anime({targets:gltf.scene.position,x:-.2,y:-1.6,z:5.7,duration,easing:'linear'})
                    anime({targets:gltf.scene.rotation,x:0,y:0,duration,easing:'linear'})
                        anime({targets:sixScrVideo.position,x:5,duration,easing:'linear'})
                        anime({targets:sevenScr.position,y:-.1,x:1.2,duration,easing:'linear'})
                        //anime({targets:sevenScr.rotation,y:[-.3,-.4,-.3],x:[-.3,-.4,-.3],z:[-.2,-.3,-.2],duration:3000,easing:'linear(1,1)',loop:true})//-.4,-.3,-.2
                        anime7scr=anime({targets:sevenScr.rotation,
                            x:[-.4,-.3,-.4,-.5,-.4],y:[-.3,-.2,-.3,-.4,-.3],z:[-.2,-.1,-.2],
                            duration:10000,easing:'linear',loop:true})//-.4,-.3,-.2
                    break;
                case 8:
                    anime({targets:gltf.scene.position,x:0,y:0,z:-4,duration,easing:'linear'})
                    anime({targets:gltf.scene.rotation,x:1.7,y:3.2,z:0,duration,easing:'linear'})
                        anime({targets:sevenScr.position,y:2,x:3,duration,easing:'linear'})
                        if(anime7scr)anime7scr.pause()
                    break;
            }
        })

	},
	// called while loading is progressing
	xhr=>{console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );},
	// called when loading has errors
	error=>{/* console.log( 'An error happened' ); */}
);

const matForPlane=new THREE.MeshStandardMaterial({
    transparent:true,
    color:0xffffff,
    side:THREE.FrontSide,
    roughness:.1,
    /* depthTest:true,
    depthWrite:true, */
    alphaTest:.5,
    //metalness:.5,
    //emissive:0x666666,
    //wireframe:true,
});
const loaderImg = new THREE.TextureLoader();

function setMap( texture='',pos,rot=[0,0,0],size=[4.35,3.25],ret=false ) {
    /* let material;
    if(size[0]===200){
        material = new THREE.MeshStandardMaterial({side: THREE.DoubleSide,roughness:.8,metalness:.2,color:0x000000});
    }else{ */
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            alphaTest:.5,
        });
    //}
    
    const meshTexture = new THREE.Mesh(
        new THREE.PlaneGeometry(size[0],size[1]),
        material
    );
    scene.add(meshTexture)
    meshTexture.position.set(pos[0],pos[1],pos[2])
    meshTexture.rotation.set(rot[0],rot[1],rot[2])
    if (ret)return meshTexture
}
//VIDEO
function addVideo(container,pos,rot=[0,0,0],sizes,needOpacity=false,addToGroup=true){
    const videoScr=document.querySelector(container);
    if(videoScr){
        const vs=setMap(new THREE.VideoTexture( videoScr ),pos,rot,sizes,true)
        if(needOpacity)vs.material.opacity=0
        if(addToGroup)video_scr_1_group.add(vs)
        videoScr.play()
        if(needOpacity)return vs
    }
}
//video SCR 2
    //1
    addVideo('.video-scr-2-1',[0,.3,-2],[0,0,0],[.4*3,.225*3])
    //2
    addVideo('.video-scr-2-2',[.5,-.5,-2.2],[0,0,0],[.4*5.5,.225*5.5])
    //3
    addVideo('.video-scr-2-3',[1.5,.4,-1.8],[0,0,0],[1,1])
    video_scr_1_group.position.x=-8
// \ video SCR 2
// video SCR 3
    addVideo('.video-scr-2-1',[-5,-.1,-1.8],[0,.5,0],[.4*12,.225*12])
// \ video SCR 3
// video SCR 4
    addVideo('.video-scr-2-2',[-27,-.5,0],[0,1.5,0],[.4*20,.225*20])
// \ video SCR 4
// video SCR 5
    videoWithOpacity=addVideo('.video-scr-2-1',[-60,-1.2,0],[0,.9,0],[.4*52,.225*52],true)
// \ video SCR 5
    scene.add(video_scr_1_group)
// video SCR 6
    sixScrVideo=addVideo('.video-scr-2-2',[0,-.2,0],[0,0,0],[.4*6.5,.225*6.5],true,false)
// \ video SCR 6
// image SCR 7
loaderImg.load(
    'media/7-scr-phone.png',
    texture=>{sevenScr=setMap(texture,[1.5,-5,0],[-.4,-.3,-.2],[1,2],true)},//texture,pos,rot,size,ret
    undefined,
    (e)=>{console.error(e)}
);
// \ image SCR 7

const clock = new THREE.Clock()

  // postprocessing
  const composer = new EffectComposer( renderer );
  composer.addPass(new RenderPass( scene, camera ));
  const glitchPass = new GlitchPass(1);
  //glitchPass.goWild = false;
  composer.addPass(glitchPass);

const tick = () =>
{

    //camera.position.y=y_

    // Update objects
    //sphere.rotation.y = .5 * elapsedTime

    // Update Orbital Controls
    // controls.update()
    /* const elapsedTime = clock.getElapsedTime()
    if(elapsedTime>4.97&&elapsedTime<4.99){
        console.log('++++++++');
        glitchPass.goWild = true;
    }else{
        console.log('------');

        glitchPass.goWild = false;
    } */

    lightHolder.quaternion.copy(camera.quaternion);

    // Render
    //renderer.render(scene, camera)
    composer.render();
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()