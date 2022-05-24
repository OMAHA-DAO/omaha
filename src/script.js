import * as THREE from 'three'

//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import {HorizontalBlurShader} from 'three/examples/jsm/shaders/HorizontalBlurShader';
import {VerticalBlurShader} from 'three/examples/jsm/shaders/VerticalBlurShader';

import * as anime from 'animejs/lib/anime'

//const sizes = {width: 600,  height: 750}
const sizes = {width: window.innerWidth,  height: window.innerHeight}
const models=Object.create({
    elements:[
        'model/webgl2/_Edik/infographic_arrow_04_my.glb',
        'model/webgl2/01_elements_chip_4_new.glb',
        'model/webgl2/01_elements_diamond_2.glb',
        'model/webgl2/01_elements_elephant_2.glb',
        'model/webgl2/01_elements_horse_5_merged.glb',
        'model/webgl2/01_elements_L_4_my_new.glb',
        'model/webgl2/01_elements_rook_2.glb',
        'model/webgl2/01_elements_safe_4_only.glb',
        'model/webgl2/01_elements_safehandle_4_only.glb',
        'model/webgl2/01_elements_smartphone_3_Edited.glb',
        'model/webgl2/01_elements_omaha_logo_3.glb',
    ]
});
const settings=Object.create({
    font:'/model/webgl2/fonts/ArchivoBlack-Regular.ttf',
    normal:'/media/webgl2/normal.jpg',
    hdr:'model/webgl2/hdr/sepulchral_chapel_rotunda_1k.hdr',
});
const canvas = document.querySelector('canvas.webgl2')
const scene = new THREE.Scene()
const lightHolder = new THREE.Group();
const sceneGroup = new THREE.Group();

const pointLight = new THREE.DirectionalLight(0xffffff, 1)
pointLight.position.set(0,1,1)
const pointLight2=pointLight.clone();
pointLight2.position.set(0,-1,-1)
const pointLight3=pointLight.clone();
pointLight3.position.set(0,0,-1)
const pointLight4=pointLight.clone();
pointLight4.position.set(0,1,-1)

lightHolder.add(pointLight,pointLight2,pointLight3,pointLight4);
scene.add(lightHolder)

const camera = new THREE.PerspectiveCamera(20, sizes.width / sizes.height, .1, 50)
camera.position.set(0,0,5)
scene.add(camera)
THREE.Cache.enabled = true;
//new OrbitControls(camera, canvas)
const options = {
    bloomThreshold: .85,
    bloomStrength: .36,
    bloomRadius: .5,
    animeDuration:1000,//1s
  };
const renderer = new THREE.WebGLRenderer({
    canvas, /* alpha: true, */ antialias: true,
});
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const COMPOSER = new EffectComposer(renderer);
COMPOSER.setSize(window.innerWidth, window.innerHeight);
const renderPass = new RenderPass(scene, camera);
COMPOSER.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    options.bloomStrength,
    options.bloomRadius,
    options.bloomThreshold
);
COMPOSER.addPass(bloomPass);
renderer.setClearColor(0x000000, 1);

const tl=new THREE.TextureLoader
//JFT
/* const bgTexture = tl.load("map.jpg");
const bgGeometry = new THREE.PlaneGeometry(6, 3);
const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
bgMesh.position.set(0, 0, -1);
scene.add(bgMesh); */
// \ JFT

const texture = tl.load(settings.normal);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

