
let webglPromise;
let webglMode = "desktop";

if(window.screen.width <= 1024){
    webglMode = "mobile";

    webglPromise = Promise.all([
        import(
            /* webpackChunkName: "webgl_mobile" */
            `./includes/webgl_mobile`
            ),
    ])
}else{
    webglPromise = Promise.all([
        import(
            /* webpackChunkName: "webgl_desktop" */
            `./includes/webgl_desktop`
            ),
    ]);
}
webglPromise.then(function (modules) {
    console.log("[IMPORT]", modules);
});



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
