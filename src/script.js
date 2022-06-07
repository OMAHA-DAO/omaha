import gsap from "gsap";

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

Promise.all([
	import(
		/* webpackChunkName: "gsap" */
		`gsap`
		)

]).then(function (modules) {
	console.log("[IMPORT]", modules);

	// Expand modules into variables for more convenient use
	const [gsapModule] = modules;

	window.gsap = gsapModule.default;

	const fundamentals = $('.fundamentals__list');

	let fundamentals_img_1 = $('.fundamentals__desktop_1'),
		fundamentals_img_2 = $('.fundamentals__desktop_2'),
		fundamentals_img_3 = $('.fundamentals__desktop_3'),
		fundamentals_img_4 = $('.fundamentals__desktop_4'),
		fundamentals_img_5 = $('.fundamentals__desktop_5'),
		fundamentals_img_6 = $('.fundamentals__desktop_6');

	$('.accordeon-trigger').click(function(){

		let _this = $(this),
			id = _this.attr('id')

		switch (id){

			case 'accordeon-trigger-0':

				window.gsap.to(fundamentals_img_1, 1, { transform: `translate(-33%,22%)` })
				window.gsap.to(fundamentals_img_2, 1, { transform: `translate(-27%,20%)` })
				window.gsap.to(fundamentals_img_3, 1, { transform: `translate(-67%,122%)` })
				window.gsap.to(fundamentals_img_4, 1, { transform: `translate(-32%,245%)` })
				window.gsap.to(fundamentals_img_5, 1, { transform: `translate(0%,98%)` })
				window.gsap.to(fundamentals_img_6, 1, { transform: `translate(46%,119%)` })

				break;

			case 'accordeon-trigger-1':

				window.gsap.to(fundamentals_img_1, 1, { transform: `translate(-33%,22%)` })
				window.gsap.to(fundamentals_img_2, 1, { transform: `translate(-27%,20%)` })
				window.gsap.to(fundamentals_img_3, 1, { transform: `translate(-67%,122%)` })
				window.gsap.to(fundamentals_img_4, 1, { transform: `translate(-95%,245%) rotate(45deg)` })
				window.gsap.to(fundamentals_img_5, 1, { transform: `translate(20%, 120%) rotate(321deg)` })
				window.gsap.to(fundamentals_img_6, 1, { transform: `translate(0%,95%) rotate(275deg)` })

				break;

			case 'accordeon-trigger-2':

				window.gsap.to(fundamentals_img_1, 1, { transform: `translate(-128%,85%)` })
				window.gsap.to(fundamentals_img_2, 1, { transform: `translate(-27%,20%)` })
				window.gsap.to(fundamentals_img_3, 1, { transform: `translate(20%,115%)` })
				window.gsap.to(fundamentals_img_4, 1, { transform: `translate(-95%,245%) rotate(45deg)` })
				window.gsap.to(fundamentals_img_5, 1, { transform: `translate(20%, 120%) rotate(321deg)` })
				window.gsap.to(fundamentals_img_6, 1, { transform: `translate(0%,95%) rotate(275deg)` })

				break;

			case 'accordeon-trigger-3':

				window.gsap.to(fundamentals_img_1, 1, { transform: `translate(-128%,85%)` })
				window.gsap.to(fundamentals_img_2, 1, { transform: `translate(-57%,36%)` })
				window.gsap.to(fundamentals_img_3, 1, { transform: `translate(0%,136%)` })
				window.gsap.to(fundamentals_img_4, 1, { transform: `translate(-85%,272%) rotate(53deg)` })
				window.gsap.to(fundamentals_img_5, 1, { transform: `translate(15%, 160%) rotate(340deg)` })
				window.gsap.to(fundamentals_img_6, 1, { transform: `translate(66%,95%) rotate(264deg)` })

				break;

			case 'accordeon-trigger-4':

				window.gsap.to(fundamentals_img_1, 1, { transform: `translate(-128%,85%)` })
				window.gsap.to(fundamentals_img_2, 1, { transform: `translate(-38%,21%)` })
				window.gsap.to(fundamentals_img_3, 1, { transform: `translate(45%,118%)` })
				window.gsap.to(fundamentals_img_4, 1, { transform: `translate(0%,136%)` })
				window.gsap.to(fundamentals_img_5, 1, { transform: `translate(22%, 122%) rotate(310deg)` })
				window.gsap.to(fundamentals_img_6, 1, { transform: `translate(37%,114%) rotate(323deg)` })

				break;

			case 'accordeon-trigger-5':

				window.gsap.to(fundamentals_img_1, 1, { transform: `translate(-71%,42%) rotate(270deg)` })
				window.gsap.to(fundamentals_img_2, 1, { transform: `transform: translate(-70%,25%)` })
				window.gsap.to(fundamentals_img_3, 1, { transform: `translate(-38%,126%) rotate(270deg)` })
				window.gsap.to(fundamentals_img_4, 1, { transform: `translate(-72%,249%) rotate(26deg)` })
				window.gsap.to(fundamentals_img_5, 1, { transform: `translate(23%, 97%) rotate(297deg)` })
				window.gsap.to(fundamentals_img_6, 1, { transform: `translate(8%,119%) rotate(260deg)` })

				break;

			default:

				window.gsap.to(fundamentals_img_1, 1, { transform: `translate(-33%,22%)` })
				window.gsap.to(fundamentals_img_2, 1, { transform: `translate(-27%,20%)` })
				window.gsap.to(fundamentals_img_3, 1, { transform: `translate(-67%,122%)` })
				window.gsap.to(fundamentals_img_4, 1, { transform: `translate(-32%,245%)` })
				window.gsap.to(fundamentals_img_5, 1, { transform: `translate(0%,98%)` })
				window.gsap.to(fundamentals_img_6, 1, { transform: `translate(46%,119%)` })

				break;

		}

	})

});
