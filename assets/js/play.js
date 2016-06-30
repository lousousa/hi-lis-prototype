var jump_path = [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 6, 6, 6, 6, 6];
var direction, jumping = 0, max_jump = jump_path.length, can_jump = true, walking = 0, max_walk = 8, ctrl,
	lightsTime = 0, lightsOn = false, lightsTime_max = 150, light_color, dark_color, current_level = 0;

$(document).ready(function(){
	$('.play-btn').click(function(){
		$('.main-title').css({'display': 'none'});
		$('.intro').css({'display': 'block'});
	});
	$('.skip-btn').click(function(){
		$('#game').empty();
		build(current_level);
		play();
	});
});

function controller(){ 
    var keys = {
        up: false,
        right: false,
        down: false,
        left: false, 
        isDown: function(keyCode){
            if(keyCode == 37 && !this.left) this.left = true;
            if(keyCode == 38 && !this.up) this.up = true;
            if(keyCode == 39 && !this.right) this.right = true;
            if(keyCode == 40 && !this.down) this.down = true;
        },
        isUp: function(keyCode){
            if(keyCode == 37 && this.left){ this.left = false; walking = 0; }
            if(keyCode == 38 && this.up){ this.up = false; can_jump = false; }
            if(keyCode == 39 && this.right){ this.right = false; walking = 0;  }
            if(keyCode == 40 && this.down) this.down = false;
        }
    } 
    $(document)
    	.keydown(function(e){
	    	if(e.keyCode != 116) e.preventDefault(); 
	        keys.isDown(e.keyCode);
	    })
	    .keyup(function(e){ keys.isUp(e.keyCode); });
 
    return keys; 
}

var game_pause = false;

