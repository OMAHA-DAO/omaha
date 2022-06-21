/**
 * 
 * THIS CODE FOR MOBILE DEVICES ONLY
 * 
 */
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import { FontLoader } from '../src/FontLoader';

import {VolumetricMatrial} from '../src/threex.volumetricspotlightmaterial'

const models=Object.create({
    hdr:'/model/webgl2/hdr/sepulchral_chapel_rotunda_1k6-softly_gray.hdr',
    girl:'/model/2022-05-31/2022-05-31-ok-2-CL-1.glb',
    bull:'/model/2022-05-08/bull_statue_2.glb',
    font:'/fonts/no-ru-symb.ttf',
});

(()=>{
    const hdrEquirect = new RGBELoader().load(
        models.hdr,
        () => {hdrEquirect.mapping = THREE.EquirectangularReflectionMapping}
    );
    const d=document
    const slider=d.querySelector('.slider');
    const DEBUG=false;//////////!!!!!!!!!!!!!!!!!!!!
    const easing='linear'
    let mixer

    //setTimeout(() => {
        // https://sbcode.net/threejs/animate-on-scroll/
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, .1, 100)
        let percentToScreens=330;
        if(window.innerWidth<1025){//MOBILE | !!! the code below assumes only a mobile version of the site !!!
            camera.position.set(0, .1, 3.2);
            percentToScreens=400
        }
        if(window.innerWidth>1024){
            camera.position.set(0, 0, 3);
        }
        camera.rotation.set(-.3,0,0)
        let screenConst=parseInt(window.getComputedStyle(slider).height)/percentToScreens;//100/7 ( 7 = screens.length)
        const canvas = document.querySelector('canvas.webgl')
        const renderer = new THREE.WebGLRenderer({
            canvas, /* alpha: true, */ antialias: true,
        });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        let TIME=0//GLITCH FROM https://codepen.io/sfi0zy/pen/MZdeKB
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(canvas)

//const controls = new OrbitControls(camera, canvas)

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        //const lightHolder = new THREE.Group();
        // 0 0 3
        //const aLight=new THREE.PointLight(0xffffff,1,10);//0xfbc759
        //aLight.position.set(0,0,3);
        //lightHolder.add(aLight);
        //// top left
        //const aLight2=new THREE.DirectionalLight(0xffffff,.7);
        //aLight2.position.set(-1.5,1.7,0);
        //lightHolder.add(aLight2);
        ////frontSide
        //const aLight4=new THREE.DirectionalLight(0xffffff,.5);//0xe7ba92/DE9C63
        //aLight4.position.set(2,1,2);
        //lightHolder.add(aLight4);
        ////frontSide 2
        //const aLight5=new THREE.DirectionalLight(0xffffff,.5);//0xe7ba92/DE9C63
        //aLight5.position.set(2,1.7,-1);
        //lightHolder.add(aLight5);
//
        //scene.add(lightHolder)

        // girl and bull loaders
        let pl=null;
        const animationScripts = [{ start:0, end:0, func:0 }]
        const loader = new GLTFLoader();

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path
        //const gltf = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        // ANIMATE
        let scrollPercent = 0
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
        const canvas1=document.querySelector('.webgl');
        document.body.onscroll = () => {//calculate the current scroll progress as a percentage
            scrollPercent =
                ((document.documentElement.scrollTop || document.body.scrollTop) /
                    ((document.documentElement.scrollHeight ||
                        document.body.scrollHeight) -
                        document.documentElement.clientHeight)) * 100;
            (document.getElementById('scrollProgress')).innerText =
                'Scroll Progress : ' + scrollPercent.toFixed(2)
            //if(scrollPercent>95){
            //    if(canvas1){
            //        canvas1.classList.add('canvas1Cl')
            //    }
            //}else{
            //    if(canvas1){
            //        canvas1.classList.remove('canvas1Cl')
            //    }
            //}
        }
        // \ ANIMATE

        const mainColor=0x1c1710;//211b13
        let Bull=null
        loader.load(
            models.girl,// resource URL
            gltf=>{// called when the resource is loaded
                // Remove preloader and start HTML anim
            const preloaderImg1=document.querySelector('.preload-img-1')
            const preloaderImg2=document.querySelector('.preload-img-2')
            const ANImain1=document.querySelector('.ANI-main-1')
            let dur=2000;
            if(DEBUG)dur=100
            window.anime({
                targets:preloaderImg1,
                opacity:[1,0],
                easing,
                duration:dur,//3000
            });
            window.anime({
                targets:preloaderImg2,
                opacity:[0,1],
                duration:800,
                easing,
                delay:1200,
                complete:()=>{
                    preloaderImg2.classList.add('preloaderImg2Cl')
                    window.anime.timeline()
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
                    .add({
                        targets:ANImain1,
                        opacity:[0,1],
                        translateY:['-10%',0],
                        easing,
                        duration:2000,
                    })
                    .add({
                        complete:()=>{
                            window.anime.timeline()
                            .add({
                                targets:document.querySelector('.ANI-main-2'),  opacity:1,  translateY:['4rem',0],  easing,  duration:700
                            })
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
            sceneGlb.position.set(.08,-.52,.11)
            sceneGlb.rotation.set(-.1,0,0)
            sceneGlb.scale.set(.05,.05,.05)

            const obj3d=new THREE.Object3D();
            
            sceneGlb.traverse(mesh => {
                if (mesh.isMesh) {
                    mesh.position.set(mesh.position.x,mesh.position.y,mesh.position.z)// POSITION
                    mesh.material.color=new THREE.Color(mainColor)
                    mesh.material.transparent=false
                    mesh.material.roughness=.4
                    mesh.material.metalness=.5
                    mesh.material.envMapIntensity=1.4
                    mesh.material.envMap = hdrEquirect
                    mesh.receiveShadow=true
                    mesh.castShadow=true
                }
            });
            obj3d.add(sceneGlb)
            scene.add(obj3d)
            const mesh=obj3d

        // Volumetric
            const spotLightMAIN = new THREE.SpotLight(0xffffff,1,30,1.8,1,9);// TO GIRL
            spotLightMAIN.position.set(1,2.1,.2);
            spotLightMAIN.target.position.set(mesh.position.x-.25,mesh.position.y,mesh.position.z);
            spotLightMAIN.shadow.mapSize.width = 2048*2;
            spotLightMAIN.shadow.mapSize.height = 2048*2;
            spotLightMAIN.shadow.camera.near = .1;
            spotLightMAIN.castShadow = true;
            mesh.add(spotLightMAIN)
            mesh.add( spotLightMAIN.target );
            const spotLight=new THREE.SpotLight(0xffffff,3,15,.25,.1,7);// TO GIRL
            spotLight.position.set(1,2.1,.2);
            spotLight.target.position.set(mesh.position.x-.25,mesh.position.y,mesh.position.z-.3);
            scene.add(spotLight.target);
            mesh.add(spotLight);
            mesh.add(spotLight.target);
            // floor
            const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshStandardMaterial({color:0x333333,side: THREE.DoubleSide,}))
            floor.rotateX(-Math.PI/2)
            floor.position.set(0,-.45,0)
            floor.receiveShadow = true;
            mesh.add(floor)
            // \ floor
            // add spot light
            const cylForLight=new THREE.CylinderBufferGeometry( 0.01, 1.72, 7, 32, 80, true)
            cylForLight.translate( 0, -cylForLight.parameters.height/2, 0 );
            cylForLight.rotateX( -Math.PI / 2 );
            const matForLight	= VolumetricMatrial()
            const meshForLight	= new THREE.Mesh( cylForLight, matForLight);
            meshForLight.position.set(1,2.1,.2)
            meshForLight.lookAt(mesh.position.x-.25,mesh.position.y,mesh.position.z-.3)
            matForLight.uniforms.lightColor.value.set(0xffffff)
            matForLight.uniforms.spotPosition.value	= meshForLight.position
            matForLight.uniforms.anglePower.value=3.
            matForLight.uniforms.yy.value=.5
            matForLight.uniforms.need.value=.1
            mesh.add( meshForLight );
        // \ Volumetric

            const preloader=document.querySelector('.preloader');
            if(courses)mesh.add(courses)
            const duration=1000;
            window.anime.timeline()
                .add({targets:preloader,opacity:[0,1],easing,duration:1})
                .add({targets:mesh.position,x:[0,.04],y:[0,-.78],z:[-7,2],delay:2800,duration:duration*2,easing:'easeOutQuad',complete:()=>{
                    const tmp2scr=screenConst// 2 screen
                    animationScripts.push({
                        start: 0,
                        end: tmp2scr,
                        func: () => {
                            mesh.position.set(
                                .04,
                                lerp(-.78,-.6, scalePercent(0, tmp2scr)),
                                lerp(2, .1, scalePercent(0, tmp2scr))
                            )
                        },
                    })
                    const tmp3scr=screenConst*2// 3 screen
                    animationScripts.push({
                        start: tmp2scr,
                        end: tmp3scr,
                        func: () => {
                            mesh.position.set(
                                .04,
                                lerp(-.6, -.8, scalePercent(tmp2scr, tmp3scr)),//y
                                lerp(.1, 1.9, scalePercent(tmp2scr, tmp3scr)),//z
                            )
                            mesh.rotation.set(-.1,lerp(0, 1.1, scalePercent(tmp2scr, tmp3scr)),0)
                            //if(Bull){
                            //    Bull.position.set(4,0,-6)
                            //    Bull.rotation.set(-1.3,0,.5)
                            //}
                        },
                    })
                    let BullLoaded=false// 4 screen
                    const tmp4scr=screenConst*3
                    animationScripts.push({
                        start: tmp3scr,
                        end: tmp4scr,
                        func: () => {
                            mesh.position.set(
                                lerp(.04, .2, scalePercent(tmp3scr, tmp4scr)),
                                lerp(-.8, -.8, scalePercent(tmp3scr, tmp4scr)),
                                lerp(1.9, 1.2, scalePercent(tmp3scr, tmp4scr))
                            )
                            mesh.rotation.set(
                                -.1,
                                lerp(1.1, 3.7, scalePercent(tmp3scr, tmp4scr)),
                                0
                            )
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
                                        Bull.material.transparent=false
                                        Bull.material.roughness=.4
                                        Bull.material.metalness=.5
                                        Bull.receiveShadow=true
                                        Bull.castShadow=true
                                        mesh.add(Bull)
                                    }
                                )
                            }else{
                                if(Bull){
                                    Bull.position.set(.4,-.48,5.5)
                                }
                            }
                        },
                    })
                    const tmp5scr=screenConst*4// 5 screen
                    animationScripts.push({
                        start: tmp4scr,
                        end: tmp5scr,
                        func: () => {
                            mesh.position.set(  lerp(.2, .04, scalePercent(tmp4scr, tmp5scr)), -.8 /* lerp(-.8, -.6, scalePercent(tmp4scr, tmp5scr)) */,  lerp(1.2, .3, scalePercent(tmp4scr, tmp5scr))  )
                            mesh.rotation.set(  -.1,  lerp(3.7, 5.7, scalePercent(tmp4scr, tmp5scr)),  0  )
                            if(Bull){//Bull show in viewport
                                Bull.position.set(.4,-.48,5.5)
                            }
                            //if(Bull){//Bull show in viewport
                            //    Bull.position.set(lerp(-.9, -4, scalePercent(tmp4scr, tmp5scr)),  0,  lerp(-6, -5, scalePercent(tmp4scr, tmp5scr)))
                            //}
                        }
                    })
                    const tmp6scr=screenConst*5// 6 screen Join the
                    animationScripts.push({
                        start: tmp5scr,
                        end: tmp6scr,
                        func: () => {
                            mesh.position.set(
                                lerp(.04, .03, scalePercent(tmp5scr, tmp6scr)),
                                -.8,//lerp(-.7, -.25, scalePercent(tmp5scr, tmp6scr)),
                                lerp(.3, -1, scalePercent(tmp5scr, tmp6scr))
                            )
                            mesh.rotation.set( lerp(-.1, 0, scalePercent(tmp5scr, tmp6scr)),  lerp(5.7, 6.2, scalePercent(tmp5scr, tmp6scr)),  0 )
                            if(Bull){//Bull show in viewport
                                Bull.position.set(0,0,10)
                            }
                        }
                    })
                }})
            }
        );
        // courses | https://threejs.org/examples/#webgl_clipping_intersection

        //
        renderer.localClippingEnabled = true;
        // \
        const objcts=Object.create({});
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
        courses.position.set(0,1.2,-2.5)
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
        // \ girl and bull loaders
        window.addEventListener('resize', () =>{
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            screenConst=parseInt(window.getComputedStyle(slider).height)/percentToScreens;
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
            renderer.render(scene, camera);
        }
        animate()
})();