const hdrEquirect = new RGBELoader().load(
    settings.hdr,
    () => {hdrEquirect.mapping = THREE.EquirectangularReflectionMapping}
);
let fontLoadedObj=null,chipObj=null
const ttfLoader = new TTFLoader()
const fontLoader = new FontLoader()
function createText(fnt,chip,text,pos=[0,0,0],rot=[0,0,0],size=.045,logoTxt,amendment=0){
    const obj3d=new THREE.Object3D();
    const cloneChip=chip.clone()
    cloneChip.rotation.x=1.57
    if(!logoTxt){
        const textGeo = new TextGeometry(new String(text),{
            font:fontLoader.parse(fnt),
            size,
            height: .0014,
            curveSegments: 12
        });
        const textMesh=new THREE.Mesh(
            textGeo,
            new THREE.MeshPhysicalMaterial({
                color:0x000000,
                roughness:.1,
                metalness:1,
                envMap: hdrEquirect,
            })
        );
        textMesh.position.set(-.075+amendment,-.02,.009);
        obj3d.add(cloneChip,textMesh);
    }else{
        logoTxt.material=new THREE.MeshPhysicalMaterial({
            color:0x000000,
            roughness:.1,
            metalness:1,
            envMap: hdrEquirect,
        });
        const logoTxtClone=logoTxt.clone()
        logoTxtClone.position.set(-.01,.023,.01);//MY:-.01,.023 | -.014,0,.01
        logoTxtClone.scale.set(logoTxtClone.scale.x*.74,logoTxtClone.scale.y*.74,logoTxtClone.scale.z*.74);//MY
        logoTxtClone.rotation.set(3.14/2,0,0);//MY:3.14/2 | -1.59
        obj3d.add(cloneChip,logoTxtClone);
    }
    obj3d.position.set(pos[0],pos[1],pos[2]);
    obj3d.rotation.set(rot[0],rot[1],rot[2]);
    obj3d.scale.set(.7,.7,.7);
    anime({
        targets:obj3d.rotation,
        y:[rot[1],rot[1]-.1,rot[1],rot[1],rot[1]-.1,rot[1],rot[1],rot[1]-.1,rot[1],rot[1],rot[1]-.1,rot[1]],
        duration:options.animeDuration*THREE.Math.randFloat(100,200),easing:'easeInOutSine',delay:THREE.Math.randFloat(10,300),loop:true
    });
    sceneGroup.add(obj3d);
}
//plastic rounded objects
function animeCylinder(cyl){
    anime({
        targets:cyl.rotation,
        y:[0,.5,0,0,.5,0,0,.5,0,0,.5,0,0,.5,0,0,.5,0,0,.5,0,0,.5,0],
        duration:options.animeDuration*THREE.Math.randFloat(100,200),easing:'easeInOutSine',delay:THREE.Math.randFloat(100,3000),loop:true
    });
}
function createCylinder(sizes=[.2,.2],color=0x333333,sheenColor=0x0a85d9,pos=[0,0,0],rot=[0,0,0],height=[.003,.01]){
    const geometry = new THREE.CylinderGeometry(
        sizes[0],
        sizes[1],
        THREE.Math.randFloat(height[0], height[1]),
        128
    );
    const material = new THREE.MeshPhysicalMaterial( {
        roughness: .5,
        clearcoatRoughness:.26,
        transmission: .9,
        thickness: .1,
        metalness: .001,
        color,
        envMap: hdrEquirect,
        normalMap: texture,
        clearcoatNormalMap: texture,
        normalScale:new THREE.Vector2( .1, .1 ),
        sheen:1,
        sheenColor,
        sheenRoughness:.5,
    } );
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.rotation.set(rot[0],rot[1],rot[2]);
    cylinder.position.set(pos[0],pos[1],pos[2]);
    sceneGroup.add( cylinder );
    return cylinder
}

function setNew(obj,scale,pos,rot){
    obj.position.set(pos[0],pos[1],pos[2]);
    obj.rotation.set(rot[0],rot[1],rot[2]);
    obj.scale.set(scale,scale,scale);
    sceneGroup.add(obj)
}


const blue=createCylinder([.07,.07],0x333333,0x0a85d9,[0,.27,-.1],[.9,.1,-.7],[.001,.002])//big (4) / btm
animeCylinder(blue)
const blue2=blue.clone()
const blue3=blue.clone()
const blue4=blue.clone()
setNew(blue2,3.7,[0,.4,-.1],[-.5,0,.3])//smaller / btm middle//big / middle bigger
animeCylinder(blue2)
setNew(blue3,.9,[0,.3,-.4],[.6,0,-.6])//smaller / btm middle//big / is behind the object bigger
animeCylinder(blue3)
setNew(blue4,1.9,[-.15,.6,-.3],[2.6,0,.6])//smaller / btm middle//big / is behind the object bigger top
animeCylinder(blue4)