function play(){ 
    var fps = 1, player = $("#player"), camera = $("#arch"), enemy_k = 1, enemy_k_lim = 0, check_collision_rate = 2;

    var run = setInterval(function(){

    	if(!game_pause){

			enemy_k_lim += enemy_k;
	    	$('#enemies-1').css('top', parseInt($('#enemies-1').css('top')) + enemy_k);
	    	$('#enemies-2').css('top', parseInt($('#enemies-2').css('top')) - enemy_k);
	    	if(enemy_k_lim == 12 || enemy_k_lim == 0) enemy_k *= -1;   	

	      	if(lightsTime == 0 && lightsOn) turnLightsOff();
	      	else if(lightsTime != 0 && !lightsOn) turnLightsOn();
	      	else if(lightsTime > 0) lightsTime--;

	    	player_x = parseInt(player.css('left'));
	    	player_y = parseInt(player.css('bottom'));
	    	camera_x = parseInt(camera.css('left'));
	    	camera_y = parseInt(camera.css('bottom'));

	 		$('#debug')
	 			.empty() 
	 			.append('player_y: ' + player_y + '<br/>')
	 			.append('max: ' + (- player.height() * 3) + '<br/>');  

	 		if(player_y < - player.height() * 3){
	 			game_pause = true;
	 			ctrl.left = ctrl.right = false; 
	 			resetLevel(current_level);
	 		}

	    	var grounded = false;

	    	if($('#player').offset().left < $('#checkpoint').offset().left + $('.cell').width() / 2){
	    		$('#checkpoint').css({
		            "transform": "scaleX(1)",
		            "-ms-transform": "scaleX(1)",
		            "-webkit-transform": "scaleX(1)"
		    	}); 
	    	}else{
	    		$('#checkpoint').css({
		            "transform": "scaleX(-1)",
		            "-ms-transform": "scaleX(-1)",
		            "-webkit-transform": "scaleX(-1)"
		    	});     		
	    	}
	      	for(var i = 0; i <= player.width(); i += player.width() / check_collision_rate){
	      		var k = i > player.width() / 2 ? -1 : 0;
	      		var obj = document.elementFromPoint(
			    	player.offset().left + i + k,
			    	player.offset().top + player.height()
			    );
			    if($(obj).hasClass('lim')){ 
			    	grounded = true;   	
			    	if(!ctrl.up){
			    		can_jump = true;
			    		jumping = 0;
			    	}
			    	break;
			    } else if ($(obj).attr('id') == 'checkpoint'){
			    	clearInterval(run);
			    	levelDone();
			    	break;
			    }
	      	}
	      	for(var i = 0; i <= player.width(); i += player.width() / check_collision_rate){
	      		var k = i > player.width() / 2 ? - 1 : 0;
	      		var obj = document.elementFromPoint(
			    	player.offset().left + i + k,
			    	player.offset().top - 1
			    );
			    if($(obj).hasClass('lim-full')){ 
			    	can_jump = false;
			    	break;
			    } else if ($(obj).hasClass('enemy-collider')){
			    	enemyGot($(obj));
			    	break;
			    }
	      	}
	        if(ctrl.up && can_jump){

	        	if(camera_y > ($('#game').height() - camera.height()) && player_y >= $('#game').height() / 2){
	        		camera.css({"bottom": camera_y - jump_path[jumping]});
	        		for(var i = 1; i <= 3; i++)
	        			eval("$('#bg-" + i + "').css({'bottom': parseInt($('#bg-" + i + "').css('bottom')) + jump_path[jumping]  / " + (6 / i) + "})");
	        		
	        	} else player.css({ 'bottom': player_y + jump_path[jumping] });	            
	            
	            jumping++;
	            if(jumping == max_jump) can_jump = false;
	        } else if (!grounded){
		    	if(jumping > 0){
		    		jumping--;
		    		if(camera_y < 0  && player_y <= $('#game').height() / 2){
		    			camera.css({"bottom": camera_y + jump_path[jumping]});
		        		for(var i = 1; i <= 3; i++)
		        			eval("$('#bg-" + i + "').css({'bottom': parseInt($('#bg-" + i + "').css('bottom')) - jump_path[jumping]  / " + (6 / i) + "})");
		    		} else player.css({ 'bottom': player_y - jump_path[jumping] });
		    	}else{
		    		if(camera_y < 0  && player_y <= $('#game').height() / 2){
		    			camera.css({"bottom": camera_y + 24});
		        		for(var i = 1; i <= 3; i++)
		        			eval("$('#bg-" + i + "').css({'bottom': parseInt($('#bg-" + i + "').css('bottom')) - 24 / " + (6 / i) + "})");
		    		} else player.css({ 'bottom': player_y - 24 });
		    		can_jump = false;
		    	}
	    	}
	    	var right_ok = true, close_light = false;
	    	for(var i = 0; i <= player.height(); i += player.height() / check_collision_rate){
	      		var obj = document.elementFromPoint(
			    	player.offset().left + player.width(),
			    	player.offset().top + i - 1
			    );
			    if($(obj).hasClass('lim')){
			    	right_ok = false;
			    	break;
			    } else if ($(obj).attr('id') == 'checkpoint'){
			    	clearInterval(run);
			    	levelDone();
			    	break;
			    } else if($(obj).hasClass('light') && direction == 1){
			    	lightsTime = lightsTime_max;
			    	close_light = true;
			    	break;
			    } else if($(obj).hasClass('enemy-collider') && direction == 1){
			    	enemyGot($(obj));
			    	break;
			    }
	      	}
	        if(ctrl.right && !game_pause){ 
	        	if(right_ok){       	
		        	if(player_x < $('#game').width() / 2 || camera_x <= $('#game').width() - camera.width()){
			            if(player_x < $('#game').width() - player.width()) player.css({"left": player_x + 6});
		        	} else {
		        		camera.css({"left": camera_x - 6});
		        		deslocateBg($('#bg-1'), -3, 0);
		        		deslocateBg($('#bg-2'), -2, 0);
		        		deslocateBg($('#bg-3'), -1, 0);
		        	}
	       		}
	       		direction = 1;
	        }
	        var left_ok = true;
	    	for(var i = 0; i <= player.height(); i += player.height() / check_collision_rate){
	      		var obj = document.elementFromPoint(
			    	player.offset().left - 1,
			    	player.offset().top + i - 1
			    );
			    if($(obj).hasClass('lim')){ 
			    	left_ok = false; break;
			    } else if ($(obj).attr('id') == 'checkpoint'){
			    	clearInterval(run);
			    	levelDone();
			    	break;
			    } else if ($(obj).hasClass('light') && direction == -1){
			    	lightsTime = lightsTime_max;
			    	close_light = true;
			    	break;
			    } else if ($(obj).hasClass('enemy-collider') && direction == -1){
			    	enemyGot($(obj));
			    	break;
			    }
	      	}
	        if(ctrl.left && !game_pause){        	
	        	if(left_ok){  
		        	if(player_x > $('#game').width() / 2 - player.width() || camera_x >= 0){
			            if(player_x > 0) player.css({ "left": player_x - 6});
			        } else {
			        	camera.css({"left": camera_x + 6});
			        	deslocateBg($('#bg-1'), +3, 0);
			        	deslocateBg($('#bg-2'), +2, 0);
			        	deslocateBg($('#bg-3'), +1, 0);
			        }
			    }
		        direction = -1;
	        }
	        var player_k = lightsOn ? 0 : - $('.cell').height();
	        player_k = close_light ? - $('.cell').height() * 3 : player_k;
	        if((ctrl.left || ctrl.right) && !game_pause){
	        	$('#player').css('background-position', - (walking * $('.cell').width()) + 'px ' + player_k + 'px');
	        	walking++;
	        	if (walking == max_walk) walking = 0;
	        } else if(!game_pause) {
	        	$('#player').css('background-position', '0px ' + player_k + 'px');
	        }
	    	player.css({
	            "transform": "scaleX(" + direction + ")",
	            "-ms-transform": "scaleX(" + direction + ")",
	            "-webkit-transform": "scaleX(" + direction + ")"
	    	}); 
	    	$('#player .box-talk div').css({    		
	            "transform": "scaleX(" + direction + ")",
	            "-ms-transform": "scaleX(" + direction + ")",
	            "-webkit-transform": "scaleX(" + direction + ")"
	    	});
    	}
 
    }, 20);
}

