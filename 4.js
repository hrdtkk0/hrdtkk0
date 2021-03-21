$( "document" ).ready(function(){
	
	accvv = '';
	lastaccvv = '';
	vv = '';
	ogr = 0;
	
	function randomInteger(min, max) {
	// случайное число от min до (max+1)
	let rand = min + Math.random() * (max + 1 - min);
	return Math.floor(rand);
}
	
	var sound = new Howl({
	src: ['acer.mp3']
  	});
	
	$(document).mousemove(function(e){
	})

	function f() {
		sound.play();
		ii++;
		if (ii < hmt) {
    setTimeout(f, 150+(randomInteger(1,5)*100));
  }}
	
	
	$('.vv').mousedown(function(){
		ii = 0;
		hmt = 10000;
		f();
		lastaccvv=accvv;
		unactive();
		accvv = $(this).attr("id");
		accvv = '#'+accvv;
		active();
		if(lastaccvv!=accvv){
			vv=$(accvv).text();
		}
	})
	
	
	//$('#test').text(accvv);
	
	function active() {
		$(accvv).css('background-color','#4FEE80');
		}
		
	function unactive() {
		$(accvv).css('background-color','#F6F6F9');
		}
		
		
	$(document).keydown(function(eventObject){

	if((accvv=='#n')||(accvv=='#m')){
		ogr=2;
	}
	
	butcode=eventObject.which;

	vvod();
	
	$(accvv).text(vv);
	}
	)
	
	function vvod(){
		if(vv.length<ogr){
		switch(butcode){
			case 49:{
				vv=vv+'1';
			break;
			}
			case 50:{
				vv=vv+'2';
				
			break;
			}
			case 51:{
				vv=vv+'3';
				
			break;
			}
			case 52:{
				vv=vv+'4';
				
			break;
			}
			case 53:{
				vv=vv+'5';
			}	
			break;
			case 54:{
				vv=vv+'6';
				
			break;
			}
			case 55:{
				vv=vv+'7';
				
			break;
			}
			case 56:{
				vv=vv+'8';
				
			break;
			}
			case 57:{
				vv=vv+'9';
				
			break;
			}
			case 48:{
				vv=vv+'0';
				
			break;
			}
			default:
			}
		}

		if(butcode==8){
			vv=vv.slice(0 , vv.length-1);
		}
			
	}

})
