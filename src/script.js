
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
    console.log("[IMPORT]", modules);
});



import "./includes/milestones_animation";

Promise.all([
    import(
        /* webpackChunkName: "rss-to-json" */
        `rss-to-json`
        ),
    import(
        /* webpackChunkName: "splide" */
        `@splidejs/splide`
        ),
]).then(function (modules) {
    console.log("[IMPORT]", modules);

    // Expand modules into variables for more convenient use
    const [
        rssToJson,
        splideModule
    ] = modules;
    window.rssToJson = rssToJson.parse;
    window.Splide = splideModule.default;

    let sliderContentElement = $(".splide__list");

    let p =(async function() {
        let rssConverterUrl = `https://api.rss2json.com/v1/api.json?rss_url=${window.config.medium.feed}`;
        let response = await fetch(rssConverterUrl);
        return await response.json();
    })();
    p.then(function (data) {
        console.log(data);

        let sliderContent = "";
        for(let i=0; i < data.items.length && i < window.config.medium.limit; i++){
            let mediumItem = data.items[i];
            sliderContent += mediumPost({
                image: mediumItem.thumbnail,
                title: mediumItem.title,
                description: mediumItem.description,
            })
        }
        sliderContentElement.html(sliderContent);

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
    description = description.replace(/(<figure>.*?<\/figure>)|(<img.*?>)/, "");
    return `
    <div class="post splide__slide carousel-cell col-12 col-md-6 col-lg-4 ">
        <div class="post-image">
            <img src="${image}">
        </div>
        <div class="post-title">
            ${title}
        </div>
        <div class="post-description">
            ${description}
        </div>
    </div>
    `;
}