const orange=createCylinder([.05,.05],0xFF5600,0x66304D,[-.2,.25,0],[1.5,0,0],[.007,.01])//smaller (5) / btm left
anime({
    targets:orange.rotation,
    z:[0,.5,0],
    duration:options.animeDuration*THREE.Math.randFloat(10,20),easing:'easeInOutSine',delay:THREE.Math.randFloat(100,3000),loop:true
})
const orange2=orange.clone()
const orange3=orange.clone()
const orange4=orange.clone()
const orange5=orange.clone()
setNew(orange2,.9,[-.1,.25,.1],[.2,0,-.3])//smaller / btm middle
animeCylinder(orange2)
setNew(orange3,1,[.15,.2,-.05],[1.2,0,.1])//smaller / btm right
animeCylinder(orange3)
setNew(orange4,1,[-.15,.5,.02],[1.3,0,.2])//smaller / btm right
animeCylinder(orange4)
setNew(orange5,.55,[-.17,.6,-.1],[.3,0,-.25])//smaller / top back
animeCylinder(orange5)


const loader = new GLTFLoader();
//let pos=-1
const safeObj=Object.create({})
// Load logo
models.elements.forEach(e=>{
    loader.load(
        e,
        model=>{
            let this_model=model.scene.children[0]
            this_model.scale.set(this_model.scale.x*.3,this_model.scale.y*.3,this_model.scale.z*.3);
            if(this_model.name==='arrow_my'){
                const material_arrow = new THREE.MeshPhysicalMaterial({
                    roughness: .4,
                    transmission: .8,
                    thickness: 0.5,
                    color:0xffffff,
                    envMap: hdrEquirect,
                    normalMap: texture,
                    clearcoatNormalMap: texture,
                    normalScale:new THREE.Vector2( .1, .1 ),
                    sheen:1,
                    sheenColor:0x6c0de5,
                    sheenRoughness:.4,
                    ior:.1,
                });
                this_model.material=material_arrow
                this_model.position.set(.24,.7,4)
                this_model.rotation.set(0,1.8,1.8)//-1.3,1.8
                this_model.scale.set(this_model.scale.x*.9,this_model.scale.y*.9,this_model.scale.z*.9);
                anime({
                    targets:this_model.position,
                    z:[4,-.2],
                    duration:options.animeDuration*2,easing:'easeInOutSine'
                });
                anime({
                    targets:this_model.rotation,
                    z:[1.8,1.7,1.8,1.7,1.8,1.7,1.8],
                    duration:options.animeDuration*25,easing:'easeInOutSine',delay:2000,loop:true
                });
                sceneGroup.add(this_model)
            }
            if(this_model.name==='Safe_gold'){//add safe
                const safe=this_model
                const material_safe = new THREE.MeshPhysicalMaterial({
                    roughness: .1,
                    metalness: 1,
                    color:0xe7901c,
                    envMap: hdrEquirect,
                });
                safe.material=material_safe
                safeObj.safe=safe
                safe.position.set(-.2,.2,0)
            }
            if(this_model.name==='Safe_handle'){//add safeHandle
                const safe_handle=this_model
                const material_safeHandle = new THREE.MeshPhysicalMaterial({
                    roughness: 0,
                    metalness: 1,
                    color:0xffffff,
                    envMap: hdrEquirect,
                });
                safe_handle.material=material_safeHandle
                safe_handle.position.set(-.25,.2,.0156)
                safe_handle.rotation.y=3.15
                const safe3d=new THREE.Object3D();
                if(safeObj.safe){
                    safe3d.add(safe_handle,safeObj.safe)
                    safe3d.position.set(.2,-10,0)
                    safe3d.rotation.set(-.1,0,-.1)
                    sceneGroup.add(safe3d);
                    anime({
                        targets:safe3d.position,
                        y:[-10,-.32],
                        duration:options.animeDuration*2,easing:'easeInOutSine',delay:options.animeDuration*2,
                    });
                    anime({
                        targets:safe3d.rotation,
                        y:[0,-.1,0,-.1,-.1,0,-.1,-.1,0,-.1,0],
                        duration:options.animeDuration*25,easing:'easeInOutSine',delay:options.animeDuration*2.5,loop:true
                    });
                    sceneGroup.add(safe3d);
                }
            }
            if(this_model.name==='chip'){//chip fishki.net
                const chip=this_model
                chipObj=chip
                const material_chips = new THREE.MeshPhysicalMaterial({
                    roughness: .1,
                    metalness: 1,
                    color:0xe7901c,
                    envMap: hdrEquirect,
                });
                chip.material=material_chips
                ttfLoader.load(
                    settings.font,
                    fnt=>{
                        fontLoadedObj=fnt
                        createText(fnt,chip,'BTC',[-.4,-.2,.2],[-.1,-.4,0],undefined,undefined,.005)
                        createText(fnt,chip,'AMZ',[-.2,-.19,.21],[0,-.8,.5])
                        createText(fnt,chip,'APPL',[-.22,-.43,.19],[-.3,-.6,-.1],.037)
                        createText(fnt,chip,'ETH',[-.31,-.36,.23],[-.3,0,.2],undefined,undefined,.005)
                        createText(fnt,chip,'TSLA',[-.42,-.43,.19],[-.4,-.3,-.2],.037)
                    }
                );
            }
            if(this_model.name==='diamond1'){
                const diamond=this_model
                const material_diamond = new THREE.MeshPhysicalMaterial({
                    roughness: 0,
                    transmission: 1,
                    thickness: 3.4,
                    metalness: .1,
                    color:0xffffff,
                    sheen:1,
                    sheenColor:0x1f7c6e,
                    sheenRoughness:.2,
                    ior:1.9,
                    envMap: hdrEquirect,
                });
                diamond.material=material_diamond
                diamond.scale.set(.05,.05,.05)
                diamond.position.set(0,-.3,-.05)
                diamond.rotation.set(1.7,.2,0);
                anime({
                    targets:diamond.rotation,
                    z:[0,3.14*2],
                    duration:options.animeDuration*50,easing:'easeInOutSine',loop:true
                });
                const dia2=diamond.clone()
                dia2.scale.set(.037,.037,.037)
                dia2.position.set(.1,-.3,-.05)
                dia2.rotation.set(1.7,-.2,0);
                anime({
                    targets:dia2.rotation,
                    z:[0,-3.14*2],
                    duration:options.animeDuration*70,easing:'easeInOutSine',loop:true
                });
                sceneGroup.add(diamond,dia2);
            }
            const material_chess = new THREE.MeshPhysicalMaterial({
                roughness: 0,
                transmission: 1,
                thickness: .7,
                metalness: .5,
                color:0xf0f0f0,
                envMap: hdrEquirect,
                sheen:1,
                sheenColor:0x0069ff,
                sheenRoughness:.2,
                ior:2.7,
            });
            if(this_model.name==='Bishop_2'){//eleaphant
                this_model.scale.set(this_model.scale.x*.6,this_model.scale.y*.6,this_model.scale.z*.6)
                const eleaphant=this_model
                eleaphant.material=material_chess
                eleaphant.position.set(.05,.3,0)
                eleaphant.rotation.set(.4,0,.3)
                sceneGroup.add(eleaphant);
                anime({
                    targets:eleaphant.rotation,
                    y:[-3.14*.5,-3.14,-3.14*.5,-3.14,-3.14*.5,-3.14,-3.14*.5,-3.14,-3.14*.5,-3.14],
                    duration:options.animeDuration*700,easing:'easeInOutSine',loop:true
                });
            }
            if(this_model.name==='Knight'){//horse
                this_model.scale.set(this_model.scale.x*.6,this_model.scale.y*.6,this_model.scale.z*.6)
                const horse=this_model
                horse.material=material_chess
                horse.position.set(.16,.31,-.05)
                horse.rotation.set(.2,-3.14*1.9,-.1)
                sceneGroup.add(horse);
                anime({
                    targets:horse.rotation,
                    y:[-3.14*2,-3.14*2.1,-3.14*1.9,-3.14*2,-3.14*2.1,-3.14*1.9,-3.14*2.1],
                    duration:options.animeDuration*100,easing:'easeInOutSine',loop:true
                });
            }
            if(this_model.name==='LPRook'){//rook
                this_model.scale.set(this_model.scale.x*.6,this_model.scale.y*.6,this_model.scale.z*.6)
                const rook=this_model
                rook.material=material_chess
                rook.position.set(.27,.29,-.1)
                rook.rotation.set(.2,0,-.2);
                anime({
                    targets:rook.rotation,
                    z:[-.2,.1,-.1,.1,-.1,.1,-.2],
                    duration:options.animeDuration*50,easing:'easeInOutSine',loop:true
                });
                sceneGroup.add(rook);
            }
            if(this_model.name==='L'){//L
                const L=this_model
                L.material=new THREE.MeshPhysicalMaterial({
                    roughness: .1,
                    thickness: .7,
                    //metalness: .1,
                    color:0x923907,
                    envMap: hdrEquirect,
                    sheen:1,
                    sheenColor:0x432404,
                    sheenRoughness:.2,
                })
                L.position.set(-.37,.6,-.2)
                L.rotation.set(.2,-.5,-.5);
                anime({
                    targets:L.position,
                    y:[.6,.65,.6,.65,.6,.65,.6],
                    duration:options.animeDuration*25,easing:'easeInOutSine',delay:options.animeDuration*3,loop:true,
                });
                sceneGroup.add(L);
            }
            if(this_model.name==='smartphone'){
                this_model.scale.set(this_model.scale.x*.5,this_model.scale.y*.5,this_model.scale.z*.5)
                const smartphone=this_model
                const material_smartphone = new THREE.MeshPhysicalMaterial({
                    roughness: .1,
                    thickness: .1,
                    transmission: .7,
                    metalness: .1,
                    color:0x23f9c6,//57abe8
                    envMap: hdrEquirect,
                    sheen:1,
                    sheenColor:0x23d5f9,//0x23d5f9
                    sheenRoughness:.2,
                    normalMap: texture,
                    clearcoatNormalMap: texture,
                    normalScale:new THREE.Vector2( .1, .1 ),
                })
                smartphone.material=material_smartphone
                smartphone.position.set(-.3,.6,-.05)
                smartphone.rotation.set(-.2,-.2,-.4);
                anime({
                    targets:smartphone.rotation,
                    y:[-.2,-.1,-.2,-.2,-.1,-.2,-.2,-.1,-.2],
                    duration:options.animeDuration*25,easing:'easeInOutSine',delay:options.animeDuration*4,loop:true
                });
                const smartphone2=smartphone.clone()
                smartphone2.position.set(0,-.4,-.05)
                smartphone2.rotation.set(-.2,2.8,-.8);
                anime({
                    targets:smartphone2.position,
                    y:[-10,-.4],
                    duration:options.animeDuration*2,easing:'easeInOutSine',delay:options.animeDuration*3,
                });
                anime({
                    targets:smartphone2.rotation,
                    y:[2.8,2.7,2.8,2.8,2.7,2.8,2.8,2.7,2.8,],
                    duration:options.animeDuration*25,easing:'easeInOutSine',delay:2000*4,loop:true
                });
                sceneGroup.add(smartphone,smartphone2);
            }
            if(this_model.name==='omaha_logo'){//logo and chips
                const omaha_logo=this_model
                omaha_logo.material=new THREE.MeshPhysicalMaterial({
                    color:0x000000,
                    roughness:.1,
                    metalness:1,
                    envMap: hdrEquirect,
                });
                let intervalEnded=false;
                let interval=setInterval(()=>{
                    if(!intervalEnded){
                        if(fontLoadedObj&&chipObj){
                            intervalEnded=true;
                            clearInterval(interval);
                            interval=null
                            createText(fontLoadedObj,chipObj,'',[.1,.1,.3],[-3.14/6,3.14/8,0],0,omaha_logo)
                            createText(fontLoadedObj,chipObj,'',[.08,.09,-.2],[1,-3.2,-.5],0,omaha_logo)
                            createText(fontLoadedObj,chipObj,'',[.12,.11,-.3],[.6,-3,.1],0,omaha_logo)
                        }
                        scene.add(sceneGroup)
                        sceneGroup.position.set(-.1,0,-10)
                        sceneGroup.rotation.set(1.1,-2,0)
                        anime({
                            targets:sceneGroup.position,
                            z:[-10,1.7],
                            duration:options.animeDuration*2,easing:'easeInOutSine'
                        })
                    }
                },50);
            }
        }
    );
});
window.customFunc=e=>{
    e=parseInt(e);
    if(!sceneGroup)return false;
    //options.animeDuration=200
    switch (e) {
        case 1:
            console.log('frst');
            anime.timeline().add({
                targets:sceneGroup.position,
                x:-.1,  y:0,  z:1.7,
                duration:options.animeDuration,easing:'easeInOutSine'
            }).add({
                targets:sceneGroup.rotation,
                x:1.1,  y:-2,  z:0,
                duration:options.animeDuration,easing:'easeInOutSine'
            });
            break;
        case 2:
            anime.timeline().add({
                targets:sceneGroup.position,
                x:.1,  y:-.25,  z:2.7,
                duration:options.animeDuration,easing:'easeInOutSine'
            }).add({
                targets:sceneGroup.rotation,
                x:.6,  y:-3.14*1.42,  z:0,
                duration:options.animeDuration,easing:'easeInOutSine'
            });
            break;
        case 3:
            anime.timeline().add({
                targets:sceneGroup.position,
                x:-.15,  y:-.2,  z:3.3,
                duration:options.animeDuration,easing:'easeInOutSine'
            }).add({
                targets:sceneGroup.rotation,
                x:-.3,  y:-.02,  z:0,
                duration:options.animeDuration,easing:'easeInOutSine'
            });
            break;
        case 4:
            anime.timeline().add({
                targets:sceneGroup.position,
                x:.21,  y:.21,  z:2.8,
                duration:options.animeDuration,easing:'easeInOutSine'
            }).add({
                targets:sceneGroup.rotation,
                x:-.4,  y:.35,  z:0,
                duration:options.animeDuration,easing:'easeInOutSine'
            });
            break;
        case 5:
            anime.timeline().add({
                targets:sceneGroup.position,
                x:-.01,  y:.4,  z:3.2,
                duration:options.animeDuration,easing:'easeInOutSine'
            }).add({
                targets:sceneGroup.rotation,
                x:0,  y:-2,  z:0,
                duration:options.animeDuration,easing:'easeInOutSine'
            });
            break;
        case 6:
            anime.timeline().add({
                targets:sceneGroup.position,
                x:.03,  y:.1,  z:4,
                duation:100,easing:'linear'
            }).add({
                targets:sceneGroup.rotation,
                x:0,  y:0,  z:0,
                duration:options.animeDuration,easing:'easeInOutSine'
            });
            break;
    
        default:
            break;
    }
}

