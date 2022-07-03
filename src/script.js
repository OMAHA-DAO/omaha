
window.config = require('./config.json');

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
    //console.log("[IMPORT]", modules);
});



import "./includes/milestones_animation";

var preloads =
    Promise.all([
        import(
            /* webpackChunkName: "gsap" */
            `gsap`
            ),
        import(
            /* webpackChunkName: "gsap_CSSPlugin" */
            `gsap/CSSPlugin`
            ),
        import(
            /* webpackChunkName: "gsap_ScrollTrigger" */
            `gsap/ScrollTrigger`
            ),
        import(
            /* webpackChunkName: "gsap_CSSRulePlugin" */
            `gsap/CSSRulePlugin`
            ),
        import(
            /* webpackChunkName: "picture_functions" */
            `./includes/picture_functions`
            ),
    ]).then(function (modules) {
        console.log("[IMPORT]", modules);

        // Expand modules into variables for more convenient use
        const [gsapModule, gsapCSSPluginModule, gsapScrollTriggerModule, gsapCSSRulePluginModule, PictureModule] = modules;

        window.gsap = gsapModule.default;

        window.CSSPlugin = gsapCSSPluginModule.default;
        window.ScrollTrigger = gsapScrollTriggerModule.default;
        window.CSSRulePlugin = gsapCSSRulePluginModule.default;

        window.Picture = PictureModule;

        window.gsap.registerPlugin(window.CSSPlugin);
        window.gsap.registerPlugin(window.ScrollTrigger);
        window.gsap.registerPlugin(window.CSSRulePlugin);
        // ---


        window.Picture.lazy_load_gsap_launch();

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
                    window.gsap.to(fundamentals_img_6, 1, { transform: `translate(46%,119%)` })

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

Promise.all([
    import(
        /* webpackChunkName: "rss-to-json" */
        `rss-to-json`
        ),
    import(
        /* webpackChunkName: "splide" */
        `@splidejs/splide`
        ),
    import(
        /* webpackChunkName: "picture_functions" */
        `./includes/picture_functions`
        ),
]).then(function (modules) {
    //console.log("[IMPORT]", modules);

    // Expand modules into variables for more convenient use
    const [
        rssToJson,
        splideModule,
        PictureModule,
    ] = modules;
    window.rssToJson = rssToJson.parse;
    window.Splide = splideModule.default;
    window.Picture = PictureModule;

    // window.Picture.lazy_load_ib_launch({
    //     rootMargin: window.height/2 + "px 0px " + window.height/2 + "px 0px",
    // });

    let sliderContentElement = $(".splide__list");

    let p =(async function() {
        let rssConverterUrl = `https://api.rss2json.com/v1/api.json?rss_url=${window.config.medium.feed}`;
        let response = await fetch(rssConverterUrl);
        return await response.json();
    })();
    p.then(function (data) {
        //console.log(data);

        let sliderContent = "";
        let i=0;
        for(; i < data.items.length && i < window.config.medium.limit; i++){
            let mediumItem = data.items[i];
            sliderContent += mediumPost({
                image: mediumItem.thumbnail,
                title: mediumItem.title,
                description: mediumItem.description,
            });
        }
        sliderContentElement.html(sliderContent);
        if(window.innerWidth >= 768){
            if(i <= 2){
                sliderContentElement.addClass("centered")
            }
        }else if(window.innerWidth >= 992){
            if(i <= 3){
                sliderContentElement.addClass("centered")
            }
        }

        /* Slider medium posts */
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

// fill post, return html
function mediumPost({
    image = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
    title = "",
    description = "",
} = {}){
    if(image.indexOf("event=post.clientViewed") !== -1){
        image = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    }
    //description = description.replace(/(<figure>.*?<\/figure>)|(<img.*?>)|<.*?>/, "");

    description = excerpt({
        text: description,
        count: 100,
        ending: "...",
    });


    return `
    <div class="post splide__slide carousel-cell col-12 col-md-6 col-lg-4 ">
        <div class="post-image" style="background-image: url('${image}')"></div>
        <div class="post-title">
            ${title}
        </div>
        <div class="post-description">
            ${description}
        </div>
    </div>
    `;
}

function excerpt({
    text = "",
    count = 0,
    ending = " ..."
} = {}){

    // Strip tags
    let doc = new DOMParser().parseFromString(text, 'text/html');
    text = doc.body.textContent || "";
    console.log("BEFORE", text);

    let max = text.length;
    if(count >= max){
        return text;
    }else{
        do{
            count--;

        }while(count >= 0 && text[count] !== " " && ([".", ",", "!", "?"].includes(text[count-1] || "")));

        console.log("AFTER", text);
        text = text.substr(0, count) + ending;

    }



    return text;
}
