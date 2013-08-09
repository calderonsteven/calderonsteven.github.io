/**
* Provides requestAnimationFrame in a cross browser way.
* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*/

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
            window.setTimeout( callback, 1000 / 60 );
        };
    } )();
}

$(document).ready(function () {
    window.harmony(true);

    $("#harmony").click(function () {
        //reset harmony
        $("#harmony canvas")[0].getContext("2d").clearRect( 0, 0, 
            $("#harmony canvas")[0].width, $("#harmony canvas")[0].height);
    });
});