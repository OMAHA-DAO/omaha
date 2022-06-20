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

import {VolumetricMatrial} from '../src/threex.volumetricspotlightmaterial'
import { PlaneGeometry } from 'three';

import { GUI } from 'dat.gui'

let anime
if(window.anime){anime=window.anime}else{throw new Error('You need animejs in html')}

const models=Object.create({
    hdr:'/model/webgl2/hdr/sepulchral_chapel_rotunda_1k6-softly_gray.hdr',
    font:'/fonts/no-ru-symb.ttf',
    girl:'/model/2022-05-31/2022-05-31-ok-2-CL-1.glb',
    //pseudoLight:'/model/2022-05-31/pseudoLight2.glb',
    bull:'/model/2022-05-08/bull_statue_2.glb',
    voiting:'/media/voiting_04.webp',
});
(()=>{
    const hdrEquirect = new RGBELoader().load(
        models.hdr,
        () => {hdrEquirect.mapping = THREE.EquirectangularReflectionMapping}
    );
    const d=document
    const slider=d.querySelector('.slider');
    const DEBUG=true;
    const easing='linear'
    let mixer;
    let mesh; // Girl
    let matForLight; // for pseudo light for girl
        // https://sbcode.net/threejs/animate-on-scroll/
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, .1, 100)
        let percentToScreens=330;
        if(window.innerWidth<1025){//MOBILE
            camera.position.set(0, 0, 3.2);
            percentToScreens=400
        }
        if(window.innerWidth>1024){camera.position.set(0, 0, 3)}
        const screenConst=parseInt(window.getComputedStyle(slider).height)/percentToScreens;//100/7 ( 7 = screens.length)
        const canvas = document.querySelector('canvas.webgl')
        const renderer = new THREE.WebGLRenderer({
            canvas, /* alpha: true, */ antialias: true,
        });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//const controls = new OrbitControls(camera, canvas)
        renderer.localClippingEnabled = true;
        renderer.setClearColor( 0x000000, 1);
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
            float rand2(vec2 co);
            void main() {
                //float rv = rand2(vec2(.1, 8.1))*5.;
                //float randomValue = rand(vec2(floor(vUv.y * rv), uTime));
                float randomValue = rand(vec2(floor(vUv.y * .1), uTime));
                vec4 color;
                if (randomValue < .02) {
                    //color = texture2D(uRender, vec2(vUv.x, 1.1*sin(vUv.y*1.5)*sin(uTime)));
                    vec2 uVuV = vec2( vUv.x + .003 * sin(vUv.y*1200. + uTime),vUv.y );
                    color = texture2D(uRender, uVuV);

                    color.r=texture2D(uRender, uVuV + vec2(.002,.0)).r;
                    color.g=texture2D(uRender, uVuV + vec2(-.002,.0)).g;
                    //color.b=texture2D(uRender, uVuV + vec2(.01,.0)).b;

                } else {
                    color = texture2D(uRender, vUv);
                }
                gl_FragColor = color;
            }
            float rand(vec2 seed) {
                return fract(sin(dot(seed, vec2(2.,5.))) * 999.);
            }
            float rand2(vec2 co){
                return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
              }`,
        };
        const shaderPass = new ShaderPass(shader);
        shaderPass.renderToScreen = true;
        COMPOSER.addPass(shaderPass);
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(canvas)
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        const lightHolder = new THREE.Group();
        // top left
        //      const aLight2=new THREE.DirectionalLight(0xffffff,.7);
        //      aLight2.position.set(-1.5,1.7,0);
        //      lightHolder.add(aLight2);
        //frontSide (golden)
        //const aLight4=new THREE.DirectionalLight(0xffffff,1);//0xe7ba92/DE9C63
        //aLight4.position.set(-1,.5,2);
        //lightHolder.add(aLight4);
        //oncedLight
        //const oncedLight=new THREE.DirectionalLight(0x77edff,0);//0xfbc759/0x00e6e6
        //oncedLight.position.set(1.5,1,1);
        //lightHolder.add(oncedLight);
        //oncedLight2
        //const oncedLight2=new THREE.DirectionalLight(0xffffff,0);//0xfbc759/0x00e6e6
        //oncedLight2.position.set(2,0,1);
        //lightHolder.add(oncedLight2);
        
        // imgs
        const loaderImg = new THREE.TextureLoader()
        let objcts=Object.create({});
        objcts.loadImg=false;
        objcts.loadLight=false;
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
        document.body.onscroll = () => {//calculate the current scroll progress as a percentage
            scrollPercent =
                ((document.documentElement.scrollTop || document.body.scrollTop) /
                    ((document.documentElement.scrollHeight ||
                        document.body.scrollHeight) -
                        document.documentElement.clientHeight)) * 100;
            (document.getElementById('scrollProgress')).innerText =
                'Scroll Progress : ' + scrollPercent.toFixed(2)
            /* if(scrollPercent>95){
                if(canvas1){canvas1.classList.add('canvas1Cl')}
            }else{
                if(canvas1){canvas1.classList.remove('canvas1Cl')}
            } */
        }
        // \ ANIMATE
        const mainColor=0x1c1710;
        //const planeGroupe = new THREE.Group();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path
        loader.setDRACOLoader(dracoLoader);
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
                    mesh.receiveShadow=true
                    mesh.castShadow=true
                }
            });
            obj3d.add(sceneGlb)
            scene.add(obj3d)
            mesh=obj3d
            mesh.add(lightHolder)
            // Volumetric
            const spotLightMAIN = new THREE.SpotLight(0xffffff,1,30,1.8,1,9);// TO GIRL
            spotLightMAIN.position.set(1,2.1,.2);
            spotLightMAIN.target.position.set(mesh.position.x-.25,mesh.position.y,mesh.position.z);
            spotLightMAIN.shadow.mapSize.width = 2048*5;
            spotLightMAIN.shadow.mapSize.height = 2048*5;
            spotLightMAIN.shadow.camera.near = .1;
            spotLightMAIN.castShadow = true;
            mesh.add(spotLightMAIN)
            mesh.add( spotLightMAIN.target );
/* const gui = new GUI()
const spotLightFolder = gui.addFolder('THREE.SpotLight')
spotLightFolder.add(spotLightMAIN, 'distance', 0, 100, 0.01)
spotLightFolder.add(spotLightMAIN, 'decay', 0, 10, 0.1)
spotLightFolder.add(spotLightMAIN, 'angle', 0, 10, 0.1)
spotLightFolder.add(spotLightMAIN, 'penumbra', 0, 10, 0.1)
spotLightFolder.add(spotLightMAIN.shadow.camera, "near", 0.1, 100).onChange(() => spotLightMAIN.shadow.camera.updateProjectionMatrix())
spotLightFolder.add(spotLightMAIN.shadow.camera, "far", 0.1, 100).onChange(() => spotLightMAIN.shadow.camera.updateProjectionMatrix())
//spotLightFolder.add(data, "shadowMapSizeWidth", [256, 512, 1024, 2048, 4096]).onChange(() => updateShadowMapSize())
//spotLightFolder.add(data, "shadowMapSizeHeight", [256, 512, 1024, 2048, 4096]).onChange(() => updateShadowMapSize())
spotLightFolder.add(spotLightMAIN.position, 'x', -50, 50, 0.01)
spotLightFolder.add(spotLightMAIN.position, 'y', -50, 50, 0.01)
spotLightFolder.add(spotLightMAIN.position, 'z', -50, 50, 0.01)
spotLightFolder.open() */
            const spotLight = new THREE.SpotLight(0xffffff,3,15,.25,.1,7);// TO GIRL
            spotLight.position.set(1,2.1,.2);
            //spotLight.focus=.9
            //spotLight.castShadow = true;
            ////spotLight.receiveShadow = true;
            //spotLight.shadow.mapSize.width = 2048;
            //spotLight.shadow.mapSize.height = 2048;
            spotLight.target.position.set(mesh.position.x-.25,mesh.position.y,mesh.position.z);
            scene.add(spotLight.target);
            //spotLight.shadow.camera.near = .56;
            mesh.add( spotLight );
            mesh.add( spotLight.target );
            // floor
            const floor=new THREE.Mesh(new PlaneGeometry(20,20), new THREE.MeshStandardMaterial({color:0x333333,side: THREE.DoubleSide,}))
            floor.rotateX(-Math.PI/2)
            floor.position.set(0,-.45,0)
            floor.receiveShadow = true;
            mesh.add(floor)
            // \ floor
            // add spot light
            const cylForLight=new THREE.CylinderBufferGeometry( 0.01, 1.72, 7, 32, 80, true)
            cylForLight.translate( 0, -cylForLight.parameters.height/2, 0 );
            cylForLight.rotateX( -Math.PI / 2 );
            matForLight	= VolumetricMatrial()
            const meshForLight	= new THREE.Mesh( cylForLight, matForLight);
            meshForLight.position.set(1,2.1,.2)
            //meshForLight.lookAt(mesh.position.x+.1,mesh.position.y+.7,mesh.position.z)
            meshForLight.lookAt(mesh.position.x-.25,mesh.position.y,mesh.position.z)
            matForLight.uniforms.lightColor.value.set(0xffffff)
            matForLight.uniforms.spotPosition.value	= meshForLight.position
            matForLight.uniforms.anglePower.value=3.
            matForLight.uniforms.yy.value=.5
            //matForLight.uniforms.rotationY.value=mesh.rotation.y
            matForLight.uniforms.need.value=.1
            //matForLight.uniforms.attenuation.value=3.
            mesh.add( meshForLight );
            // \ Volumetric
            if(courses)mesh.add(courses)
            const preloader=document.querySelector('.preloader');
            //const tmp={}
            const duration=1000;
            //tmp.animeoncedLight2Start=anime({targets:oncedLight2,intensity:[0,2,1,.5,0,1,1.5,2.5,0,.1,.5,2,,1.7,.7,0],duration:8000,easing,loop:true,delay:1000});
            //tmp.animeoncedLight2Start.pause()
            //https://stackoverflow.com/questions/56071764/how-to-use-dracoloader-with-gltfloader-in-reactjs   DRACO FIX LOADER
            let debugTrue=3600
            if(DEBUG)debugTrue=100
            anime.timeline()
                .add({targets:mesh.position,x:[0,.04],y:[0,-.78],z:[-3,2],delay:debugTrue,duration:duration*2,easing,complete:()=>{
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
                            //oncedLight.intensity=lerp(0, .7, scalePercent(0, tmp2scr))
                            //if(!tmp.oncedL){
                            //    tmp.oncedL=1
                            //    anime({targets:oncedLight.position,y:[1.7,-1,1],duration:10000,loop:true,easing,})
                            //};
                            //if(planeGroupe){
                            //    planeGroupe.position.z=(lerp(2.3, 1.7, scalePercent(0, tmp2scr)));
                            //}
                            //tmp.animeoncedLight2Start.pause()
                            //oncedLight2.intensity=(lerp(0, 0, scalePercent(0, tmp2scr)));
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
                            //if(planeGroupe){
                            //    planeGroupe.position.set(
                            //        lerp(.4, -.2, scalePercent(tmp2scr, tmp3scr)),
                            //        lerp(.2, -.3, scalePercent(tmp2scr, tmp3scr)),
                            //        lerp(1.7, 2.3, scalePercent(tmp2scr, tmp3scr))
                            //    );
                            //    planeGroupe.rotation.z=lerp(-.5, -.05, scalePercent(tmp2scr, tmp3scr))
                            //    planeGroupe.scale.x=lerp(.4, .18, scalePercent(tmp2scr, tmp3scr))
                            //}
                            //tmp.animeoncedLight2Start.play();
                            //oncedLight.intensity=lerp(1.2, 0, scalePercent(tmp2scr, tmp3scr))
                            if(!objcts.loadImg){
                                objcts.loadImg=true
                                setImage(
                                    models.voiting, // src
                                    [.7,.7,.7], // size! of object scale
                                    [.819,1.641], // sizes of plane
                                    [0,-4,0], // position
                                    'obj1ImgPhone',
                                );
                            }
                        },
                    })
                    let BullLoaded=false// 4 screen
                    const tmp4scr=screenConst*3
                    let meshForLight2
                    animationScripts.push({
                        start: tmp3scr,
                        end: tmp4scr,
                        func: () => {
                            //tmp.animeoncedLight2Start.pause();
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
                                        Bull.position.set(.4,-.48,5.5)
                                        Bull.rotation.set(-1.54,0,3.3)
                                        Bull.material.color=new THREE.Color(mainColor)
                                        Bull.material.roughness=.4
                                        Bull.material.metalness=.5
                                        Bull.receiveShadow=true
                                        Bull.castShadow=true
                                        mesh.add(Bull)
                                    }
                                )
                            }
                            if(objcts.obj1ImgPhone){// Phone screen | -1,0,-2
                                objcts.obj1ImgPhone.position.set(-.5,-4,-1)
                                objcts.obj1ImgPhone.rotation.set(0,-1.6,0)
                                objcts.obj1ImgPhone.scale.set(.8,.8,1)
                                //if(!objcts.loadLight){
                                //    objcts.loadLight=true
                                //    const cylForLight	= new THREE.CylinderBufferGeometry(0,1,4,64,20,true)
                                //    cylForLight.translate(0,-cylForLight.parameters.height/2,0);
                                //    cylForLight.rotateX(-Math.PI/2);
                                //    const matForLight=VolumetricMatrial()
                                //    meshForLight2=new THREE.Mesh(cylForLight,matForLight)
                                //    meshForLight2.position.set(-2,.2,2)
                                //    meshForLight2.lookAt(new THREE.Vector3(-.5,-.2,0))
                                //    matForLight.uniforms.lightColor.value.set(0xf0cefb)
                                //    matForLight.uniforms.spotPosition.value=meshForLight2.position
                                //    matForLight.uniforms.anglePower.value=10.
                                //    matForLight.uniforms.yy.value=.0
                                //    matForLight.uniforms.need.value=0.0
                                //    matForLight.uniforms.attenuation.value=7.
                                //    objcts.obj1ImgPhone.add(meshForLight2);
                                //}
                                if(!objcts.loadLight){
                                    objcts.loadLight=true
                                    const cylForLight	= new THREE.CylinderBufferGeometry( 0.01, 1, 2, 32, 20, true)
                                    cylForLight.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, -cylForLight.parameters.height/2, 0 ) );
                                    cylForLight.rotateX( -Math.PI / 2 );
                                    const matForLight=VolumetricMatrial()
                                    meshForLight2=new THREE.Mesh( cylForLight, matForLight );
                                    meshForLight2.position.set(1,.2,1.5)
                                    meshForLight2.lookAt(new THREE.Vector3(-.5,-.2,-1.5))
                                    matForLight.uniforms.lightColor.value.set(0xf0cefb)
                                    matForLight.uniforms.spotPosition.value=meshForLight2.position
                                    matForLight.uniforms.anglePower.value=10.
                                    matForLight.uniforms.attenuation.value	= 1.2
                                    objcts.obj1ImgPhone.add( meshForLight2 );
                                }
                            }
                            //if(planeGroupe){
                            //    planeGroupe.position.set(
                            //        lerp(-.2, 0, scalePercent(tmp3scr,tmp4scr)),
                            //        lerp(-.3,.2, scalePercent(tmp3scr,tmp4scr)),
                            //        lerp(2.3, 2.4, scalePercent(tmp3scr,tmp4scr))
                            //    )
                            //    planeGroupe.rotation.z=lerp(-.05, .5, scalePercent(tmp3scr,tmp4scr))
                            //    planeGroupe.scale.x=lerp(.2, .3, scalePercent(tmp3scr,tmp4scr))
                            //}
                            //oncedLight.intensity=lerp(0, 1.2, scalePercent(tmp3scr,tmp4scr))
                            //oncedLight2.intensity=(lerp(0, 0, scalePercent(tmp3scr,tmp4scr)));
                            
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
                            //if(planeGroupe){
                            //    planeGroupe.position.set(
                            //        lerp(0, -.2, scalePercent(tmp4scr,tmp5scr)),
                            //        .2,
                            //        lerp(2.4, 2, scalePercent(tmp4scr,tmp5scr))
                            //    );
                            //    planeGroupe.rotation.z=lerp(.5, -.1, scalePercent(tmp4scr,tmp5scr))
                            //    planeGroupe.scale.x=lerp(.3, .2, scalePercent(tmp4scr,tmp5scr))
                            //}
                            //oncedLight.intensity=lerp(1.2, 0, scalePercent(tmp4scr, tmp5scr))
                        }
                    })
                    
                    const tmp6scr=screenConst*5// 6 screen Join the
                    //5.5 screen
                    //const tmp55scr=screenConst*4.5// 5.5 screen Join the
                    //animationScripts.push({
                    //    start: tmp55scr,
                    //    end: tmp6scr,
                    //    func: () => {
                    //        if(objcts.obj1ImgPhone){// Phone Object3d
                    //            anime({targets:objcts.obj1ImgPhone.position,x:-.5,y:.35,z:-1.5,duration:500,easing:'linear'})
                    //            anime({targets:objcts.obj1ImgPhone.rotation,y:.2,duration:500,easing:'linear'})
                    //        }
                    //    }
                    //})
                    // 6 scr
                    animationScripts.push({
                        start: tmp5scr,
                        end: tmp6scr,
                        func: () => {
                            mesh.position.set(  lerp(-.7, 0, scalePercent(tmp5scr, tmp6scr)),  lerp(-.4, -.3, scalePercent(tmp5scr, tmp6scr)),  lerp(.1, -1, scalePercent(tmp5scr, tmp6scr))  )
                            mesh.rotation.set( 0,  lerp(5.7, 6.1, scalePercent(tmp5scr, tmp6scr)),  0 )
                            //if(objcts.obj1ImgPhone){// Phone Object3d
                            //    anime({targets:objcts.obj1ImgPhone.position,x:.5,y:-4,z:0,duration,easing})
                            //    anime({targets:objcts.obj1ImgPhone.rotation,y:-1.6,duration,easing})
                            //}
                            //if(planeGroupe){
                            //    planeGroupe.position.set(
                            //        -.2,//lerp(-.2, 0, scalePercent(tmp5scr,tmp6scr)),
                            //        .2,
                            //        lerp(2, 2.08, scalePercent(tmp5scr,tmp6scr))
                            //    );
                            //    planeGroupe.rotation.z=lerp(-.1, 0, scalePercent(tmp5scr,tmp6scr))
                            //    planeGroupe.scale.x=lerp(.2, .1, scalePercent(tmp5scr,tmp6scr))
                            //}
                        }
                    })
                }});


                    ///loader.load(
                    ///    models.pseudoLight,
                    ///    pseudoLight=>{
                    ///        const l=pseudoLight.scene.children[0]
                    ///        
                    ///        l.material=new THREE.MeshBasicMaterial({
                    ///            color:0xffffff,
                    ///            opacity:.1,
                    ///            transparent:true,depthWrite:false,
                    ///        })
                    ///        /* new THREE.ShaderMaterial({
                    ///            uniforms: {
                    ///            color1: { value: new THREE.Color(0xffffff)},
                    ///            color2: { value: new THREE.Color(0x000000)},
                    ///            ratio: {value: 1.}
                    ///            },
                    ///            vertexShader: `// vec4( position, 1.) — localPosition
                    ///            varying vec3 vNormal;
                    ///            varying vec2 vUv;
                    ///            varying vec3 vPosition;
                    ///            void main () {
                    ///                vPosition = position;
                    ///                vUv = uv;
                    ///                vNormal = normal;
                    ///                gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.);
                    ///            }`,
                    ///            fragmentShader: `varying vec2 vUv;
                    ///                uniform vec3 color1;
                    ///                uniform vec3 color2;
                    ///                uniform float ratio;
                ///
                    ///                float cubicPulse( float c, float w, float x ){
                    ///                    x = abs(x - c);
                    ///                    if( x>w ) return 0.0;
                    ///                    x /= w;
                    ///                    return 1.0 - x*x*(3.0-2.0*x);
                    ///                }
                ///
                    ///                void main(){
                    ///                    vec2 uv = (vUv - 0.5) * vec2(ratio, .0);
                    ///                    float alpha = cubicPulse(.0,1.,vUv.y);
                    ///                    gl_FragColor = vec4( mix( color1, color2, length(uv)), alpha );
                    ///                }`,
                    ///                transparent:true,opacity: 1,depthWrite:false,
                    ///            }); */
                    ///        l.position.set(1,1,0)
                    ///        l.scale.set(1,1,1)
                    ///        if(mesh)mesh.add(l)
                    ///    }
                    ///)

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
        helpers.visible = false;
        scene.add( helpers );
        const courses=new THREE.Group();
        const tobj3d=new THREE.Group();
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
        function render() {
            TIME += .001;

            //if(matForLight&&mesh&&mesh.rotation){
            //    matForLight.uniforms.rotationY.value=mesh.rotation.y
            ////    console.log(mesh.rotation.y)
            //}

            if(TIME>10)TIME=0
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
            COMPOSER.render(scene, camera);
        }
        animate();
})();