//camera blur
//https://gist.github.com/fatlinesofcode/3a02af88ac44a9adea0ca9021536095d
const shader = new THREE.ShaderMaterial({
    uniforms: {
        tDiffuse: {value: null},
        strength: { type: 'f', value: .02 },
        center: { type: 'v2', value: new THREE.Vector2( window.innerWidth/2,window.innerHeight/1.6 ) },
        resolution: { type: 'v2', value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
    },
    vertexShader: document.getElementById('vertexShaderZoom').textContent,
    fragmentShader: document.getElementById('fragmentShaderZoom').textContent
});

const zBlurPass = new ShaderPass(shader);

//COMPOSER.addPass(pass1);
COMPOSER.addPass(zBlurPass);

zBlurPass.renderToScreen = true;
//http://bit.ly/WfFKe7
/* const hblur = new ShaderPass( HorizontalBlurShader );
COMPOSER.addPass( hblur );

const vblur = new ShaderPass( VerticalBlurShader );
// set this shader pass to render to screen so we can see the effects
vblur.renderToScreen = true;
COMPOSER.addPass( vblur ); */
// \ camera blur

// \ code NEW

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

const tick = ()=>{
    // Render
    //renderer.render(scene, camera)
    COMPOSER.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
    lightHolder.quaternion.copy(camera.quaternion);
}

tick();

(()=>{
    const d=document;
    const st=d.createElement('style');
    st.innerText=`html,body{margin: 0;padding: 0;height: 100vh;}
.webgl{position: fixed;top: 0;left: 0;outline: none;}`;
d.body.appendChild(st)


})();
