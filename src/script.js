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

const models=Object.create({
    hdr:'/model/webgl2/hdr/sepulchral_chapel_rotunda_1k6-softly_gray.hdr',
    girl:'/model/2022-05-31/2022-05-31-shoes-ok.glb',
    bull:'/model/2022-05-08/bull_statue_2.glb',
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
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, .1, 100)
        let percentToScreens=330;
        if(window.innerWidth<1025){//MOBILE | !!! the code below assumes only a mobile version of the site !!!
            camera.position.set(0, 0, 3.2);
            percentToScreens=400
        }
        if(window.innerWidth>1024){
            camera.position.set(0, 0, 3);
        }
        let screenConst=parseInt(window.getComputedStyle(slider).height)/percentToScreens;//100/7 ( 7 = screens.length)
        const canvas = document.querySelector('canvas.webgl')
        const renderer = new THREE.WebGLRenderer({
            canvas, alpha: true, antialias: true,
        });
        let TIME=0//GLITCH FROM https://codepen.io/sfi0zy/pen/MZdeKB
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(canvas)

        //const controls = new OrbitControls(camera, canvas)

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        const lightHolder = new THREE.Group();
        // 0 0 3
        const aLight=new THREE.PointLight(0xffffff,1,10);//0xfbc759
        aLight.position.set(0,0,3);
        lightHolder.add(aLight);
        // top left
        const aLight2=new THREE.DirectionalLight(0xffffff,.7);
        aLight2.position.set(-1.5,1.7,0);
        lightHolder.add(aLight2);
        //frontSide
        const aLight4=new THREE.DirectionalLight(0xffffff,.5);//0xe7ba92/DE9C63
        aLight4.position.set(2,1,2);
        lightHolder.add(aLight4);
        //frontSide 2
        const aLight5=new THREE.DirectionalLight(0xffffff,.5);//0xe7ba92/DE9C63
        aLight5.position.set(2,1.7,-1);
        lightHolder.add(aLight5);

        scene.add(lightHolder)

        // girl and bull loaders
        let pl=null;
        const animationScripts = [{ start:0, end:0, func:0 }]
        const loader = new GLTFLoader();
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
            if(scrollPercent>95){
                if(canvas1){
                    canvas1.classList.add('canvas1Cl')
                }
            }else{
                if(canvas1){
                    canvas1.classList.remove('canvas1Cl')
                }
            }
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
                            preloader.setAttribute('style','z-index:-1;opacity:1')
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
                                translateY:['-120%',0],  easing,  duration:700,
                            })
                        }
                    })
                }
            });
            const sceneGlb=gltf.scene
            mixer = new THREE.AnimationMixer(sceneGlb)
            mixer.clipAction((gltf).animations[0]).play()
            scene.add(sceneGlb)
            sceneGlb.position.set(.08,-.45,.11)
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
                }
            });
            obj3d.add(sceneGlb)
            scene.add(obj3d)
            const mesh=obj3d
            const preloader=document.querySelector('.preloader');
            
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
                                lerp(-.78,-.3, scalePercent(0, tmp2scr)),
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
                                lerp(-.3, -.68, scalePercent(tmp2scr, tmp3scr)),//y
                                lerp(.1, 1.9, scalePercent(tmp2scr, tmp3scr)),//z
                            )
                            mesh.rotation.set(-.1,lerp(0, 1.1, scalePercent(tmp2scr, tmp3scr)),0)
                            if(Bull){
                                Bull.position.set(9,0,-6)
                                Bull.rotation.set(-1.3,0,.5)
                            }
                        },
                    })
                    let BullLoaded=false// 4 screen
                    const tmp4scr=screenConst*3
                    animationScripts.push({
                        start: tmp3scr,
                        end: tmp4scr,
                        func: () => {
                            mesh.position.set(
                                lerp(.04, .06, scalePercent(tmp3scr, tmp4scr)),
                                lerp(-.68, -.71, scalePercent(tmp3scr, tmp4scr)),
                                lerp(1.9, 1.2, scalePercent(tmp3scr, tmp4scr))
                            )
                            mesh.rotation.set(
                                lerp(-.1, .2, scalePercent(tmp3scr, tmp4scr)),
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
                                        Bull.position.set(0,-1,-5)
                                        Bull.rotation.set(-1.7,0,0)
                                        Bull.material.color=new THREE.Color(mainColor)
                                        Bull.material.transparent=false
                                        Bull.material.roughness=.4
                                        Bull.material.metalness=.5
                                        scene.add(Bull)
                                    }
                                )
                            }else{
                                if(Bull){
                                    Bull.position.set(
                                        lerp(9, -.9, scalePercent(tmp3scr, tmp4scr)),
                                        lerp(-1, 0, scalePercent(tmp3scr, tmp4scr)),
                                        lerp(-5, -6, scalePercent(tmp3scr, tmp4scr))
                                    )
                                    Bull.rotation.set(-1.3,0,.5)
                                }
                            }
                        },
                    })
                    const tmp5scr=screenConst*4// 5 screen
                    animationScripts.push({
                        start: tmp4scr,
                        end: tmp5scr,
                        func: () => {
                            mesh.position.set(  lerp(.06, .04, scalePercent(tmp4scr, tmp5scr)),  lerp(-.71, -.2, scalePercent(tmp4scr, tmp5scr)),  lerp(1.2, .3, scalePercent(tmp4scr, tmp5scr))  )
                            mesh.rotation.set(  lerp(.2, -.2, scalePercent(tmp4scr, tmp5scr)),  lerp(3.7, .7, scalePercent(tmp4scr, tmp5scr)),  0  )
                            if(Bull){//Bull show in viewport
                                Bull.position.set(lerp(-.9, 9, scalePercent(tmp4scr, tmp5scr)),  0,  lerp(-6, -5, scalePercent(tmp4scr, tmp5scr)))
                            }
                        }
                    })
                    const tmp6scr=screenConst*5// 6 screen Join the
                    animationScripts.push({
                        start: tmp5scr,
                        end: tmp6scr,
                        func: () => {
                            mesh.position.set(
                                lerp(.04, .03, scalePercent(tmp5scr, tmp6scr)),
                                lerp(-.2, -.78, scalePercent(tmp5scr, tmp6scr)),
                                lerp(.3, 2, scalePercent(tmp5scr, tmp6scr))
                            )
                            mesh.rotation.set( lerp(-.2, 0, scalePercent(tmp5scr, tmp6scr)),  lerp(.7, -1.7, scalePercent(tmp5scr, tmp6scr)),  0 )
                        }
                    })
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
