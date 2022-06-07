import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';

const models=Object.create({
    // hdr:'/model/webgl2/hdr/sepulchral_chapel_rotunda_1k6-softly_gray.hdr',
    //girl:'/model/2022-05-08/omaha_girl_04_05_17.glb',
    //girl:'/model/2022-05-31/2022-05-31-shoes-ok.glb',
    girl:'/model/2022-05-31/2022-05-31-ok-2-CL-1.glb',
    bull:'/model/2022-05-08/bull_statue_2.glb',
    voiting:'/media/voiting_03.webp',
    courses:'/media/courses_top.png',
    coursesBtm:'/media/courses_btm.png',
    // webgl2:'/js/webgl2.js',
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
    const DEBUG=false;//////////!!!!!!!!!!!!!!!!!!!!
    const easing='linear'
    let mixer

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
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
            }`,
            fragmentShader: `
            uniform sampler2D uRender;
            uniform float uTime;
            varying vec2 vUv;
            float rand(vec2 seed);
            void main() {
                float randomValue = rand(vec2(floor(vUv.y * 7.0), uTime));
                vec4 color;
                if (randomValue < 0.02) {
                    color = texture2D(uRender, vec2(vUv.x + randomValue - 0.01, vUv.y));
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

        const controls = new OrbitControls(camera, canvas)

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        const lightHolder = new THREE.Group();
        // 0 0 3
        /* const aLight=new THREE.PointLight(0xffffff,1,10);//0xfbc759
        aLight.position.set(0,0,3);
        lightHolder.add(aLight); */
        // top left
        const aLight2=new THREE.DirectionalLight(0xffffff,.7);
        aLight2.position.set(-1.5,1.7,0);
        lightHolder.add(aLight2);
        /* // backSide
        const aLight3=new THREE.DirectionalLight(0xffffff,.7);
        aLight3.position.set(-1,1.7,-1);
        lightHolder.add(aLight3); */
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

        //btm

        /* const aLightBtm=new THREE.DirectionalLight(0xffffff,1);
        aLightBtm.position.set(0,-.5,2);
        lightHolder.add(aLightBtm); */

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
                    if(name==='coursesBtm'){
                        if(objcts.obj1Img){
                            objcts.obj1Img.add(meshTexture)
                        }
                    //// courses
                    //    const ttfLoader = new TTFLoader()
                    //    const fontLoader = new FontLoader()
                    //    ttfLoader.load(
                    //        models.font,
                    //        fnt=>{
                    //            const textGeo = new THREE.TextGeometry(new String('text test text test text test text test text test text test text test text testtext test text test text test text test text test text test text test text testtext test text test text test text test text test text test text test text testtext test text test text test text test text test text test text test text test'),{
                    //                font:fontLoader.parse(fnt),
                    //                size:.07,
                    //                height: .001,
                    //                curveSegments: 12
                    //            });
                    //            const textMesh=new THREE.Mesh(
                    //                textGeo,
                    //                new THREE.MeshBasicMaterial({
                    //                    color:0xffffff,
                    //                    roughness:.1,
                    //                    metalness:1,
                    //                })
                    //            );
                    //            //objcts.obj1Img=textMesh
                    //            meshTexture.add(textMesh);
                    //        }
                    //    );
                    //    // \ courses
                    }else{
                        objcts[name]=tobj3d;
                        tobj3d.add(meshTexture)
                        scene.add(tobj3d)
                    }
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
        if(!isMobile){
            setImage(
                models.courses, // src
                null,//[.7,.7,.7], // size! of object scale
                [68.54,.12], // sizes of plane
                [14,2,-1], // position
                'obj1Img'
            )
            setImage(
                models.coursesBtm, // src
                null,//[.7,.7,.7], // size! of object scale
                [68.54,.12], // sizes of plane
                [14,1.8,-1], // position
                'coursesBtm'
            )
        }
        setImage(
            models.voiting, // src
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
        // const canvas2=document.querySelector('.webgl2');
        document.body.onscroll = () => {//calculate the current scroll progress as a percentage
            scrollPercent =
                ((document.documentElement.scrollTop || document.body.scrollTop) /
                    ((document.documentElement.scrollHeight ||
                        document.body.scrollHeight) -
                        document.documentElement.clientHeight)) * 100;
            // (document.getElementById('scrollProgress')).innerText =
            //     'Scroll Progress : ' + scrollPercent.toFixed(2)
            if(scrollPercent>95){
                if(canvas1){
                    canvas1.classList.add('canvas1Cl')
                    // canvas2.classList.remove('canvas1Cl')
                }
            }else{
                if(canvas1){
                    canvas1.classList.remove('canvas1Cl')
                    // canvas2.classList.add('canvas1Cl')
                }
            }
            //docScrl(scrollPercent)
        }
        // \ ANIMATE
        // Pseudo Lights
        let planeGroupe;
        if(!isMobile){
            planeGroupe=new THREE.Group()
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
                    let sizesCorrect=Object.create({
                        x:0,y:0
                    });
                    if(window.innerWidth<1025){
                        sizesCorrect.x+=2.5
                        sizesCorrect.y+=5
                    }
                const plane=new THREE.PlaneBufferGeometry(sizes[0]+sizesCorrect.x,sizes[1]+sizesCorrect.y)
                const planeMesh=new THREE.Mesh(plane,materialTest)
                planeMesh.rotation.set(rorationSet[0],rorationSet[1],rorationSet[2])
                planeMesh.position.set(positionSet[0],positionSet[1],positionSet[2])
                planeGroupe.add(planeMesh)
                return planeMesh
            }
            for(let i=0;i<5;i++){
                const rand1=THREE.Math.randFloat(2.,2.26)
                window.anime({
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
                    easing,
                })
            }
            scene.add(planeGroupe)
            planeGroupe.position.set(-.4,0,2.15)
            planeGroupe.scale.set(.2,2,.2)
        }
        // \ Pseudo Lights

        //3D background
        const D3Back=new THREE.Group()
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
            window.anime({
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
        }
        // \ 3D background


        //const mainColor=0x5A5651;
        const mainColor=0x1c1710;//211b13
        //const emissiveColor=0x333333;
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path
        //const gltf = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        let mesh
        /* function docScrl(perc){
            const percent=parseInt(perc);
            const screenConstInt=parseInt(screenConst);
            console.log(percent,screenConstInt);
            if(!mesh)return;
            const duration=2500
            switch (percent) {
                case 1://first screen
                    window.anime({targets:mesh.position,x:.04,y:-.78,z:2,duration,easing})
                    window.anime({targets:mesh.rotation,x:0,y:0,z:0,duration,easing})
                    break;
                case screenConstInt://second screen
                    window.anime({targets:mesh.position,x:.8,y:-.3,z:.1,duration,easing})
                    window.anime({targets:mesh.rotation,x:0,y:-.8,z:0,duration,easing})
                    break;
                case screenConstInt*2://third screen ...
                window.anime({targets:mesh.position,x:-.45,y:-.75,z:1.9,duration,easing})
                    window.anime({targets:mesh.rotation,x:0,y:1.1,z:0,duration,easing})
                    break;
                case screenConstInt*3://third screen ...
                    window.anime({targets:mesh.position,x:.8,y:-.3,z:.1,duration,easing})
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
                            //preloader.setAttribute('style','z-index:-1;opacity:1')
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
            sceneGlb.position.set(.1,-.52,.23)
            sceneGlb.scale.set(.05,.05,.05)

            const obj3d=new THREE.Object3D();
            
            sceneGlb.traverse(mesh => {
                if (mesh.isMesh) {
                    mesh.position.set(mesh.position.x,mesh.position.y,mesh.position.z)// POSITION
                    //mesh.rotation.set(0,0,0)
                    mesh.material.color=new THREE.Color(mainColor)
                    mesh.material.transparent=false
                    mesh.material.roughness=.4
                    mesh.material.metalness=.5
                    mesh.material.envMapIntensity=.8
                    mesh.material.envMap = hdrEquirect
                }
            });
            obj3d.add(sceneGlb)
            scene.add(obj3d)
            mesh=obj3d


            if(D3Back)mesh.add(D3Back)

            const preloader=document.querySelector('.preloader');
            const tmp={}
            const duration=1000;
            tmp.animeoncedLight2Start=window.anime({targets:oncedLight2,intensity:[0,2,1,.5,0,1,1.5,2.5,0,.1,.5,2,,1.7,.7,0],duration:8000,easing,loop:true,delay:1000});
            tmp.animeoncedLight2Start.pause()

            //https://stackoverflow.com/questions/56071764/how-to-use-dracoloader-with-gltfloader-in-reactjs   DRACO FIX LOADER

            

            window.anime.timeline()
                //.add({targets:preloader,opacity:[0,1],easing,duration:1})
                .add({targets:mesh.position,x:[0,.04],y:[0,-.78],z:[-3,2],delay:3600,duration:duration*2,easing,complete:()=>{
                    let temp=0,
                        temp2=0
                    const tmp2scr=screenConst// 2 screen

                    animationScripts.push({
                        start: 0,
                        end: tmp2scr,
                        func: () => {
                            //preloader.style.opacity=lerp(0,1, scalePercent(0, .1))
                            mesh.position.set(
                                lerp(.04, .8, scalePercent(0, tmp2scr)),
                                lerp(-.78,-.3, scalePercent(0, tmp2scr)),
                                lerp(2, .1, scalePercent(0, tmp2scr))
                            )
                            mesh.rotation.set(0,lerp(0, -.8, scalePercent(0, tmp2scr)),0)
                            if(objcts.obj1Img){// courses Object3d
                                if(temp<2){
                                    temp++
                                    if(objcts.obj1Img&&objcts.obj1Img.children[0])window.anime({targets:objcts.obj1Img.children[0].position,x:[14,-14],duration:5e4,loop:true,easing,})
                                    if(objcts.obj1Img&&objcts.obj1Img.children[1])window.anime({targets:objcts.obj1Img.children[1].position,x:[14,-14],duration:5e4/1.2,loop:true,easing,})
                                    //window.anime({targets:objcts.obj1Img.position,x:[7,-7],duration:10000,loop:true,easing:'linear',})
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
                                window.anime({targets:oncedLight.position,y:[1.7,-1,1],duration:10000,loop:true,easing,})
                            };
                            if(planeGroupe)planeGroupe.position.z=(lerp(2.15, 2.08, scalePercent(0, tmp2scr)));
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
                                lerp(.8, -.45, scalePercent(tmp2scr, tmp3scr)),//x
                                lerp(-.3, -.75, scalePercent(tmp2scr, tmp3scr)),//y
                                lerp(.1, 1.9, scalePercent(tmp2scr, tmp3scr)),//z
                            )
                            mesh.rotation.set(0,lerp(-.8, 1.1, scalePercent(tmp2scr, tmp3scr)),0)
                            if(objcts.obj1Img){// courses Object3d
                                objcts.obj1Img.position.set(0,-1.3,0)
                                objcts.obj1Img.rotation.set(0, lerp(-.2, .4, scalePercent(tmp2scr,tmp3scr)), 0)
                            }
                            if(planeGroupe)planeGroupe.position.set(
                                lerp(-.4, -.6, scalePercent(tmp2scr, tmp3scr)),
                                0,
                                lerp(2.08, 1.7, scalePercent(tmp2scr, tmp3scr))
                            )
                            if(planeGroupe)planeGroupe.rotation.z=lerp(0, .5, scalePercent(tmp2scr, tmp3scr))
                            if(Bull){
                                Bull.position.set(9,0,-6)
                                Bull.rotation.set(-1.3,0,.5)
                            }
                            tmp.animeoncedLight2Start.play();
                            oncedLight.intensity=lerp(1.2, 0, scalePercent(tmp2scr, tmp3scr))
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
                                lerp(-.45, .27, scalePercent(tmp3scr, tmp4scr)),
                                lerp(-.75, -.85, scalePercent(tmp3scr, tmp4scr)),
                                lerp(1.9, 1.8, scalePercent(tmp3scr, tmp4scr))
                            )
                            mesh.rotation.set(
                                lerp(0, .4, scalePercent(tmp3scr, tmp4scr)),
                                lerp(1.1, 3.7, scalePercent(tmp3scr, tmp4scr)),
                                0
                            )
                            if(!BullLoaded){
                                BullLoaded=true
                                loader.load(
                                    models.bull,
                                    bull=>{
                                    /* // https://discourse.threejs.org/t/giving-a-glb-a-texture-in-code/15071/5
                                        bull.scene.traverse( function( object ) {
                                        if ((object instanceof THREE.Mesh)){
                                            const bumpTexture = new THREE.TextureLoader().load('media/skin-bump-texture_1.png')
                                            object.material.bumpMap = bumpTexture
                                            object.material.bumpScale = .0001
                                        }
                                    }); */
                                //console.log(bull);
                                        Bull=bull.scene.children[0].children[0]
                                        //Bull.material.bumpMap = new THREE.TextureLoader().load(models.skin)
                                        //Bull.material.bumpScale = .001
                                        Bull.material.envMap = hdrEquirect
                                        //console.log(bull.map(e=>e instanceof THREE.Mesh?"log":null));
                                        Bull.position.set(0,-1,-5)
                                        Bull.rotation.set(-1.7,0,0)
                                        Bull.material.color=new THREE.Color(mainColor)
                                        Bull.material.transparent=false
                                        /* Bull.material.depthWrite=true
                                        Bull.material.depthTest=true */
                                        Bull.material.roughness=.4
                                        Bull.material.metalness=.5
                                        //Bull.material.emissive=new THREE.Color(emissiveColor)
                                        scene.add(Bull)
                                    }
                                )
                            }else{
                                if(Bull){
                                    Bull.position.set(
                                        lerp(9, -1.9, scalePercent(tmp3scr, tmp4scr)),
                                        lerp(-1, 0, scalePercent(tmp3scr, tmp4scr)),
                                        lerp(-5, -3, scalePercent(tmp3scr, tmp4scr))
                                    )
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

                            if(planeGroupe)planeGroupe.position.set(
                                lerp(-.6, -.45, scalePercent(tmp3scr,tmp4scr)),
                                0,
                                lerp(1.7, 2.08, scalePercent(tmp3scr,tmp4scr))
                            )
                            if(planeGroupe)planeGroupe.rotation.z=.5
                            oncedLight.intensity=lerp(0, 1.2, scalePercent(tmp3scr,tmp4scr))
                            oncedLight2.intensity=(lerp(0, 0, scalePercent(tmp3scr,tmp4scr)));

                        },
                    })
                    const tmp5scr=screenConst*4// 5 screen
                    animationScripts.push({
                        start: tmp4scr,
                        end: tmp5scr,
                        func: () => {
                            oncedLight.intensity=lerp(1.2, 0, scalePercent(tmp4scr, tmp5scr))
                            mesh.position.set(  lerp(.27, -.8, scalePercent(tmp4scr, tmp5scr)),  lerp(-.85, -.3, scalePercent(tmp4scr, tmp5scr)),  lerp(1.8, .1, scalePercent(tmp4scr, tmp5scr))  )
                            mesh.rotation.set(  lerp(.4, 0, scalePercent(tmp4scr, tmp5scr)),  lerp(3.7, .7, scalePercent(tmp4scr, tmp5scr)),  0  )
                            if(Bull){//Bull show in viewport
                                Bull.position.set(lerp(-1.9, 9, scalePercent(tmp4scr, tmp5scr)),  0,  lerp(-3, -5, scalePercent(tmp4scr, tmp5scr)))
                            }
                            if(objcts.obj1Img){// courses Object3d
                                objcts.obj1Img.position.set(0,  lerp(1, -1.3, scalePercent(tmp4scr,tmp5scr)),  lerp(0, -1.5, scalePercent(tmp4scr,tmp5scr)))
                                objcts.obj1Img.rotation.set(0,lerp(2.8,-.2,scalePercent(tmp4scr,tmp5scr)),0)
                            }
                            if(objcts.obj1ImgPhone){// Phone Object3d
                                if(temp2<2){
                                    temp2++
                                    window.anime({
                                        targets:objcts.obj1ImgPhone.children[0].rotation,y:[.2,0,.2,0,.2,0,.2,0,.2,0,.2,0,.2,0,.2,0,.2],duration:32000,loop:true,easing
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
                            if(planeGroupe)planeGroupe.position.set(
                                lerp(-.45, -.6, scalePercent(tmp4scr,tmp5scr)),
                                0,
                                lerp(2.08, 1.7, scalePercent(tmp4scr,tmp5scr))
                            )
                            if(planeGroupe)planeGroupe.rotation.z=lerp(.5, -.2, scalePercent(tmp4scr,tmp5scr))
                        }
                    })
                    const tmp6scr=screenConst*5// 6 screen Join the
                    animationScripts.push({
                        start: tmp5scr,
                        end: tmp6scr,
                        func: () => {
                            mesh.position.set(
                                lerp(-.8, .3, scalePercent(tmp5scr, tmp6scr)),
                                lerp(-.3, -.8, scalePercent(tmp5scr, tmp6scr)),
                                lerp(.1, 2, scalePercent(tmp5scr, tmp6scr))
                            )
                            mesh.rotation.set( 0,  lerp(.7, 4.6, scalePercent(tmp5scr, tmp6scr)),  0 )
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
                            /* if(planeGroupe)planeGroupe.position.set(
                                lerp(-.6, -.45, scalePercent(tmp5scr, tmp6scr)),
                                0,
                                lerp(1.7, 2.08, scalePercent(tmp5scr, tmp6scr))
                            ) */
                            if(planeGroupe)planeGroupe.rotation.z=lerp(-.2, 3.5, scalePercent(tmp5scr, tmp6scr))

                        }
                    })
                    /* const tmp7scr=screenConst*6// 7 screen
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
            if (mixer) mixer.update(clock.getDelta());
        }
        const clock = new THREE.Clock()
        function render() {
            TIME += .001;
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
                TIME=THREE.Math.randFloat(0,.4)
                COMPOSER.passes.forEach((pass) => {
                    if (pass) {
                        if(pass.uniforms)pass.uniforms.uTime.value = TIME;
                    }
                });
            }
            COMPOSER.render(scene, camera);
        }
        animate();
    //}, 200);//5200
})();

(()=>{//load 2 webgl
    if(window.innerWidth>1024){
        setTimeout(()=>{
            const d=document;
            const sc=d.createElement('script');
            // sc.src=models.webgl2;
            d.body.appendChild(sc)
        },100)
    }
})()
