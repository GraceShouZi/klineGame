//重新加载页面时清空localStorage
function convertDate(val, withWeek) {
    var year = Math.ceil(val / 10000) - 1;
    var day = val % 100;
    var month = (Math.ceil(val / 100) - 1) % 100;
    var d = new Date();
    d.setYear(year);
    d.setMonth(month - 1);
    d.setDate(day);
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    if (withWeek) {
        var weekNames = ['日', '一', '二', '三', '四', '五', '六'];
        return year + '-' + month + '-' + day + '(星期' + weekNames[d.getDay()] + ')';
    }
    else {
        return year + '-' + month + '-' + day;
    }
}
function calcMAPrices(ks, startIndex, count, daysCn) {
    var result = new Array();
    for (var i = startIndex; i < startIndex + count; i++) {
        var startCalcIndex = i - daysCn + 1;
        if (startCalcIndex < 0) {
            result.push(false);
            continue;
        }
        var sum = 0;
        for (var k = startCalcIndex; k <= i; k++) {
            sum += ks[k].close;
        }
        var val = sum / daysCn;
        result.push(val);
    }
    return result;
}

var timer = {
    start:function(step){this.startTime = new Date();this.stepName = step;},
    stop:function(){
        var timeSpan = new Date().getTime() - this.startTime.getTime();
        setDebugMsg(this.stepName + '耗时' + timeSpan+'ms');
    }
};

function kLine(options) {
    this.options = options;
    this.dataRanges = null;
}

