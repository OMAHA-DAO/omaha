/*
* You must launch those functions in deocument ready and every time after ajax load
*
* in document ready
*
    lazy_load_launch();
    background_is_picture_launch();
*
* */
module.exports = {

    lazy_load_ib_launch: function lazy_load_launch({
        root = null,
        rootMargin = null,  // use window.height/2 + "px 0px " + window.height/2 + "px 0px",
        threshold = null,
    } = {}){
        console.log("[LLIB] Launch");

        let observerOptions = {};
        if(root !== null)       { observerOptions.root = root }
        if(rootMargin !== null) { observerOptions.rootMargin = rootMargin }
        if(threshold !== null)  { observerOptions.threshold = threshold }

        let imageObserver;
        if(typeof window.imageObserver === "undefined"){
            imageObserver = new IntersectionObserver((entries, imgObserver) => {
                console.log("[LLIB] Trigger");
                entries.forEach((entry) => {
                    if(entry.isIntersecting) {
                        console.log("[LLIB] isIntersecting");
                        const elem = entry.target;
                        //lazyImage.src = lazyImage.dataset.src

                        module.exports.ib_single_process(elem);
                        imgObserver.unobserve(elem);
                    }
                })
            }, observerOptions);
            window.imageObserver = imageObserver;
        }else{
            imageObserver = window.imageObserver;
        }


        $(".LazyLoad:not(.Observed)").get().forEach((element) => {
            imageObserver.observe(element);
            console.log("[LLIB] observing");
            $(element).addClass("Observed");
        });

    },

    ib_single_process(elem){
        elem = $(elem);
        let parent = elem.parent();
        let is_background = false;
        let is_picture = elem.is("picture");

        if(parent.hasClass("Background_Is_Picture")){
            is_background = true;
        }

        // -- Lazy --
        elem.removeClass("LazyLoad");

        if (elem.is("img")) {
            var imgdata = elem.data("srcset");
            if (typeof imgdata !== "undefined") {
                elem.attr("srcset", imgdata);
            } else {
                imgdata = elem.data("src");
                elem.attr("src", imgdata);
            }
        } else if (elem.is("picture")) {
            // for source in picture
            var sources = elem.children("source");
            sources.each(function() {
                var source = $(this);
                var imgdata = source.data("srcset");
                source.attr("srcset", imgdata);
            });

            // For img in picture
            // var imgs = elem.children("img");
            // imgs.each(function() {
            //     var img = $(this);
            //     var imgdata = img.data("srcset");
            //     if (typeof imgdata !== "undefined") {
            //         img.attr("srcset", imgdata);
            //     } else {
            //         imgdata = img.data("src");
            //         img.attr("src", imgdata);
            //     }
            // });


            if (elem.hasClass("Background_Is_Picture")) {
                background_is_picture_launch();
            }
        } else {
            // Background
            var imgdata = elem.data("src");
            elem.css("background-image", "url(" + imgdata + ")");
        }
        elem.addClass("LazyLoaded");
        // -- Lazy --

        // -- Background --
        if(is_background){
            if(is_picture){
                var img = elem.children("img");
                var img_src = img.prop("currentSrc");

                // If currentSrc not supported
                if (typeof img_src === "undefined") {
                    img_src = img[0].src;
                }

                // console.log('IMAGE_PLACEHOLDER1');
                // console.log(img_src);

                if (img_src === "" || img_src.includes("transparent_placeholder")) {
                    img.on("load", function() {
                        let img_src = img.prop("currentSrc");
                        if (typeof img_src === "undefined") {
                            img_src = img[0].src;
                        }

                        if (!img_src.includes("transparent_placeholder")) {
                            parent.css("background-image", "url('" + img_src + "')");
                            parent.addClass("Loaded");
                        } else {
                            relaunch_needed = true;
                        }

                        // console.log('IMAGE_PLACEHOLDER2');
                        // console.log(img_src);
                    });
                } else {
                    if (!img_src.includes("transparent_placeholder")) {
                        parent.css("background-image", "url('" + img_src + "')");
                        parent.addClass("Loaded");
                    } else {
                        relaunch_needed = true;
                    }
                }
            }
        }
        // -- Background END --
    },

	background_is_picture_launch: function background_is_picture_launch(){
        console.log('background_is_picture_launch');
		var relaunch_needed = false;
		$('.Background_Is_Picture:not(.Loaded)').each(function () {
			//console.log("BG_PICT");
			var bg_target = $(this);
			//console.log(bg_target);
			var picture = bg_target.children(':first');
			//console.log(picture);
			if(picture.is('picture') === true){
				//console.log(picture.children('img'));
				var img = picture.children('img');
				var img_src = img.prop("currentSrc");

				// If currentSrc not supported
				if(typeof img_src === 'undefined'){
					img_src = img[0].src;
				}

                // console.log('IMAGE_PLACEHOLDER1');
                // console.log(img_src);

				if(img_src === '' || img_src.includes('transparent_placeholder')){
					img.on('load', function () {
						var img_src = img.prop("currentSrc");
						if(typeof img_src === 'undefined'){
							img_src = img[0].src;
						}

                        if(!img_src.includes('transparent_placeholder')){
                            bg_target.css('background-image', 'url(\''+img_src+'\')');
                            bg_target.addClass('Loaded');
						}else{
                            relaunch_needed = true;
						}

                        // console.log('IMAGE_PLACEHOLDER2');
                        // console.log(img_src);


					});

				}else{

                    if(!img_src.includes('transparent_placeholder')){
                        bg_target.css('background-image', 'url(\''+img_src+'\')');
                        bg_target.addClass('Loaded');
                    }else{
                        relaunch_needed = true;
                    }

				}
			}
		});
		console.log('background_is_picture_launch relauntch needed', relaunch_needed);
		if(relaunch_needed){
            //this.lazy_load_launch();
            //this.background_is_picture_launch();

		}
	},

}


