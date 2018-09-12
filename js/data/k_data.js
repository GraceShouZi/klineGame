var circulation = 205188200;
var klineData = [];
var klineDara111 = [
[20160324,18.11,18.11,18.11,17.68,17.72,274483,488310000],
[20160325,17.72,17.72,17.87,17.68,17.74,136192,241970000],
[20160328,17.74,17.78,18,17.37,17.45,245217,433450000],
[20160329,17.45,17.53,17.66,17.37,17.45,191512,335810000],
[20160330,17.45,17.65,17.95,17.65,17.87,355621,634180000],
[20160331,17.87,17.98,18.08,17.72,17.93,237621,425380000],
[20160401,17.93,17.98,18.25,17.61,18.18,357905,643980000],
[20160405,18.18,17.94,18.29,17.76,18.17,426223,768010000],
[20160406,18.17,18.03,18.14,17.87,17.96,234287,421230000],
[20160407,17.96,17.95,18,17.63,17.69,290477,516130000],
[20160408,17.69,17.56,17.76,17.53,17.6,171322,301700000],
[20160411,17.6,17.6,17.82,17.55,17.67,241176,426860000],
[20160412,17.67,17.69,17.7,17.53,17.62,141008,248000000],
[20160413,17.62,17.73,17.99,17.69,17.74,351897,627670000],
[20160414,17.74,17.9,18.01,17.75,17.8,157962,281980000],
[20160415,17.8,17.95,18.06,17.8,17.89,347735,623840000],
[20160418,17.89,17.75,18.03,17.66,17.81,280841,501790000],
[20160419,17.81,17.95,17.98,17.78,17.9,272464,487100000],
[20160420,17.9,17.89,17.99,17.31,17.96,466146,825440000],
[20160421,17.96,17.82,18.35,17.75,18.12,482129,872380000],
[20160422,18.12,18,18.36,17.94,18.24,281782,513190000],
[20160425,18.24,18.15,18.16,17.82,17.88,242944,435470000],
[20160426,17.88,17.87,18.08,17.75,17.92,157394,281500000],
[20160427,17.92,17.97,17.97,17.8,17.86,138389,247620000],
[20160428,17.86,17.93,18.1,17.83,17.9,157284,282200000],
[20160429,17.9,17.83,17.94,17.75,17.83,230659,412460000],
[20160503,17.83,17.95,18.24,17.83,18.12,277767,501830000],
[20160504,18.12,18.06,18.23,18.02,18.08,231190,418590000],
[20160505,18.08,18.06,18.12,17.98,18.06,149366,269580000],
[20160506,18.06,18.07,18.1,17.71,17.73,234068,418450000]];
var code = "SH600000";
var precision = 2;
var dataArr = klineData;
var i = 0;
var flag01 = null;
var flag02 = null;
var start = false;
var intf = setInterval(function(){
	if(start!=true){ return false;}
	 if (i < klineDara111.length) {
		klineData.push(klineDara111[i]);
		painter = null;
		i++;
		var zsclose = klineDara111[i - 1][1];
		var jrclose = klineDara111[i - 1][5];
		drawKL();
		if (i > 19) {
			$(".bar_bg").css({
				"transform": "translateX(-" + (i - 19) * bar_width + "px)"
			});
		};
	
		if (i == 1) {
			$(".chartBuy01").removeClass("cBpointer");
		};	
		if (flag01) {
			var bb = 'b' + b;
			$(".bar_bg i").eq(i - 1).addClass(bb);
			if (jrclose > zsclose) {
				$(".bar_bg").find('.' + bb).removeClass('barGreenbg').addClass("barRedbg");
			} else {
				$(".bar_bg").find('.' + bb).removeClass('barRedbg').addClass("barGreenbg");
			}
		};
		if (flag02) {
			$(".bar_bg i").eq(i - 1).removeClass('barGreenbg barRedbg');
		};
		$(".chartIncome").html("");
		$(".chartIncome").append('<i>' + i + '%</i>');
	} else {
		clearInterval(intf);
		$(".black_bg").show();
		$(".gameOver").show();
		$(".chartBuy span").addClass("cBpointer");
	}
},2000);
var b=0;	
$(".chartBuy01").click(function(){
	var zsclose = klineDara111[i][1];
    var jrclose = klineDara111[i][5];	
	b++;
	flag01 = true;
	flag02 = null;
	$(".chartBuy02").removeClass("cBpointer");
	$(this).addClass("cBpointer");
});
$(".chartBuy02").click(function(){
	flag02 = true;
	if(flag01){
		flag01 = null;
	};
	$(".chartBuy01").removeClass("cBpointer");
	$(this).addClass("cBpointer");
});
var bar_width = winWidth/20;
$(".bar_bg").css({"width":klineDara111.length*bar_width});
for(var j=0;j<klineDara111.length;j++){$(".bar_bg").append("<i></i>");}
$(".bar_bg i").css({"width":bar_width});
/**倒计时**/
var timer =(klineDara111.length*2)+1;
function Countdown() {
    if (timer >= 1) {
        timer -= 1;
        setTimeout(function() {
            Countdown();
			$(".chartTips_times").html(timer);
        }, 1000);
    }
}
$(window).resize(function () {
    winWidth = ($(window).width() > 768) ? 768 : $(window).width();
    var fontSize = parseFloat($("html").css("font-size"));
	var winHeight =fontSize*19;
    $('.kline_main').css('height', winHeight);
    $('.kline_canvas').css('height', winHeight);
    $('#canvas').attr('width', winWidth * PIXEL_RATIO);
    $('#canvas').attr('height', winHeight * PIXEL_RATIO);
    $('#canvas').css('width', winWidth);
    $('#canvas').css('height', winHeight);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, winWidth, winHeight);
    ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
    painter = null;
    drawKL();
	bar_width = winWidth/20;
	$(".bar_bg").css({"width":klineDara111.length*bar_width});
	$(".bar_bg i").css({"width":bar_width,"height":winHeight});
});

$(function(){
	//开始游戏
	$(".explain_start").click(function(){
		start = true;
		$(".explain").hide();
		$(".earnings").show();	
		Countdown();
	});
	//关闭
	$(".gameOver_close").click(function(){
		$(this).parents(".gameOver").hide();
		$(".black_bg").hide();
	});	
	//分享
	$(".gameOver_share").click(function(){
		$(".gameOver").hide();
		$(".share").show();
	});
	//再玩一次
	$(".gameOver_again").click(function(){
		$(".gameOver").hide();
		$(".black_bg").hide();
		$(".explain").show();
		$(".earnings").hide();
	});		
	$(".black_bg").click(function(){
		$(this).hide();
		$(".gameOver").hide();
		$(".share").hide();
	});		
});