kLine.prototype = {
    initialize: function (painter) {
        painter.klOptions = this.options;
        painter.implement = this;
    },
    start: function () {
        //timer.start('start');
        var canvas = this.canvas;
        var ctx = this.ctx;
        this.painting = true;
        var options = this.klOptions;
        var clearPart = { width: canvas.width, height: options.priceLine.region.y - 3 };
        ctx.clearRect(0, 0, clearPart.width, clearPart.height);

        ctx.save();  //保存图像
        window.riseColor = options.riseColor;
        window.fallColor = options.fallColor;
        window.normalColor = options.normalColor;
        if (options.backgroundColor && !this.drawnBackground) {
            ctx.beginPath();
            ctx.fillStyle = options.backgroundColor;
            ctx.rect(0, 0, clearPart.width, clearPart.height);
            ctx.fill(); //绘制内容
            //ctx.closePath();
            this.drawnBackground = true;
        }
        ctx.translate(options.region.x, options.region.y);
        ctx.strokeStyle = options.borderColor;
        ctx.beginPath();
        ctx.rect(0, 0, options.region.width, options.region.height);
        ctx.stroke(); //绘制边框
        //画水平底纹线
        var spaceHeight = options.region.height / (options.horizontalLineCount + 1);
        for (var i = 1; i <= options.horizontalLineCount; i++) {
            var y = spaceHeight * i;
            if (y * 10 % 10 == 0) y += .5;
            this.drawHLine(options.splitLineColor, 0, y, options.region.width, 1, options.lineStyle);
        }
        //画垂直底纹线
        var spaceWidth = options.region.width / (options.verticalLineCount + 1);
        for (var i = 1; i <= options.verticalLineCount; i++) {
            var w = spaceWidth * i;
            if (w * 10 % 10 == 0) w += .5;
            this.drawVLine(options.splitLineColor, w, 0, options.region.height, 1, options.lineStyle);
        }
        //timer.stop();
    },
    end: function () {
        this.ctx.restore();
        var me = this;
        var options = me.klOptions;
        var region = options.region;
        var volumeRegion = options.volume.region;

        function getIndex(x) {
        	var me = painter;
            x -= region.x;
            var index = Math.ceil(x / (me.klOptions.spaceWidth + me.klOptions.barWidth)) - 1;
            var count = me.toIndex - me.startIndex + 1;
            if (index >= count) index = count - 1;
            return index;
        }
        function getX(x) {
        	var me = painter;
            var index = getIndex(x);
            return region.x + me.klOptions.spaceWidth * (index + 1) + me.klOptions.barWidth * index + me.klOptions.lineWidth * .5;
        }
        function getY(x) {
        	var me = painter;
        	var index = getIndex(x);
        	if (me.filteredData[index]) {
        		return region.height/(me.high-me.low)*(me.high-me.filteredData[index].close)+region.y;
        	}
        }
        function getPriceColor(ki, price) {
            if (price > ki.preClose) {
                return riseColor;
            } else if (price < ki.preClose) {
                return fallColor;
            } else {
                return normalColor;
            }
        }
    },
    paintItems: function () {
        var options = this.klOptions;
        var region = options.region;
        var maxDataLength = this.data.ks.length;
        var needCalcSpaceAndBarWidth = true;
        if (this.dataRanges == null) {
            //计算dataRanges
            var dataCount = Math.ceil(region.width / (options.spaceWidth + options.barWidth))-1;
            if (dataCount > maxDataLength) dataCount = maxDataLength;

            this.dataRanges = {
                start: 100 * (this.data.ks.length - dataCount) / this.data.ks.length,
                to: 100
            };
            needCalcSpaceAndBarWidth = false;
        };
        var dataRanges = this.dataRanges;
        var startIndex = Math.ceil(dataRanges.start / 100 * maxDataLength);
        var toIndex = Math.ceil(dataRanges.to / 100 * maxDataLength) + 1;
        if (toIndex == maxDataLength) toIndex = maxDataLength - 1;
        this.startIndex = startIndex;
        this.toIndex = toIndex;
        var itemsCount = toIndex - startIndex + 1;
        if (needCalcSpaceAndBarWidth) {
            //重新计算spaceWidth和barWidth属性
            function isOptionsOK() { return (options.spaceWidth + options.barWidth) * itemsCount <= region.width; }
            var spaceWidth, barWidth;
            if (isOptionsOK()) {
                //柱足够细了
                spaceWidth = 1;
                barWidth = (region.width - spaceWidth * itemsCount) / itemsCount;
                if (barWidth > 4) {
                    spaceWidth = 2;
                    barWidth = ((region.width - spaceWidth * itemsCount) / itemsCount);
                }
            } else {
                spaceWidth = 1;
                barWidth = (region.width - spaceWidth * itemsCount) / itemsCount;
                if (barWidth <= 2) {
                    spaceWidth = 0;
                    barWidth = (region.width - spaceWidth * itemsCount) / itemsCount;
                } else if (barWidth > 4) {
                    spaceWidth = 2;
                    barWidth = ((region.width - spaceWidth * itemsCount) / itemsCount);
                }
            }

            options.barWidth = barWidth;
            options.spaceWidth = spaceWidth;
        }

        var filteredData = [];
        for (var i = startIndex; i <= toIndex && i < maxDataLength; i++) {
            filteredData.push(this.data.ks[i]);
        }
        var high, low;
        filteredData.each(function (val, a, i) {
            if (i == 0) { high = val.high; low = val.low; }
            else { high = Math.max(val.high, high); low = Math.min(low, val.low); }
        });

        this.high = high;
        this.low = low;
        var ctx = this.ctx;
        var me = this;
        //timer.start('paintItems:移动均线');
        //画移动平均线
        this.implement.paintMAs.call(this, filteredData, getY);
		
        //timer.stop();
        //timer.start('paintItems:画柱');      
        function getY(price) { return (me.high - price) * region.height / (me.high - me.low); }
        function getCandleLineX(i) { var result = i * (options.spaceWidth + options.barWidth) + (options.spaceWidth + options.barWidth) * .5; if (result * 10 % 10 == 0) result += .5; return result; }

        var currentX = 0;
        var needCandleRect = options.barWidth > 1.5;
        var drawCandle = function (ki, a, i) {
            var isRise = ki.close > ki.open;
            var color = isRise ? riseColor : fallColor;

            var lineX = getCandleLineX(i);
            if (currentX == 0) currentX = lineX;
            else {
                if (lineX - currentX < 1) return;
            }
            currentX = lineX;
            var topY = getY(ki.high);
            var bottomY = getY(ki.low);
            if (needCandleRect) {
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                var candleY, candleHeight;
                if (isRise) {
                    candleY = getY(ki.close);
                    candleHeight = getY(ki.open) - candleY;
                } else {
                    candleY = getY(ki.open);
                    candleHeight = getY(ki.close) - candleY;
                }
                //画线
                ctx.beginPath();
                ctx.moveTo(lineX, topY);
                ctx.lineTo(lineX, bottomY);
                ctx.stroke();

                var candleX = lineX - options.barWidth / 2;
                ctx.beginPath();
                ctx.fillRect(candleX, candleY, options.barWidth, candleHeight);
            } else {
                ctx.strokeStyle = color;
                //画线
                ctx.beginPath();
                ctx.moveTo(lineX, topY);
                ctx.lineTo(lineX, bottomY);
                ctx.stroke();
            }
        };
        //画蜡烛
        filteredData.each(drawCandle);
        this.filteredData = filteredData;      
        //timer.stop();
        //timer.start('paintItems:纵轴');
        var yAxisOptions = options.yAxis;
        yAxisOptions.region = yAxisOptions.region || { x: 0 - region.x, y: 0 - 3, height: region.height, width: region.x - 3 };
    },
    
    paintMAs: function (filteredData, funcGetY) {
        var ctx = this.ctx;
        var options = this.klOptions;
        var MAs = options.MAs;
        var me = this;
        MAs.each(function (val, arr, index) {
            var MA = calcMAPrices(me.data.ks, me.startIndex, filteredData.length, val.daysCount);
            val.values = MA;
            MA.each(function (val, arr, i) {
                if (val) {
                    me.high = Math.max(me.high, val);
                    me.low = Math.min(me.low, val);
                }
            });
        });

        MAs.each(function (val, arr, index) {
            var MA = val.values;
            ctx.strokeStyle = val.color;
            ctx.beginPath();
            var currentX = 0;
            MA.each(function (val, arr, i) {
                var x = i * (options.spaceWidth + options.barWidth) + (options.spaceWidth + options.barWidth) * .5;
                if (!val) return;
                var y = funcGetY(val);
                if (y && i==0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        });  
    },
    paintVolume: function (filteredData) { 
        var ctx = this.ctx;   
        var options = this.klOptions;
        //画量线
        var volumeOptions = options.volume;
        var volumeRegion = volumeOptions.region;
        ctx.restore();
        ctx.save();
        ctx.translate(volumeRegion.x, volumeRegion.y);
        ctx.globalAlpha = 1;  
        
        //画水平底纹线
        var spaceHeight = volumeRegion.height / (volumeOptions.horizontalLineCount + 1);
        for (var i = 1; i <= volumeOptions.horizontalLineCount; i++) {
            var y = spaceHeight * i;
            if (y * 10 % 10 == 0) y += .5;
            this.drawHLine(options.splitLineColor, 0, y, options.region.width, 1, options.lineStyle);
        }
        //画垂直底纹线
        var spaceWidth = options.region.width / (options.verticalLineCount + 1);
        for (var i = 1; i <= options.verticalLineCount; i++) {
            var w = spaceWidth * i;
            if (w * 10 % 10 == 0) w += .5;
            this.drawVLine(options.splitLineColor, w, 0, volumeRegion.height, 1, options.lineStyle);
        }

        ctx.strokeStyle = options.borderColor;
        ctx.beginPath();
        ctx.rect(0, 0, volumeRegion.width, volumeRegion.height);
        ctx.stroke();
        //drawLines(ctx, [{ direction: 'H', position: .50, color: 'lightgray'}]);
        var maxVolume = 0;

        filteredData.each(function (val, arr, i) {
            maxVolume = Math.max(maxVolume, val.volume);
        });
        maxVolume *= 1.0;
        function getVolumeY(v) { return volumeRegion.height - volumeRegion.height / maxVolume * v; }
        function getVolumeX(i) { return i * (options.spaceWidth + options.barWidth) + (options.spaceWidth) * .5; }
        ctx.globalAlpha = 1;
        filteredData.each(function (val, arr, i) {
            var x = getVolumeX(i);
            var y = getVolumeY(val.volume);
            ctx.beginPath();
            ctx.rect(x, y, options.barWidth, volumeRegion.height / maxVolume * val.volume);
            ctx.fillStyle = val.close > val.open ? riseColor : fallColor;
            ctx.fill();
        });
        //画y轴
        var volumeLevel;
        var volumeUnit;
        if (maxVolume < 10000 * 10000) {
            volumeLevel = 10000;
            volumeUnit = '万';
        }
        else {
            volumeLevel = 10000 * 10000;
            volumeUnit = '亿';
        }
        var volumeScalers = [];
        volumeScalers.push((maxVolume / volumeLevel).toFixed(2));
        volumeScalers.push((maxVolume / 2 / volumeLevel).toFixed(2));
        volumeScalers.push(volumeUnit);
        var volumeScalerOptions = volumeOptions.yAxis;
        volumeScalerOptions.region = volumeScalerOptions.region || { x: 0 - volumeRegion.x, y: -3, width: volumeRegion.x - 3, height: volumeRegion.height };
        var volumeScalerImp = new yAxis(volumeScalerOptions);
        var volumeScalerPainter = new Painter(this.canvas.id, volumeScalerImp, volumeScalers);
        volumeScalerPainter.paint();
        ctx.restore();
        ctx.save();
    }
};

var painter;// = new Painter('canvas', kl, data);

function getKLData() {
    var result = {};
    var ks = [];
    for (var i = 0; i < klineData.length; i++) {
        var rawData = klineData[i];
        var item = {
            quoteTime: rawData[0],
            preClose: rawData[1],
            open: rawData[2],
            high: rawData[3],
            low: rawData[4],
            close: rawData[5],
            volume: rawData[6],
            amount: rawData[7]
        };
        if (ks.length == 0) {
            result.low = item.low;
            result.high = item.high;
        } else {
            result.high = Math.max(result.high, item.high);
            result.low = Math.min(result.low, item.low);
        }
        ks.push(item);
    }
    result.ks = ks;
    return result;
}
function drawKL(ranges) { 
    var kOptions = {
        backgroundColor:'transparent',
        riseColor: 'red',
        fallColor: 'green',
        normalColor: 'black',
        //主图区域的边距
        chartMargin:{left:0,top:50,right:0},
        region: { x: 0, y: 50, width: winWidth, height: winHeight-100},
        barWidth: winWidth/40, spaceWidth: winWidth/40, horizontalLineCount: 0, verticalLineCount: 0, lineStyle: 'solid', borderColor: 'transparent', splitLineColor: 'transparent', lineWidth: 0,
        MAs: [
            { color: 'rgb(255,70,251)', daysCount: 5 },
            { color: 'rgb(227,150,34)', daysCount: 10 },
            { color: '#09f', daysCount: 20 },
            { color: 'rgb(53,71,107)', daysCount: 30 }
            ],
        yAxis: {},
        xAxis: {},
        volume: {
        },
        priceLine: {
            region:{ x: 0, y: winHeight, height: 0, width: winWidth},
            verticalLineCount: 7,
            horizontalLineCount: 1, lineStyle: 'solid', borderColor: 'transparent', splitLineColor: 'transparent',fillColor:'transparent',alpha:.5,
            yAxis: {
                font: '11px Arial', // region: { },
                color: 'black',
                align: 'right',
                fontHeight: 8,
                textBaseline: 'top'
            }
        },
        controller:{}
    };
    if(!painter){            
        var canvas = $id('canvas');
        var kl = new kLine(kOptions);
        var data = getKLData();
        painter = new Painter('canvas', kl, data);
    }
    painter.dataRanges = ranges;
    painter.paint();
}