function deslocateBg(obj, x, y){
	var bg_x = parseInt(obj.css('background-position').split(' ')[0]);
	var bg_y = parseInt(obj.css('background-position').split(' ')[1]);
	obj.css({'background-position': (bg_x + x) + 'px ' + (bg_y + y) + 'px'});
}

function enemyGot(collider){
	turnLightsOff();
	$('#player').css({'background-position': '0px -96px'});
	collider.parent().css({'background-position': '-192px -240px'});
	game_pause = true;
	setTimeout(function(){
		resetLevel(current_level);
	}, 750);
}

function build(level_idx){
	ctrl = controller();
	var level = levels[level_idx];
	light_color = level.bg.lcolor;
	dark_color = level.bg.dcolor;
	$('#game')
		.append('<div class="plain" id="arch"></div>')
		.append('<div class="cell" id="player"><div class="box-talk theme-1"><div>HI LIS</div></div></div>');
	$('#arch')
		.append('<div class="plain bg theme-' + level.bg.theme + '" id="bg-3"></div>')
		.append('<div class="plain bg theme-' + level.bg.theme + '" id="bg-2"></div>')
		.append('<div class="plain bg theme-' + level.bg.theme + '" id="bg-1"></div>')
		.append('<div class="plain" id="enemies-1"></div>')
		.append('<div class="plain" id="enemies-2"></div>');
	$('.plain')
		.width(level.arch[0].length * $('.cell').width()) 
		.height(level.arch.length * $('.cell').height());
	$('#player .box-talk').hide();
	for(var i = 0; i < level.arch.length; i++)
		for(var j = 0; j < level.arch[i].length; j++){
			$('#arch').append('<div class="cell" id="cell-' + i + '-' + j + '"></div>');
			var cell = $('#cell-' + i + '-' + j);
			cell.css({'bottom': (level.arch.length - i - 1) * cell.height(), 'left': j * cell.width()});
			if(level.arch[i][j] == 1) cell.addClass('obj platform') .append('<div class="lim lim-top"></div>');
			if(level.arch[i][j] == 2) cell.addClass('obj block') .append('<div class="lim lim-full"></div>');
			if(level.arch[i][j] == 3) cell.addClass('obj ground') .append('<div class="lim lim-top"></div>');
			if(level.arch[i][j] == 4) cell.addClass('obj underground');
		}
	$('#arch')
		.append('<div class="cell" id="checkpoint"></div>');
	$(level.lights).each(function(i, light){
		$('#arch').append('<div class="cell light" id="light-' + i + '"></div>');
		$('#light-' + i).css({
			'left': light.x * $('.cell').width(),
			'bottom': light.y * $('.cell').height()
		});
	});
	$(level.enemies).each(function(i, enemy){
		if(i % 2 == 0) $('#enemies-1').append('<div class="enemy theme-' + level.bg.theme + '" id="enemy-' + i + '"><div class="enemy-collider"></div></div>');
		else $('#enemies-2').append('<div class="enemy theme-' + level.bg.theme + '" id="enemy-' + i + '"><div class="enemy-collider"></div></div>');
		$('#enemy-' + i).css({
			'left': enemy.x * $('.cell').width(),
			'bottom': enemy.y * $('.cell').height()
		});
	});
	$('.cell').addClass('theme-' + level.bg.theme);	
	$('#checkpoint').css({
		'left': level.checkpoint.x * $('.cell').width(),
		'bottom': level.checkpoint.y * $('.cell').height()
	});
	resetLevel(level_idx);
}

