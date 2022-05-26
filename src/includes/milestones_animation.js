
var $ = require( "jquery" );

$(document).ready(function () {
    console.log("jQuery Ready");

    window.width = $(window).width();
    window.height = $(window).height();

    console.log("window_width", window.width);
    console.log("window_height", window.height);

    if(window.width >= 768 ){
        milestones_animation();
    }
});

function milestones_animation() {
    var milestones =  $(".cube-section");
    var milestones_animation_point = milestones.offset().top - (window.height * 0.1);
    var milestones_animated = false;

    $(window).on("scroll.milestones", function (e) {
        console.log(milestones.offset().top, $(window).scrollTop());

        if($(window).scrollTop() > milestones_animation_point){
            milestones_animated = true;
            $(window).off("scroll.milestones");

            $(".cube__item-1").addClass("animated");
            $(".cube__item-3").addClass("animated");

            setTimeout(function () {
                $(".cube__item-2").addClass("animated");
                $(".cube__item-4").addClass("animated");
            }, 500);

            setTimeout(function () {
                $(".cube-center").addClass("animated");
            }, 1000);

            setTimeout(function () {
                $(".cube-top").addClass("animated");
                $(".cube-bottom").addClass("animated");
            }, 1600);
        }
    })
}