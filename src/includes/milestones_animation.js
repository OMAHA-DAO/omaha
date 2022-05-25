
var $ = require( "jquery" );

$(document).ready(function () {
    console.log("jQuery Ready");

    var window_width = $(window).width();
    var window_height = $(window).height();

    console.log("window_width", window_width);
    console.log("window_height", window_height);

    var milestones =  $(".milestones");
    $(window).on("scroll", function (e) {
        console.log(milestones.offset().top, $(window).scrollTop());
    })
});