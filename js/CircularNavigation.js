(function(){

	var button = document.getElementById('cn-button'),
    wrapper = document.getElementById('cn-wrapper'),
    caption = document.getElementById('caption'),
    harmonyCanvas = document.getElementById('harmony');

    //open and close menu when the button is clicked
	var open = false;
	button.addEventListener('click', handler, false);

	function handler(){
	  if(!open){
	    this.innerHTML = "-";//"Close";
	    classie.add(wrapper, 'opened-nav');
	    classie.add(caption, 'do-opacity');
	    //classie.add(harmonyCanvas, 'do-opacity');
	  }
	  else{
	    this.innerHTML = "+";//"Menu";
		classie.remove(wrapper, 'opened-nav');
		classie.remove(caption, 'do-opacity');
		//classie.remove(harmonyCanvas, 'do-opacity');
	  }
	  open = !open;
	}
	function closeWrapper(){
		classie.remove(wrapper, 'opened-nav');
	}

})();
