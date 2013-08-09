//(function ($) 
    /*Layout Behavior*/
    $('#content').mouseover(function () {
        $('#viewportContent').stop().animate({ width: '21%' }, { queue: false, duration: 600, easing: 'easeOutBounce' });
        $(this).stop().animate({ width: '76%' }, 
        	{ 
        		queue: false, 
        		duration: 600, 
        		easing: 'easeOutBounce',
        		step: function(){
        			sys.renderer.resize();
        		}
        	});
    });

    $('#viewportContent').mouseover(function () {
        $(this).stop().animate({ width: '76%' }, { queue: false, duration: 600, easing: 'easeOutBounce' });
        $('#content').stop().animate({ width: '21%' }, 
        	{ 	queue: false, 
        		duration: 600, 
        		easing: 'easeOutBounce',
        		step: function(){
        			sys.renderer.resize();
        		}
        	});
    });
//})(this.jQuery)