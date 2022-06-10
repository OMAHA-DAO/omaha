import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';

import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import { FontLoader } from '../src/FontLoader';

let anime
if(window.anime){anime=window.anime}else{throw new Error('You need animejs in html')}

const models=Object.create({
    hdr:'/model/webgl2/hdr/sepulchral_chapel_rotunda_1k6-softly_gray.hdr',
    font:'/fonts/no-ru-symb.ttf',
    girl:'/model/2022-05-31/2022-05-31-ok-2-CL-1.glb',
    bull:'/model/2022-05-08/bull_statue_2.glb',
    voiting:'/media/voiting_04.webp',
    courses:'/media/courses_top.png',
    coursesBtm:'/media/courses_btm.png',
    des:'/media/noise.webp',
});

/* for (const [key, value] of Object.entries(models)) {
    fetch(value)
} */

(()=>{
    const hdrEquirect = new RGBELoader().load(
        models.hdr,
        () => {hdrEquirect.mapping = THREE.EquirectangularReflectionMapping}
    );
    const d=document
    const slider=d.querySelector('.slider');
    const DEBUG=true;//////////!!!!!!!!!!!!!!!!!!!!
    const easing='linear'
    let mixer;
    let mesh; // Girl
    //setTimeout(() => {
        // https://sbcode.net/threejs/animate-on-scroll/
        const scene = new THREE.Scene()
        /* const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf)
        scene.add(gridHelper) */
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, .1, 100)
        let isMobile=false;
        let percentToScreens=330;
        if(window.innerWidth<1025){//MOBILE
            camera.position.set(0, 0, 3.2);
            isMobile=true
            percentToScreens=400
        }
        if(window.innerWidth>1024){
            camera.position.set(0, 0, 3);
            isMobile=false
        }

        const screenConst=parseInt(window.getComputedStyle(slider).height)/percentToScreens;//100/7 ( 7 = screens.length)
        const canvas = document.querySelector('canvas.webgl')
        const renderer = new THREE.WebGLRenderer({
            canvas, alpha: true, antialias: true,
        });
        //
        renderer.localClippingEnabled = true;
        // \
        //renderer.setClearColor( 0xffffff, 1);

        //JFT
/*         const mmm=new THREE.Mesh(
            new THREE.BoxBufferGeometry(.1,.1,.1),
            new THREE.MeshBasicMaterial({color:0xff0000}),
        )
        scene.add(mmm);
        mmm.position.set(.1,.3,2.8) */
        // \ JFT
        let TIME=0//GLITCH FROM https://codepen.io/sfi0zy/pen/MZdeKB
        const COMPOSER = new EffectComposer(renderer);
        COMPOSER.setSize(window.innerWidth, window.innerHeight);
        let Bull=null

        const renderPass = new RenderPass(scene, camera);
        COMPOSER.addPass(renderPass);
        const shader = {
            uniforms: {
                uRender: { value: COMPOSER.renderTarget2 },
                uTime: { value: TIME },
            },
            vertexShader:`
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
            }`,
            fragmentShader: `
            uniform sampler2D uRender;
            uniform float uTime;
            varying vec2 vUv;
            float rand(vec2 seed);
            void main() {
                float randomValue = rand(vec2(floor(vUv.y * .1), uTime));
                vec4 color;
                if (randomValue < .02) {
                    //color = texture2D(uRender, vec2(vUv.x, 1.1*sin(vUv.y*1.5)*sin(uTime)));
                    vec2 uVuV = vec2( vUv.x + .005 * sin(vUv.y*1200. + uTime),vUv.y );
                    color = texture2D(uRender, uVuV);

                    color.r=texture2D(uRender, uVuV + vec2(.008,.0)).r;
                    color.g=texture2D(uRender, uVuV + vec2(-.009,.0)).g;
                    //color.b=texture2D(uRender, uVuV + vec2(.01,.0)).b;

                } else {
                    color = texture2D(uRender, vUv);
                }
                gl_FragColor = color;
            }
            float rand(vec2 seed) {
                return fract(sin(dot(seed, vec2(2.,5.))) * 999.);
            }`,
        };

        const shaderPass = new ShaderPass(shader);
        shaderPass.renderToScreen = true;
        COMPOSER.addPass(shaderPass);

        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(canvas)

        //const controls = new OrbitControls(camera, canvas)

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        const lightHolder = new THREE.Group();
        // top left
        const aLight2=new THREE.DirectionalLight(0xffffff,.7);
        aLight2.position.set(-1.5,1.7,0);
        lightHolder.add(aLight2);
        //frontSide (golden)
        const aLight4=new THREE.DirectionalLight(0xffffff,1);//0xe7ba92/DE9C63
        aLight4.position.set(-1,.5,2);
        lightHolder.add(aLight4);
        //oncedLight
        const oncedLight=new THREE.DirectionalLight(0x77edff,0);//0xfbc759/0x00e6e6
        oncedLight.position.set(1.5,1,1);
        lightHolder.add(oncedLight);
        //oncedLight2
        const oncedLight2=new THREE.DirectionalLight(0xffffff,0);//0xfbc759/0x00e6e6
        oncedLight2.position.set(2,0,1);
        lightHolder.add(oncedLight2);

        scene.add(lightHolder)

        // imgs
        const loaderImg = new THREE.TextureLoader()
        let objcts=Object.create({});

        function setImage(src,size=null,sizes,pos,name=null,opacity=1){// NOW: Only phone scr added
            loaderImg.load(
                src,
                texture=>{
                    //texture.minFilter = THREE.LinearFilter;
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide,
                        alphaTest:.5,
                        opacity:opacity,
                    });
                    const meshTexture = new THREE.Mesh(
                        new THREE.PlaneBufferGeometry(sizes[0],sizes[1]),
                        material
                    );
                    meshTexture.position.set(pos[0],pos[1],pos[2])
                    if(mesh)mesh.add(meshTexture)
                    objcts[name]=meshTexture
                },
                undefined,
                e=>console.error(e)
            );
            let int1=setInterval(()=>{
                if(objcts[name]){
                    clearInterval(int1)
                    int1=null
                    return objcts[name]
                }
            },200)
        }
        // \ imgs
        // girl and bull loaders
        let pl=null;
        const animationScripts = [{ start:0, end:0, func:0 }]
        const loader = new GLTFLoader();
        // ANIMATE
        function lerp(x, y, a) {return (1 - a) * x + a * y}
        // Used to fit the lerps to start and end at specific scrolling percentages
        function scalePercent(start, end) {
            oldScrollPercent=parseFloat(oldScrollPercent.toFixed(2))
            scrollPercent=parseFloat(scrollPercent.toFixed(2))
            if(parseFloat((oldScrollPercent)-(scrollPercent))>0){
                oldScrollPercent-=.04
            }
            if((oldScrollPercent)<(scrollPercent)){
                oldScrollPercent+=.04
            }
            if(scrollPercent>screenConst*5-.1){// we scrolled to end
                oldScrollPercent-=.04
            }
            return (oldScrollPercent - start) / (end - start)
        };
        let scrollPercent =0, oldScrollPercent = 0
        pl=()=>{
            if(oldScrollPercent<scrollPercent){}
            animationScripts.forEach(a=>{
                if (oldScrollPercent >= a.start && oldScrollPercent < a.end) {
                    a.func()
                }
            })
        }
        const canvas1=document.querySelector('.webgl');
        //const canvas2=document.querySelector('.webgl2');
        document.body.onscroll = () => {//calculate the current scroll progress as a percentage
            scrollPercent =
                ((document.documentElement.scrollTop || document.body.scrollTop) /
                    ((document.documentElement.scrollHeight ||
                        document.body.scrollHeight) -
                        document.documentElement.clientHeight)) * 100;
            (document.getElementById('scrollProgress')).innerText =
                'Scroll Progress : ' + scrollPercent.toFixed(2)
            if(scrollPercent>95){
                if(canvas1){
                    canvas1.classList.add('canvas1Cl')
                    //canvas2.classList.remove('canvas1Cl')
                }
            }else{
                if(canvas1){
                    canvas1.classList.remove('canvas1Cl')
                    //canvas2.classList.add('canvas1Cl')
                }
            }
            //docScrl(scrollPercent)
        }
        // \ ANIMATE
        // Pseudo Lights
        let planeGroupe;
        if(!isMobile){
            planeGroupe=new THREE.Group()
            const materialTest=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.026})
            function addPlane(sizes,positionSet){
                const plane=new THREE.PlaneBufferGeometry(sizes[0],sizes[1])
                const planeMesh=new THREE.Mesh(plane,materialTest)
                planeMesh.position.set(positionSet[0],positionSet[1],positionSet[2])
                planeGroupe.add(planeMesh)
                return planeMesh
            }
            let xxx=1;
            for(let i=0;i<40;i++){
                xxx=xxx-parseFloat(THREE.Math.randFloat(.01,.03).toFixed(4))
                anime({
                    targets:
                    addPlane(//sizes,rorationSet,positionSet
                        [THREE.Math.randFloat(.05,.06),1],
                        [xxx-.8,-.1,0]
                    ).position,
                    x:[xxx-.8,xxx-.82,xxx-.8,xxx-.78,xxx-.8],
                    duration:2e4,
                    delay:THREE.Math.randFloat(1000,2500).toFixed(4),
                    loop:true,
                    easing,
                })
            }
            scene.add(planeGroupe)
            planeGroupe.position.set(.4,.2,2.3)
            planeGroupe.rotation.z=-.52
            planeGroupe.scale.set(.4,2,.2);
            const aLight5=new THREE.DirectionalLight(0xffffff,1);
            aLight5.position.set(2.8,.2,3);
            planeGroupe.add(aLight5);
        }
        // \ Pseudo Lights

        //3D background
        /* const D3Back=new THREE.Group()
        const materialTest=new THREE.MeshBasicMaterial({
            color:0xffffff,
            side:THREE.DoubleSide,
            transparent:true,
            opacity:THREE.Math.randFloat(.01,.1),
        })
        const plane=new THREE.PlaneBufferGeometry(.27,.33)
        const planeMesh=new THREE.Mesh(plane,materialTest)
        function addPlaneBack(rorationSet,positionSet){
            const cloned=planeMesh.clone()
            cloned.material.opacity=THREE.Math.randFloat(.01,.1);
            cloned.rotation.set(rorationSet[0],rorationSet[1],rorationSet[2])
            cloned.position.set(positionSet[0],positionSet[1],positionSet[2])
            D3Back.add(cloned)
            anime({
                targets:cloned.position,
                y:[positionSet[1],THREE.Math.randFloat(positionSet[1],positionSet[1]+.2),positionSet[1]],
                duration:10000,
                delay:THREE.Math.randFloat(100,1000),
                loop:true,
                easing,
            })
        }
        for(let i=0;i<100;i++){
            addPlaneBack(//rorationSet,positionSet
                [0,THREE.Math.randFloat(-1.9,1.9),0],
                [6*Math.cos(i-.9), THREE.Math.randFloat(-1.9,1.9) ,6*Math.sin(i-.9)]//https://stackoverflow.com/questions/23541879/move-object-along-splinecircle-in-three-js
            )
        } */
        // \ 3D background


        //const mainColor=0x5A5651;
        const mainColor=0x1c1710;//211b13
        //const emissiveColor=0x333333;
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path
        //const gltf = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        /* function docScrl(perc){
            const percent=parseInt(perc);
            const screenConstInt=parseInt(screenConst);
            console.log(percent,screenConstInt);
            if(!mesh)return;
            const duration=2500
            switch (percent) {
                case 1://first screen
                    anime({targets:mesh.position,x:.04,y:-.78,z:2,duration,easing})
                    anime({targets:mesh.rotation,x:0,y:0,z:0,duration,easing})
                    break;
                case screenConstInt://second screen
                    anime({targets:mesh.position,x:.8,y:-.3,z:.1,duration,easing})
                    anime({targets:mesh.rotation,x:0,y:-.8,z:0,duration,easing})
                    break;
                case screenConstInt*2://third screen ...
                anime({targets:mesh.position,x:-.45,y:-.75,z:1.9,duration,easing})
                    anime({targets:mesh.rotation,x:0,y:1.1,z:0,duration,easing})
                    break;
                case screenConstInt*3://third screen ...
                    anime({targets:mesh.position,x:.8,y:-.3,z:.1,duration,easing})
                    break;
                default:
                    break;
            }
        } */

        loader.load(
            models.girl,// resource URL
            gltf=>{// called when the resource is loaded
            const preloaderImg1=document.querySelector('.preload-img-1')
            const preloaderImg2=document.querySelector('.preload-img-2')
            const ANImain1=document.querySelector('.ANI-main-1')
            let dur=2000;
            if(DEBUG)dur=100
            anime({
                targets:preloaderImg1,opacity:[1,0],easing,duration:dur,});
            anime({
                targets:preloaderImg2,
                opacity:[0,1],
                duration:800,
                easing,
                delay:1200,
                complete:()=>{
                    preloaderImg2.classList.add('preloaderImg2Cl')
                    anime.timeline()
                    .add({
                        targets:preloaderImg2,
                        opacity:0,
                        duration:1000,
                        delay:800,
                        easing,
                        complete:()=>{
                            document.body.classList.remove('ovh');
                            preloaderImg1.remove()
                            preloaderImg2.remove()
                            preloader.remove()
                            //preloader.setAttribute('style','z-index:-1;opacity:1')
                                window.scrollTo({ top: 0 });
                        }
                    })
                    .add({targets:ANImain1, opacity:[0,1], translateY:['-10%',0], easing, duration:2000,})
                    .add({
                        complete:()=>{
                            anime.timeline()
                            .add({targets:document.querySelector('.ANI-main-2'),  opacity:1,  translateY:['4rem',0],  easing,  duration:700})
                            .add({
                                targets:document.querySelector('.ANI-main-3'),
                                translateY:['-100%',0],  easing,  duration:700,
                            })
                        }
                    })
                }
            });
            const sceneGlb=gltf.scene
            mixer = new THREE.AnimationMixer(sceneGlb)
            mixer.clipAction((gltf).animations[0]).play()
            scene.add(sceneGlb)
            sceneGlb.position.set(.1,-.52,.23)
            sceneGlb.scale.set(.05,.05,.05)

            const obj3d=new THREE.Object3D();
            
            sceneGlb.traverse(mesh => {
                if (mesh.isMesh) {
                    mesh.position.set(mesh.position.x,mesh.position.y,mesh.position.z)// POSITION
                    mesh.material.color=new THREE.Color(mainColor)
                    mesh.material.roughness=.4
                    mesh.material.metalness=.5
                    mesh.material.envMapIntensity=.8
                    mesh.material.envMap = hdrEquirect
                }
            });
            obj3d.add(sceneGlb)
            scene.add(obj3d)
            mesh=obj3d
            if(courses)mesh.add(courses)
            //if(D3Back)mesh.add(D3Back)

            const preloader=document.querySelector('.preloader');
            const tmp={}
            const duration=1000;
            tmp.animeoncedLight2Start=anime({targets:oncedLight2,intensity:[0,2,1,.5,0,1,1.5,2.5,0,.1,.5,2,,1.7,.7,0],duration:8000,easing,loop:true,delay:1000});
            tmp.animeoncedLight2Start.pause()

            //https://stackoverflow.com/questions/56071764/how-to-use-dracoloader-with-gltfloader-in-reactjs   DRACO FIX LOADER
            let deburTrue=3600
            if(DEBUG)deburTrue=100
            anime.timeline()
                .add({targets:mesh.position,x:[0,.04],y:[0,-.78],z:[-3,2],delay:deburTrue,duration:duration*2,easing,complete:()=>{
                    let temp=0,
                        temp2=0
                    const tmp2scr=screenConst// 2 screen

                    animationScripts.push({
                        start: 0,
                        end: tmp2scr,
                        func: () => {
                            mesh.position.set(
                                lerp(.04, .4, scalePercent(0, tmp2scr)),
                                lerp(-.78,-.72, scalePercent(0, tmp2scr)),
                                lerp(2, 1.3, scalePercent(0, tmp2scr))
                            )
                            mesh.rotation.set(0,lerp(0, .7, scalePercent(0, tmp2scr)),0)
                            oncedLight.intensity=lerp(0, .7, scalePercent(0, tmp2scr))
                            if(!tmp.oncedL){
                                tmp.oncedL=1
                                anime({targets:oncedLight.position,y:[1.7,-1,1],duration:10000,loop:true,easing,})
                            };
                            if(planeGroupe){
                                planeGroupe.position.z=(lerp(2.3, 1.7, scalePercent(0, tmp2scr)));
                            }
                            tmp.animeoncedLight2Start.pause()
                            oncedLight2.intensity=(lerp(0, 0, scalePercent(0, tmp2scr)));
                        },
                    })
                    const tmp3scr=screenConst*2// 3 screen
                    animationScripts.push({
                        start: tmp2scr,
                        end: tmp3scr,
                        func: () => {
                            mesh.position.set(
                                lerp(.4, -.7, scalePercent(tmp2scr, tmp3scr)),//x
                                lerp(-.72, -.6, scalePercent(tmp2scr, tmp3scr)),//y
                                lerp(1.3, .85, scalePercent(tmp2scr, tmp3scr)),//z
                            )
                            mesh.rotation.set(0,lerp(.7, 1.85, scalePercent(tmp2scr, tmp3scr)),0)
                            if(planeGroupe){
                                planeGroupe.position.set(
                                    lerp(.4, -.2, scalePercent(tmp2scr, tmp3scr)),
                                    lerp(.2, -.3, scalePercent(tmp2scr, tmp3scr)),
                                    lerp(1.7, 2.3, scalePercent(tmp2scr, tmp3scr))
                                );
                                planeGroupe.rotation.z=lerp(-.5, -.05, scalePercent(tmp2scr, tmp3scr))
                                planeGroupe.scale.x=lerp(.4, .18, scalePercent(tmp2scr, tmp3scr))
                            }
                            tmp.animeoncedLight2Start.play();
                            oncedLight.intensity=lerp(1.2, 0, scalePercent(tmp2scr, tmp3scr))
                            if(!objcts.obj1ImgPhone){
                                setImage(
                                    models.voiting, // src
                                    [.7,.7,.7], // size! of object scale
                                    [.819,1.641], // sizes of plane
                                    [0,-4,0], // position
                                    'obj1ImgPhone',
                                )
                            }
                        },
                    })
                    let BullLoaded=false// 4 screen
                    const tmp4scr=screenConst*3
                    animationScripts.push({
                        start: tmp3scr,
                        end: tmp4scr,
                        func: () => {
                            tmp.animeoncedLight2Start.pause();
                            mesh.position.set(
                                lerp(-.7, .4, scalePercent(tmp3scr, tmp4scr)),
                                lerp(-.6, -.85, scalePercent(tmp3scr, tmp4scr)),
                                lerp(.85, 2, scalePercent(tmp3scr, tmp4scr))
                            )
                            mesh.rotation.set(0,  lerp(1.85, 3.5, scalePercent(tmp3scr, tmp4scr)),  0)
                            if(!BullLoaded){
                                BullLoaded=true
                                loader.load(
                                    models.bull,
                                    bull=>{
                                        Bull=bull.scene.children[0].children[0]
                                        Bull.material.envMap = hdrEquirect
                                        Bull.position.set(.4,0,6)
                                        Bull.rotation.set(-1.7,0,3.3)
                                        Bull.material.color=new THREE.Color(mainColor)
                                        Bull.material.roughness=.4
                                        Bull.material.metalness=.5
                                        mesh.add(Bull)
                                    }
                                )
                            }
                            if(objcts.obj1ImgPhone){// Phone screen | -1,0,-2
                                objcts.obj1ImgPhone.position.set(-.5,-4,-1)
                                objcts.obj1ImgPhone.rotation.set(0,-1.6,0)
                                objcts.obj1ImgPhone.scale.set(.8,.8,1)
                            }
                            if(planeGroupe){
                                planeGroupe.position.set(
                                    lerp(-.2, 0, scalePercent(tmp3scr,tmp4scr)),
                                    lerp(-.3,.2, scalePercent(tmp3scr,tmp4scr)),
                                    lerp(2.3, 2.4, scalePercent(tmp3scr,tmp4scr))
                                )
                                planeGroupe.rotation.z=lerp(-.05, .5, scalePercent(tmp3scr,tmp4scr))
                                planeGroupe.scale.x=lerp(.2, .3, scalePercent(tmp3scr,tmp4scr))
                            }
                            oncedLight.intensity=lerp(0, 1.2, scalePercent(tmp3scr,tmp4scr))
                            oncedLight2.intensity=(lerp(0, 0, scalePercent(tmp3scr,tmp4scr)));
                            
                        },
                    })
                    const tmp5scr=screenConst*4// 5 screen
                    animationScripts.push({
                        start: tmp4scr,
                        end: tmp5scr,
                        func: () => {
                            mesh.position.set(  lerp(.4, -.7, scalePercent(tmp4scr, tmp5scr)),  lerp(-.85, -.4, scalePercent(tmp4scr, tmp5scr)),  lerp(2, .1, scalePercent(tmp4scr, tmp5scr))  )
                            mesh.rotation.set(  0,  lerp(3.5, 5.7, scalePercent(tmp4scr, tmp5scr)),  0  )
                            if(objcts.obj1ImgPhone){// Phone Object3d
                                anime({targets:objcts.obj1ImgPhone.position,x:-.5,y:.35,z:-1.5,duration:500,easing:'linear'})
                                anime({targets:objcts.obj1ImgPhone.rotation,y:.2,duration:500,easing:'linear'})
                            }
                            if(planeGroupe){
                                planeGroupe.position.set(
                                    lerp(0, -.2, scalePercent(tmp4scr,tmp5scr)),
                                    .2,
                                    lerp(2.4, 2, scalePercent(tmp4scr,tmp5scr))
                                );
                                planeGroupe.rotation.z=lerp(.5, -.1, scalePercent(tmp4scr,tmp5scr))
                                planeGroupe.scale.x=lerp(.3, .2, scalePercent(tmp4scr,tmp5scr))
                            }
                            oncedLight.intensity=lerp(1.2, 0, scalePercent(tmp4scr, tmp5scr))
                        }
                    })
                    const tmp6scr=screenConst*5// 6 screen Join the
                    animationScripts.push({
                        start: tmp5scr,
                        end: tmp6scr,
                        func: () => {
                            mesh.position.set(  lerp(-.7, 0, scalePercent(tmp5scr, tmp6scr)),  lerp(-.4, -.3, scalePercent(tmp5scr, tmp6scr)),  lerp(.1, -1, scalePercent(tmp5scr, tmp6scr))  )
                            mesh.rotation.set( 0,  lerp(5.7, 6.1, scalePercent(tmp5scr, tmp6scr)),  0 )
                            if(objcts.obj1ImgPhone){// Phone Object3d
                                anime({targets:objcts.obj1ImgPhone.position,x:.5,y:-4,z:0,duration,easing})
                                anime({targets:objcts.obj1ImgPhone.rotation,y:-1.6,duration,easing})
                            }
                            if(planeGroupe){
                                planeGroupe.position.set(
                                    -.2,//lerp(-.2, 0, scalePercent(tmp5scr,tmp6scr)),
                                    .2,
                                    lerp(2, 2.08, scalePercent(tmp5scr,tmp6scr))
                                );
                                planeGroupe.rotation.z=lerp(-.1, 0, scalePercent(tmp5scr,tmp6scr))
                                planeGroupe.scale.x=lerp(.2, .1, scalePercent(tmp5scr,tmp6scr))
                            }

                        }
                    })
                    /* const tmp7scr=screenConst*6// 7 screen
                    animationScripts.push({
                        start: tmp6scr,
                        end: tmp7scr,
                        func: () => {
                            mesh.position.set(
                                lerp(-.8, .3, scalePercent(tmp5scr, tmp6scr)),
                                lerp(-.3, -.8, scalePercent(tmp5scr, tmp6scr)),
                                lerp(.1, 2, scalePercent(tmp5scr, tmp6scr))
                            )
                            mesh.rotation.set( 0,  lerp(.7, 4.6, scalePercent(tmp5scr, tmp6scr)),  0 )
                        }
                    }) */
                }})
            }
        )
        // \ girl and bull loaders

 
        // courses | https://threejs.org/examples/#webgl_clipping_intersection
        const clipPlanes = [
            new THREE.Plane( new THREE.Vector3( .8, 0, 0 ), 5.5 ),
            new THREE.Plane( new THREE.Vector3( -.8, 0, 0 ), 5.5 ),
            new THREE.Plane( new THREE.Vector3( 0, 0, .8 ), 5.5 ),
            new THREE.Plane( new THREE.Vector3( .8, 0, .8 ), 5.5 ),
            new THREE.Plane( new THREE.Vector3( -.8, 0, .8 ), 5.5 ),
            new THREE.Plane( new THREE.Vector3( 0, 0, -.8 ), 5.5 ),
            new THREE.Plane( new THREE.Vector3( .8, 0, -.8 ), 5.5 ),
            new THREE.Plane( new THREE.Vector3( -.8, 0, -.8 ), 5.5 ),
        ];
        const helpers = new THREE.Group();
        helpers.add( new THREE.PlaneHelper( clipPlanes[0], 5, 0xff0000 ) );
        helpers.add( new THREE.PlaneHelper( clipPlanes[1], 5, 0x0000ff ) );
        helpers.add( new THREE.PlaneHelper( clipPlanes[2], 5, 0x00ff00 ) );
        helpers.add( new THREE.PlaneHelper( clipPlanes[3], 5, 0xffff00 ) );
        helpers.add( new THREE.PlaneHelper( clipPlanes[4], 5, 0x00ffff ) );
        helpers.add( new THREE.PlaneHelper( clipPlanes[5], 5, 0x00ff00 ) );
        helpers.add( new THREE.PlaneHelper( clipPlanes[6], 5, 0xffff00 ) );
        helpers.add( new THREE.PlaneHelper( clipPlanes[7], 5, 0x00ffff ) );
        //console.log(helpers);
        helpers.visible = false;
        scene.add( helpers );
        //const tobj3d=new THREE.Mesh(
        //    new THREE.PlaneBufferGeometry(20,.2),
        //    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .1 ,clippingPlanes: clipPlanes, clipIntersection: true })
        //)
        const courses=new THREE.Group();
        const tobj3d=new THREE.Group();
        //tobj3d.position.set(0,0,-2)
        function textSet(fnt,text,name,color=0xffffff){
            const textGeo = new THREE.TextGeometry(new String(text),{
                font:fnt,
                size:.07,
                height: .001,
                curveSegments: 1
            });
            const textMesh=new THREE.Mesh(
                textGeo,
                new THREE.MeshBasicMaterial({
                    color,
                    side:THREE.FrontSide, clippingPlanes: clipPlanes, clipIntersection: false
                })
            );
            if(!objcts.obj1Img){// First BTC ...
                textMesh.position.set(tobj3d.position.x,tobj3d.position.y,tobj3d.position.z)
                objcts[name]=tobj3d;
                tobj3d.add(textMesh)
                //scene.add(tobj3d)
                // 2 text (cloned)
                const cloned=textMesh.clone()
                cloned.position.set(tobj3d.position.x+10.2,tobj3d.position.y,tobj3d.position.z)
                textMesh.add(cloned)
                anime({targets:textMesh.position,x:[-4.81,-15],duration:2e4,loop:true,easing,delay:0,});
            }else{// Second +1.05 ...
                objcts.obj1Img.add(textMesh);
                textMesh.position.set(tobj3d.position.x,tobj3d.position.y-.13,tobj3d.position.z)
                objcts[name]=tobj3d;
                tobj3d.add(textMesh)
                //scene.add(tobj3d)
                // 2 text (cloned)
                const cloned=textMesh.clone()
                cloned.position.set(tobj3d.position.x+10.2,tobj3d.position.y,tobj3d.position.z)
                textMesh.add(cloned)
                anime({targets:textMesh.position,x:[-4.81,-15],duration:18e3,loop:true,easing,delay:0,});
            }
        }
        courses.add(tobj3d)
        courses.position.set(0,1.6,-3)
        const ttfLoader = new TTFLoader()
        const fontLoader = new FontLoader()
        ttfLoader.load(
            models.font,
            fnt=>{
                fnt=fontLoader.parse(fnt);
                textSet(
                    fnt,
                    'BTC        ETH        TSLA        XMR        EDO        ETP        BTG        ETC        NEO        BSV        DGW        DLT        USDT        TRX        EOS        XRP        LTC       DASH       MANA        XTZ        OMG        DGB',
                    'obj1Img',
                    0x00CEE5,
                )
                textSet(
                    fnt,
                    '+1.05        -0.05        -.002        +0.095        +2.091        -0.094        +1.098        -4.98        +5.01547        -0.03        -0.015        +7.058        -0.64        -0.871        +5.42        +10.573        -0.180        +11.01',
                    'obj1Img2',
                    0xDAB457
                )
            }
        );
        // \ courses
