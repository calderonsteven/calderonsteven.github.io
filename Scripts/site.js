(function ($) {
    /*Layout Behavior*/
    $('#content').mouseover(function () {
        $('#viewportContent').stop().animate({ width: '21%' }, { queue: false, duration: 600, easing: 'easeOutBounce' });
        $(this).stop().animate({ width: '76%' }, { queue: false, duration: 600, easing: 'easeOutBounce' });
    });

    $('#viewportContent').mouseover(function () {
        $(this).stop().animate({ width: '76%' }, { queue: false, duration: 600, easing: 'easeOutBounce' });
        $('#content').stop().animate({ width: '21%' }, { queue: false, duration: 600, easing: 'easeOutBounce' });
    });
})(this.jQuery)