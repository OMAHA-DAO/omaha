import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//import * as dat from 'dat.gui'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
/* import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'; */

import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

import anime from 'animejs';

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const models=Object.create({
    hdr:'model/webgl2/hdr/sepulchral_chapel_rotunda_1k.hdr',
    logo:'model/logo.glb',
    girl:'model/2022-05-08/omaha_girl_04_05_17.glb',
    bull:'model/2022-05-08/bull_statue_2.glb',
    skin:'media/skin-bump-texture_1.png',
    webgl2:'/js/webgl2.js',
});

const elements=[
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
    'model/webgl2/fonts/ArchivoBlack-Regular.ttf',
    'media/webgl2/normal.jpg',
    'model/webgl2/hdr/sepulchral_chapel_rotunda_1k.hdr',
];
elements.forEach(e=>{
    fetch(e)
})

const hdrEquirect = new RGBELoader().load(
    models.hdr,
    () => {hdrEquirect.mapping = THREE.EquirectangularReflectionMapping}
);

for (const [key, value] of Object.entries(models)) {
    fetch(value)
}

//import { RGBA_ASTC_5x4_Format } from 'three';
(()=>{
    //setTimeout(() => {
        // https://sbcode.net/threejs/animate-on-scroll/
        const scene = new THREE.Scene()
        /* const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf)
        scene.add(gridHelper) */
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, .1, 100)
        camera.position.set(0, 0, 3)
        const canvas = document.querySelector('canvas.webgl')
        const renderer = new THREE.WebGLRenderer({
            canvas, alpha: true, antialias: true,
        });
        //renderer.setClearColor( 0xffffff, 1);

        let TIME=0//GLITCH FROM https://codepen.io/sfi0zy/pen/MZdeKB
        const COMPOSER = new EffectComposer(renderer);
        COMPOSER.setSize(window.innerWidth, window.innerHeight);
        let Bull=null

        const renderPass = new RenderPass(scene, camera);
        COMPOSER.addPass(renderPass);
        const shader = {
            uniforms: {
                uRender: { value: COMPOSER.renderTarget2 },
                uTime: { value: TIME }
            },
            vertexShader:`varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
            fragmentShader: `
            uniform sampler2D uRender;
            uniform float uTime;
            varying vec2 vUv;
            float rand(vec2 seed);

            void main() {
                float randomValue = rand(vec2(floor(vUv.y*2000.), uTime/250.));
                //float randomValue2 = rand(vec2(floor(vUv.y*200.), uTime/50000.));
                vec4 color;
                if (randomValue < 0.02) {
                    color = texture2D(uRender, vec2(vUv.x + randomValue - 0.001, vUv.y));
                } else {
                    color = texture2D(uRender, vUv);
                }
                //float lightness = (color.r + color.g + color.b) / 3.0;
                //color.rgb = vec3(color.r * randomValue2, color.g * randomValue2 , color.b * randomValue2);
                gl_FragColor = color;
            }
            float rand(vec2 seed) {
                return fract(sin(dot(seed, vec2(12.9898,78.233))) * 43758.5453123);
            }`,
        };

        const shaderPass = new ShaderPass(shader);
        shaderPass.renderToScreen = true;
        COMPOSER.addPass(shaderPass);

        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(canvas)

        const controls = new OrbitControls(camera, canvas)

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        const lightHolder = new THREE.Group();
        // top right
        const aLight=new THREE.DirectionalLight(0xffffff,.7);//0xfbc759
        aLight.position.set(1.5,1.7,.5);
        lightHolder.add(aLight);
        // top left
        const aLight2=new THREE.DirectionalLight(0xffffff,.7);
        aLight2.position.set(-1.5,1.7,.5);
        lightHolder.add(aLight2);
        // backSide
        const aLight3=new THREE.DirectionalLight(0xffffff,.7);
        aLight3.position.set(-1,2,-1);
        lightHolder.add(aLight3);
        //frontSide (golden)
        const aLight4=new THREE.DirectionalLight(0xDE9C63,.5);//ffa500
        aLight4.position.set(0,.5,2);
        lightHolder.add(aLight4);

        //top right
        const oncedLight=new THREE.DirectionalLight(0x00e6e6,0);//0xfbc759
        oncedLight.position.set(1.5,1,.5);
        lightHolder.add(oncedLight);

        scene.add(lightHolder)

        // imgs
        const loaderImg = new THREE.TextureLoader()
        let objcts=Object.create({});

        function setImage(src,size=null,sizes,pos,name=null,opacity=1){
            loaderImg.load(
                src,
                texture=>{
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide,
                        alphaTest:.5,
                        opacity:opacity,
                        //roughness:.5,
                    });
                    const meshTexture = new THREE.Mesh(
                        new THREE.PlaneBufferGeometry(sizes[0],sizes[1]),
                        material
                    );
                    meshTexture.position.set(pos[0],pos[1],pos[2])
                    //meshTexture.scale.set(size[0],size[1],size[2])
                    const tobj3d=new THREE.Object3D
                    tobj3d.add(meshTexture)
                    scene.add(tobj3d)
                    objcts[name]=tobj3d
                },
                undefined,
                e=>console.error(e)
            );
            let int1=null
            int1=setInterval(()=>{
                if(objcts[name]){
                    clearInterval(int1)
                    int1=null
                    return objcts[name]
                }
            },200)
        }
        setImage(
            'media/curses_green_yellow_line.png', // src
            null,//[.7,.7,.7], // size! of object scale
            [68.54,.12], // sizes of plane
            [0,2,-1], // position
            'obj1Img'
        )
        setImage(
            'media/voiting_03.webp', // src
            [.7,.7,.7], // size! of object scale
            [.819,1.641], // sizes of plane
            [-1,0,-2], // position
            'obj1ImgPhone',
            0,
        )
        // \ imgs

        /* const near = 2;
        const far = 2;
        const color = 0x000000;
        scene.fog = new THREE.Fog(color, near, far);
        scene.background = new THREE.Color(color); */

        // girl and bull loaders
        let pl=null;
        const animationScripts = [{ start:0, end:0, func:0 }]
        const loader = new GLTFLoader();


        // ANIMATE
        function lerp(x, y, a) {return (1 - a) * x + a * y}
        // Used to fit the lerps to start and end at specific scrolling percentages
        function scalePercent(start, end) {
            return (scrollPercent - start) / (end - start)
        }
        pl=function playScrollAnimations() {
            animationScripts.forEach(a=>{
                if (scrollPercent >= a.start && scrollPercent < a.end) {
                    a.func()
                }
            })
        }
        let scrollPercent = 0
        const canvas1=document.querySelector('.webgl');
        const canvas2=document.querySelector('.webgl2');
        document.body.onscroll = () => {
            //calculate the current scroll progress as a percentage
            scrollPercent =
                ((document.documentElement.scrollTop || document.body.scrollTop) /
                    ((document.documentElement.scrollHeight ||
                        document.body.scrollHeight) -
                        document.documentElement.clientHeight)) * 100;
            (document.getElementById('scrollProgress')).innerText =
                'Scroll Progress : ' + scrollPercent.toFixed(2)
            if(scrollPercent>89){
                if(canvas1){
                    canvas1.classList.add('canvas1Cl')
                    canvas2.classList.remove('canvas1Cl')
                }
            }else{
                if(canvas1){
                    canvas1.classList.remove('canvas1Cl')
                    canvas2.classList.add('canvas1Cl')
                }
            }
        }
        // \ ANIMATE

        // light lens (top)
        const light = new THREE.PointLight( 0xffffff, .01, 20 );
        const textureLoader = new THREE.TextureLoader();
        const textureFlare0 = textureLoader.load( "media/glary-horizontal-yellow_5.jpg" );
        const textureFlare3 = textureLoader.load( "media/glare2.jpg" );
        const lensflare = new Lensflare();

        lensflare.addElement( new LensflareElement( textureFlare0, 700, 0 ) );

        lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.14 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 70, 1 ) );
        lensflare.position.set(.9,.5,0);
        scene.add(light,lensflare)

        /* lensflare.material.transparent=true
        lensflare.material.alphaTest=.5
        lensflare.material.color=new THREE.Color(0x000000) */

        anime({targets:lensflare.position,x:[.9,.7,.9,.8,.9,.9,.7,.9,.8,.9,.9,.7,.9,.8,.9,.9,.7,.9,.8,.9,],duration:100000,loop:true,easing:'linear',})

        const plane=new THREE.PlaneBufferGeometry(.5,.1)
        const planeMesh=new THREE.Mesh(plane,new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0}))
        scene.add(planeMesh)
        planeMesh.position.set(.45,.3,1.5)

        anime({targets:planeMesh.position,z:[1.8,1.5,1.8,1.5,1.8,1.5,1.8,1.9,1.8,1.5,1.8,1.5],duration:25000,loop:true,easing:'easeInOutExpo',})
        animationScripts.push({start: 2, end: 105, func: () => planeMesh.position.z=1.4})
        // \ light lens (top)

        // light lens (bottom)
        const lightBtm = new THREE.PointLight( 0xffffff, .01, 20 );
        const textureFlare0Btm = textureLoader.load( "media/glare-two_2.jpg" );
        const textureFlare3Btm = textureLoader.load( "media/glare-two-second_3.jpg" );
        const lensflareBtm = new Lensflare();

        lensflareBtm.addElement( new LensflareElement( textureFlare0Btm, 700, 0 ) );
        lensflareBtm.addElement( new LensflareElement( textureFlare3Btm, 60, 0.16 ) );
        lensflareBtm.position.set(-1.2,-.7,0);
        scene.add(lightBtm,lensflareBtm)

        anime({targets:lensflareBtm.position,x:[-1.2,-1.05,-1.2,-1.05,-1.2,-1.05,-1.2,-1.05,-1.2,-1.05,-1.2,-1.05,],duration:50000,loop:true,easing:'linear',})
        const planeBtm=new THREE.PlaneBufferGeometry(.5,.1)
        const planeMeshBtm=new THREE.Mesh(planeBtm,new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0}))
        scene.add(planeMeshBtm)
        planeMeshBtm.position.set(-.7,-.2,1.5)
        anime({targets:planeMeshBtm.position,y:[-.2,-.3,-.2,-.3,-.2,-.3,-.2,-.3,-.2,-.3,],duration:25000,loop:true,easing:'easeInOutExpo',})
        animationScripts.push({start: 2, end: 105, func: () => planeMeshBtm.position.y=-.37})
        // \ light lens (bottom)

        // texture for logo...//const bumpTexture = new THREE.TextureLoader().load('media/metal-bump-map.jpg')

        // Load logo
        loader.load(
            models.logo,
            logo=>{
                const Logo=logo.scene.children[0]
                    Logo.position.set(-0.058,-.01,2.8)
                    Logo.rotation.set(1.6,0,0)
                    Logo.scale.set(.4,.4,.4)

                    Logo.material.color={r:1,g:1,b:1}
                    Logo.material.transparent=true
                    Logo.material.roughness=.25
                    Logo.material.metalness=.5
                    /* Logo.material.bumpMap = bumpTexture
                    Logo.material.bumpScale = .0001 */
                    anime.timeline()// animate firts time oncly
                    .add({targets:Logo.material,opacity:[0,1],duration:600,delay:5200,easing:'linear',})
                    .add({targets:Logo.position,y:[-.02,-.01],duration:600,easing:'linear',})
                    .add({targets:Logo.rotation,x:[2,1.6],duration:600,easing:'linear'});
                    // \ 
                    (()=>{
                        setTimeout(()=>{
                            const to1=5
                            animationScripts.push({
                                start: 0,
                                end: to1,
                                func: () => {
                                    Logo.position.set(-0.058, lerp(-.01,  .07,  scalePercent(0, to1)),  2.8)
                                    Logo.rotation.set(lerp(1.6, .8, scalePercent(0, to1)),0,0)
                                },
                            });
                            animationScripts.push({
                                start: 5.0001,end: 100,
                                func: () => {
                                    Logo.position.set(-0.058,.07,2.8)
                                    Logo.rotation.set(.8,0,0)
                                },
                            })
                        },5300)
                    })()
                    scene.add(Logo)
            }
        )
        // \\ Load logo

        // Pseudo Lights
        const planeGroupe=new THREE.Group()
        function addPlane(sizes,rorationSet,positionSet){
            const materialTest=new THREE.ShaderMaterial({
                uniforms: {
                color1: { value: new THREE.Color(0xcccccc)},
                color2: { value: new THREE.Color(0x000000)},
                ratio: {value: 1.}
                },
                vertexShader: `
                varying vec3 vNormal;
                varying vec2 vUv;
                varying vec3 vPosition;
                void main () {
                    vPosition = position;
                    vUv = uv;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.);
                }`,
                fragmentShader: `varying vec2 vUv;
                    uniform vec3 color1;
                    uniform vec3 color2;
                    uniform float ratio;

                    float cubicPulse( float c, float w, float x ){
                        x = abs(x - c);
                        if( x>w ) return 0.0;
                        x /= w;
                        return 1.0 - x*x*(3.0-2.0*x);
                    }

                    void main(){
                        vec2 uv = (vUv - 0.5) * vec2(ratio, .0);
                        float alpha = (cubicPulse(0.4,0.3,vUv.x)-cubicPulse(0.,.9,vUv.y))*.2;
                        gl_FragColor = vec4( mix( color1, color2, length(uv)), alpha );
                    }`,
                    transparent:true,opacity: 1,depthWrite:false,
                })
            const plane=new THREE.PlaneBufferGeometry(sizes[0],sizes[1])
            const planeMesh=new THREE.Mesh(plane,materialTest)
            planeMesh.rotation.set(rorationSet[0],rorationSet[1],rorationSet[2])
            planeMesh.position.set(positionSet[0],positionSet[1],positionSet[2])
            planeGroupe.add(planeMesh)
            return planeMesh
        }
        for(let i=0;i<5;i++){
            const rand1=THREE.Math.randFloat(2.,2.26)
            anime({
                targets:
                    addPlane(//sizes,rorationSet,positionSet
                    [THREE.Math.randFloat(.27,.33),1],
                    [-.5,0,THREE.Math.randFloat(-.9,-.92)],
                    [rand1,-.1,3.2]
                ).position,
                x:[rand1,THREE.Math.randFloat(2.,2.26),rand1],
                duration:10000,
                delay:THREE.Math.randFloat(100,1000),
                loop:true,
                easing:'linear',
            })
        }
        scene.add(planeGroupe)
        planeGroupe.position.set(-.4,0,2.15)
        planeGroupe.scale.set(.2,2,.2)

        anime.timeline().add({targets:planeGroupe.position,z:[2,2.15],duration:2000,easing:'linear'})
        .add({
            targets:
            planeGroupe.position,
            x:[-.4,THREE.Math.randFloat(-.39,-.41),-.4],
            duration:5000,
            delay:2000,
            loop:true,
            easing:'linear',
        })
        // \ Pseudo Lights

        const mainColor=0x5A5651;
        //const emissiveColor=0x181818;
        loader.load(
            models.girl,// resource URL
             gltf=>{// called when the resource is loaded
                const mesh=gltf.scene.children[0].children[0].children[0]
                mesh.add(gltf.scene.children[0].children[0].children[1])
                //console.log(gltf,mesh);
                mesh.position.set(-.018,0,-20)
                mesh.rotation.set(0,0,0)
                mesh.material.color=new THREE.Color(mainColor)
                mesh.material.transparent=false
                mesh.material.depthWrite=true
                mesh.material.depthTest=true
                mesh.material.roughness=.2
                mesh.material.metalness=.5
                mesh.material.envMap = hdrEquirect
                ///mesh.material.emissive=new THREE.Color(emissiveColor)
                //mesh.material.emissive=new THREE.Color("#000")
                /* mesh.material.bumpMap = bumpTexture
                mesh.material.bumpScale = .0003 */
                const preloader=document.querySelector('.preloader');
                setTimeout(()=>{preloader.style.opacity=0},3000)
                const tmp={}
                scene.add(mesh)
                const duration=1000
                anime.timeline()
                    .add({targets:mesh.position,y:[0,-.9],z:[-40,2.5],delay:2600,duration:duration*2,easing:'linear',complete:()=>{
                        let temp=0,
                            temp2=0
                        const tmp2scr=16.777// 2 screen
                        animationScripts.push({
                            start: 0,
                            end: tmp2scr,
                            func: () => {
                                preloader.style.opacity=lerp(0,1, scalePercent(0, tmp2scr))
                                mesh.position.set(
                                    lerp(-.018, .2, scalePercent(0, tmp2scr)),
                                    lerp(-.9, -.7, scalePercent(0, tmp2scr)),
                                    lerp(2.5, 1.6, scalePercent(0, tmp2scr))
                                )
                                mesh.rotation.set(0,lerp(0, -.21, scalePercent(0, tmp2scr)),0)
                                if(objcts.obj1Img){// courses Object3d
                                    if(temp<2){
                                        temp++
                                        anime({targets:objcts.obj1Img.children[0].position,x:[7,-7],duration:10000,loop:true,easing:'linear',})
                                    }
                                    objcts.obj1Img.position.set(
                                        0,
                                        lerp(2, -1.3, scalePercent(0,tmp2scr)),
                                        0
                                    )
                                    objcts.obj1Img.rotation.set(0,lerp(0, -.2, scalePercent(0,tmp2scr)),0)
                                }
                                oncedLight.intensity=lerp(0, .7, scalePercent(0, tmp2scr))
                                if(!tmp.oncedL){
                                    tmp.oncedL=1
                                    anime({targets:oncedLight.position,y:[1.7,-1,1],duration:10000,loop:true,easing:'linear',})
                                }
                                planeGroupe.position.z=(lerp(2.15, 2.08, scalePercent(0, tmp2scr)))

                            },
                        })
                        const tmp3scr=16.777*2// 3 screen
                        animationScripts.push({
                            start: tmp2scr,
                            end: tmp3scr,
                            func: () => {
                                mesh.position.set(
                                    lerp(.2, -.5, scalePercent(tmp2scr, tmp3scr)),//x
                                    -.7,                                          //y
                                    1.6                                           //z
                                )
                                mesh.rotation.set(0,lerp(-.21, 1.8, scalePercent(tmp2scr, tmp3scr)),0)
                                if(objcts.obj1Img){// courses Object3d
                                    objcts.obj1Img.position.set(0,-1.3,0)
                                    objcts.obj1Img.rotation.set(0, lerp(-.2, .4, scalePercent(tmp2scr,tmp3scr)), 0)
                                }
                                oncedLight.intensity=lerp(.7, 0, scalePercent(0, tmp3scr))
                                planeGroupe.position.set(
                                    lerp(-.4, -.6, scalePercent(tmp2scr, tmp3scr)),
                                    0,
                                    lerp(2.08, 1.7, scalePercent(tmp2scr, tmp3scr))
                                )
                                planeGroupe.rotation.z=lerp(0, .5, scalePercent(tmp2scr, tmp3scr))
                                if(Bull){
                                    Bull.position.set(9,0,-6)
                                    Bull.rotation.set(-1.3,0,.5)
                                }
                            },
                        })
                        let BullLoaded=false// 4 screen
                        const tmp4scr=16.777*3
                        animationScripts.push({
                            start: tmp3scr,
                            end: tmp4scr,
                            func: () => {
                                mesh.position.set(
                                    lerp(-.5, .27, scalePercent(tmp3scr, tmp4scr)),
                                    lerp(-.7, -.9, scalePercent(tmp3scr, tmp4scr)),
                                    lerp(1.6, 1.9, scalePercent(tmp3scr, tmp4scr))
                                )
                                mesh.rotation.set(0,  lerp(1.8, 3.6, scalePercent(tmp3scr, tmp4scr)),  0)
                                if(!BullLoaded){
                                    BullLoaded=true
                                    loader.load(
                                        models.bull,
                                        bull=>{
                                        /* 
                                            // https://discourse.threejs.org/t/giving-a-glb-a-texture-in-code/15071/5
                                            // из-за того, что слишком мало полигонов, невозможно применить выдавливание!
                                            bull.scene.traverse( function( object ) 
                                            {            
                                            if ((object instanceof THREE.Mesh))
                                            { 
                                                const bumpTexture = new THREE.TextureLoader().load('media/skin-bump-texture_1.png')
                                                object.material.bumpMap = bumpTexture
                                                object.material.bumpScale = .0001
                                            }
                                        });
                                        */
                                    //console.log(bull);
                                            Bull=bull.scene.children[0].children[0]
                                            Bull.material.bumpMap = new THREE.TextureLoader().load(models.skin)
                                            Bull.material.bumpScale = .001
                                            Bull.material.envMap = hdrEquirect
                                            //console.log(bull.map(e=>e instanceof THREE.Mesh?"log":null));
                                            Bull.position.set(0,-1,-6)
                                            Bull.rotation.set(-1.7,0,0)
                                            /* Bull.material.color={r:.9,g:.5,b:.12}
                                            Bull.material.roughness=0
                                            Bull.material.metalness=0 */
                                            Bull.material.color=new THREE.Color(mainColor)
                                            Bull.material.transparent=false
                                            /* Bull.material.depthWrite=true
                                            Bull.material.depthTest=true */
                                            Bull.material.roughness=.3
                                            Bull.material.metalness=.5
                                            //Bull.material.emissive=new THREE.Color(emissiveColor)
                                            scene.add(Bull)
                                        }
                                    )
                                }else{
                                    if(Bull){
                                        Bull.position.set(lerp(9, -2, scalePercent(tmp3scr, tmp4scr)),0,-6)
                                        Bull.rotation.set(-1.3,0,.5)
                                    }
                                }
                                if(objcts.obj1Img){// courses Object3d
                                    objcts.obj1Img.position.set(0,lerp(-1.3, 1, scalePercent(tmp3scr,tmp4scr)),0)
                                    objcts.obj1Img.rotation.set(0,lerp(.4,2.8,scalePercent(tmp3scr,tmp4scr)),0)
                                }
                                if(objcts.obj1ImgPhone){// Phone screen | -1,0,-2
                                    objcts.obj1ImgPhone.position.set(-1,0,-2,)
                                }
                                
                                planeGroupe.position.set(
                                    lerp(-.6, -.45, scalePercent(tmp3scr,tmp4scr)),
                                    0,
                                    lerp(1.7, 2.08, scalePercent(tmp3scr,tmp4scr))
                                )
                                planeGroupe.rotation.z=.5
                            },
                        })
                        const tmp5scr=16.777*4// 5 screen
                        animationScripts.push({
                            start: tmp4scr,
                            end: tmp5scr,
                            func: () => {
                                mesh.position.set(
                                    lerp(.27, -.5, scalePercent(tmp4scr, tmp5scr)),
                                    lerp(-.9, -.7, scalePercent(tmp4scr, tmp5scr)),
                                    lerp(1.9, 1.6, scalePercent(tmp4scr, tmp5scr))
                                )
                                mesh.rotation.set(0,  lerp(3.6, 1.4, scalePercent(tmp4scr, tmp5scr)),  0)
                                if(Bull){//Bull show in viewport
                                    Bull.position.set(lerp(-2, 9, scalePercent(tmp4scr, tmp5scr)),  0,  -6)
                                }
                                if(objcts.obj1Img){// courses Object3d
                                    objcts.obj1Img.position.set(0,  lerp(1, -1.3, scalePercent(tmp4scr,tmp5scr)),  lerp(0, -1.5, scalePercent(tmp4scr,tmp5scr)))
                                    objcts.obj1Img.rotation.set(0,lerp(2.8,-.2,scalePercent(tmp4scr,tmp5scr)),0)
                                }
                                if(objcts.obj1ImgPhone){// Phone Object3d
                                    if(temp2<2){
                                        temp2++
                                        anime({
                                            targets:objcts.obj1ImgPhone.children[0].rotation,y:[.2,0,.2,0,.2,0,.2,0,.2,0,.2,0,.2,0,.2,0,.2],duration:32000,loop:true,easing:'linear'
                                        })
                                    }
                                    objcts.obj1ImgPhone.position.set(// Phone screen | -1,0,-2
                                        lerp(-1, 0, scalePercent(tmp4scr, tmp5scr)),
                                        0,
                                        lerp(-2, 1, scalePercent(tmp4scr, tmp5scr)),

                                    )
                                    objcts.obj1ImgPhone.rotation.set(// Phone screen
                                        0,
                                        lerp(0, -1, scalePercent(tmp4scr, tmp5scr)),
                                        0
                                    )
                                    objcts.obj1ImgPhone.children[0].material.opacity=// Phone screen
                                        lerp(0, 1, scalePercent(tmp4scr, tmp5scr))
                                }
                                planeGroupe.position.set(
                                    lerp(-.45, -.6, scalePercent(tmp4scr,tmp5scr)),
                                    0,
                                    lerp(2.08, 1.7, scalePercent(tmp4scr,tmp5scr))
                                )
                                planeGroupe.rotation.z=lerp(.5, -.2, scalePercent(tmp4scr,tmp5scr))
                            }
                        })
                        const tmp6scr=16.777*5// 6 screen Join the
                        animationScripts.push({
                            start: tmp5scr,
                            end: tmp6scr,
                            func: () => {
                                mesh.position.set(
                                    lerp(-.5, .3, scalePercent(tmp5scr, tmp6scr)),
                                    lerp(-.7, -.85, scalePercent(tmp5scr, tmp6scr)),
                                    lerp(1.6, 1.9, scalePercent(tmp5scr, tmp6scr))
                                )
                                mesh.rotation.set(0,lerp(1.4, 4.6, scalePercent(tmp5scr, tmp6scr)),0)
                                if(objcts.obj1Img){// courses Object3d
                                    objcts.obj1Img.position.set(
                                        0,
                                        lerp(-1.3, -1.7, scalePercent(tmp5scr, tmp6scr)),
                                        lerp(-1.5, -.7, scalePercent(tmp5scr, tmp6scr)),
                                    )
                                    objcts.obj1Img.rotation.set(0,lerp(-.2, -1.4, scalePercent(tmp5scr, tmp6scr)),0)
                                }
                                if(objcts.obj1ImgPhone){// Phone Object3d
                                    objcts.obj1ImgPhone.position.set(// Phone screen | -1,0,-2
                                        lerp(0, 8, scalePercent(tmp5scr, tmp6scr)),
                                        0,
                                        lerp(1, -3, scalePercent(tmp5scr, tmp6scr)),
                                    )
                                }
                                /* planeGroupe.position.set(
                                    lerp(-.6, -.45, scalePercent(tmp5scr, tmp6scr)),
                                    0,
                                    lerp(1.7, 2.08, scalePercent(tmp5scr, tmp6scr))
                                ) */
                                planeGroupe.rotation.z=lerp(-.2, 3.5, scalePercent(tmp5scr, tmp6scr))
                                
                            }
                        })
                        /* const tmp7scr=16.777*6// 7 screen
                        animationScripts.push({
                            start: tmp6scr,
                            end: tmp7scr,
                            func: () => {
                                if(objcts.obj1Img){// courses Object3d
                                    objcts.obj1Img.position.set(0,lerp(1, -2, scalePercent(tmp6scr,tmp7scr)),lerp(-.7, 2, scalePercent(tmp6scr,tmp7scr)))
                                    objcts.obj1Img.rotation.set(0,lerp(-.7,-2.3,scalePercent(tmp6scr-3,tmp7scr+3)),0)
                                }
                            }
                        }) */
                    }})
            }
        )
        // \ girl and bull loaders
        window.addEventListener('resize', () =>{
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        });
        const stats = Stats()
        document.body.appendChild(stats.dom)
        function animate() {
            requestAnimationFrame(animate)
            if(typeof pl==='function')pl()
            render()
            stats.update()
        }
        function render() {
            TIME += .001;
            if(TIME>10)TIME=0
            ////renderer.render(scene, camera)
            //if(TIME%4>.5){
            //    TIME=0
            //    COMPOSER.passes.forEach((pass) => {
            //        if (pass) {
            //            if(pass.uniforms)pass.uniforms.uTime.value = 0;
            //        }
            //    });
            //}
            //if(TIME%2>.05&&TIME%3<.7){//2 4
            //    TIME=THREE.Math.randFloat(0,.4)
                COMPOSER.passes.forEach((pass) => {
                    if (pass) {
                        if(pass.uniforms)pass.uniforms.uTime.value = TIME;
                    }
                });
            //} 
            COMPOSER.render(scene, camera);
        }
        animate()
    //}, 200);//5200
})();

(()=>{//load 2 webgl
    setTimeout(()=>{
        const d=document;
        const sc=d.createElement('script');
        sc.src=models.webgl2;
        d.body.appendChild(sc)
    },100)
})()

import "./includes/milestones_animation";

Promise.all([
	import(
		/* webpackChunkName: "splide" */
		`@splidejs/splide`
		),
]).then(function (modules) {
	console.log("[IMPORT]", modules);

	// Expand modules into variables for more convenient use
	const [
		splideModule,
	] = modules;
	window.Splide = splideModule.default;

	/* Slider Products */
	let postSlider = {
		speed: 400,
		autoWidth: true,
		// perPage: 1,       // Ignored if autoWidth: true, but need for lazy
		pagination: false,
		arrows: false,
		drag: 'free',
		flickPower: 300,
		lazyLoad: 'nearby',
		preloadPages: 2
	};

	new window.Splide( '.posts-list', postSlider).mount();

});

if(window.innerWidth < 768){

	$(window).scroll(function () {

		var scroll = $(window).scrollTop() + $(window).height();
		var offset = $(".cube-section").offset().top;

		if (scroll > offset) {
			$('.ANI-main-3').fadeOut();
		} else {
			$('.ANI-main-3').fadeIn();
		}

	});

}