// Add a video
//        function setMap( texture='',pos,rot=[0,0,0],size=[4.35,3.25],ret=false ) {
//            let material;
//            if(size[0]===200){
//                material = new THREE.MeshStandardMaterial({
//                    side: THREE.DoubleSide,
//                    roughness:.8,
//                    metalness:.2,
//                    color:0x000000
//                });
//            }else{
//                material = new THREE.MeshBasicMaterial({
//                    map: texture,
//                    side: THREE.DoubleSide,
//                    alphaTest:.5,
//                });
//            }
//            
//            const meshTexture = new THREE.Mesh(
//                new THREE.PlaneGeometry(size[0],size[1]),
//                material
//            );
//            scene.add(meshTexture)
//            meshTexture.position.set(pos[0],pos[1],pos[2])
//            meshTexture.rotation.set(rot[0],rot[1],rot[2])
//            if (ret)return meshTexture
//        }
//        const video_scr_1_group=new THREE.Group();
//        function addVideo(container,pos,sizes){
//            const videoScr=document.querySelector(container);
//            if(videoScr){
//                const vs=setMap(new THREE.VideoTexture( videoScr ),pos,[0,0,0],sizes,true)
//                video_scr_1_group.add(vs)
//                videoScr.play()
//            }
//        }
//        addVideo('.video-scr-2-1',[0,.3,-2],[.4*3,.225*3])
//        addVideo('.video-scr-2-2',[.5,-.5,-2.2],[.4*5.5,.225*5.5])
//        addVideo('.video-scr-2-3',[1.5,.4,-1.8],[1,1])
//        scene.add(video_scr_1_group)
// \ Add a video
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
            if (mixer) mixer.update(clock.getDelta());
        }
        const clock = new THREE.Clock()
        //let yyy=0
        function render() {
            TIME += .001;
            //yyy+= .5
            if(TIME>10)TIME=0
            //renderer.render(scene, camera)
            if(TIME%4>.5){
                TIME=0
                COMPOSER.passes.forEach((pass) => {
                    if (pass) {
                        if(pass.uniforms)pass.uniforms.uTime.value = 0;
                    }
                });
            }
            if(TIME%2>.05&&TIME%4<.7){//2 4
                TIME=THREE.Math.randFloat(.1,.5)
                COMPOSER.passes.forEach((pass) => {
                    if (pass) {
                        if(pass.uniforms)pass.uniforms.uTime.value = TIME;
                    }
                });
            }
            //COMPOSER.passes.forEach(pass => {if (pass) {
            //if(pass.uniforms)pass.uniforms.uTime.value = yyy//TIME;
            //}});
            COMPOSER.render(scene, camera);
        }
        animate();
    //}, 200);//5200
})();

//(()=>{//load 2 webgl
//    if(window.innerWidth>1024){
//        setTimeout(()=>{
//            const d=document;
//            const sc=d.createElement('script');
//            sc.src=models.webgl2;
//            d.body.appendChild(sc)
//        },100)
//    }
//})()