function levelDone(){
	turnLightsOff();
	setTimeout(function(){ $('#player .box-talk').show(); }, 250);
	setTimeout(function(){ $('#checkpoint').css({'background-position': '-288px -480px'}); }, 750);
	setTimeout(function(){ $('#checkpoint').remove(); }, 1250);
	setTimeout(function(){ $('#player .box-talk').hide(); $('#player').css({'background-position': '-48px -96px'}); }, 1750);
	setTimeout(function(){ $('#game').empty(); }, 2500);
	setTimeout(function(){    	
		current_level++;
		if(current_level < levels.length){
			build(current_level);
			play();
		}
		else {
			$("#game").empty() .css({'background': 'black'}) .append("<div class='ending-screen'><div class='text'>Thank you for playing.</div></div>");
			$(".ending-screen").css({'display': 'block'});
		}
	}, 2750);	
}

function resetLevel(level_idx){
	var level = levels[level_idx];
	direction = level.player.frontof;
	turnLightsOff();
	lightsTime = 0;
	$('#player').css({
		'left': level.player.x * $('.cell').width(),
		'bottom': level.player.y * $('.cell').height()
	});	
	$('#arch').css({
		'left': level.x * $('.cell').width(),
		'bottom': level.y * $('.cell').width()
	});
	game_pause = false;
	$('#bg-1').css({'background-position': '0px -720px', 'bottom': 0});
	$('#bg-2').css({'background-position': '0px -960px', 'bottom': 0});
	$('#bg-3').css({'background-position': '0px -1200px', 'bottom': 0});
}

function turnLightsOff(){
	$('.obj').css({'background-position': '-432px 0px'});
	$('#game').css({'background': 'linear-gradient(#444, #222)'});
	$('#checkpoint').css({'background-position': '-240px -480px'});
	$('.light').css({'background-position': '-192px -432px'});
	$('.enemy').css({'background-position': '0px -240px'});
	$('.bg').css({'opacity': 0});
	lightsOn = false;
}

function turnLightsOn(){
	$('.platform').css({'background-position': '-96px -384px'});
	$('.block').css({'background-position': '-48px -384px'});
	$('.ground').css({'background-position': '-96px -432px'});
	$('.underground').css({'background-position': '-96px -480px'});
	$('#game').css({'background' : 'linear-gradient(' + light_color + ', ' + dark_color + ')'});
	$('#checkpoint').css({'background-position': '-192px -480px'});
	$('.light').css({'background-position': '-240px -432px'});
	$('.enemy').css({'background-position': '-96px -240px'});
	$('.bg').css({'opacity': 1});
	lightsOn = true;
}

var levels = [
	{
		x: 0,
		y: 0,
		player: {x: 1, y: 1, frontof: 1},
		lights: [
			{x: 4, y: 1},
			{x: 15, y: 10}
		],
		enemies: [],
		arch: [			
			[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
			[2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[2,2,1,0,1,1,1,1,1,1,1,1,1,1,0,0],
			[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,0],
			[0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,0],
			[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
		],
		bg: {lcolor: "#195661", flash: "#89c6d1", dcolor: "#093641", theme: 1},
		checkpoint: {x: 0, y: 9}
	},
	{
		x: 0,
		y: 0,
		player: {x: 1, y: 1, frontof: 1},
		lights: [
			{x: 14, y: 3},
			{x: 25, y: 2},
			{x: 4, y: 1}
		],
		enemies: [
			{x: 8, y: 3},
			{x: 8, y: 6},
			{x: 11, y: 6},
			{x: 20, y: 8}
		],
		arch: [
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0],
			[0,0,0,1,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,0,0,0,0,0],
			[0,0,0,0,2,2,0,0,0,0,0,0,0,1,1,0,0,0,0,2,2,0,0,0,0,2,0,0,0,0,0,1,0],
			[0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,2,0,1,0,0,0,0,0],
			[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,1,0,0,0,0,0,0,0],
			[4,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0],
			[4,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,4,4,4,0,0,3,3,3,3,3,3,3,3,3],
			[3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,0,0,0,4,4,4,0,0,4,4,4,4,4,4,4,4,4]
		],
		//bg: {lcolor: "#14c3ef", flash: "#1ed8e4", dcolor: "#ed145b", theme: 1},
		bg: {lcolor: "#195661", flash: "#89c6d1", dcolor: "#093641", theme: 1},
		checkpoint: {x: 26, y: 8}
	}
];