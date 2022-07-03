
var $ = require( "jquery" );

$(document).ready(function () {
    //console.log("jQuery Ready");

    window.width = $(window).width();
    window.height = $(window).height();

    //console.log("window_width", window.width);
    //console.log("window_height", window.height);

    milestones_animation();
});

function milestones_animation() {
    var milestones =  $(".cube-section");
    var milestones_animation_point;

    var milestones_animated = false;
    if(window.width >= 1200){
        milestones_animation_point = milestones.offset().top - (window.height * 0.3);
    }else{
        milestones_animation_point = milestones.offset().top - (window.height * 0.5);
    }


    $(window).on("scroll.milestones", function (e) {

        if($(window).scrollTop() > milestones_animation_point){
            milestones_animated = true;
            $(window).off("scroll.milestones");

            if(window.width >= 768 ){
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

                let time = 500;
                setTimeout(function () {
                    $(".cube__item-1").addClass("highlight");
                }, time);
                setTimeout(function () {
                    $(".cube__item-3").addClass("highlight");
                }, time += 800);
                setTimeout(function () {
                    $(".cube__item-2").addClass("highlight");
                }, time += 800);
                setTimeout(function () {
                    $(".cube__item-4").addClass("highlight");
                }, time += 800);
            }else{
                setTimeout(function () {
                    $(".cube__item-1").addClass("highlight");
                }, 0);
                setTimeout(function () {
                    $(".cube__item-3").addClass("highlight");
                }, 800);
                setTimeout(function () {
                    $(".cube__item-2").addClass("highlight");
                }, 1600);
                setTimeout(function () {
                    $(".cube__item-4").addClass("highlight");
                }, 2400);
            }
        }
    })
}