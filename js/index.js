//定义数据
var map_data;
var weibo_data = new Array(366);
var weibo_like_data = new Array(366);
var weibo_comment_data = new Array(366);
var weibo_transfer_data = new Array(366);
var key_word_data;
var fog_ = fog;

function search(){
    var search = document.getElementById('search');
    $("#search").animate({marginTop:"0px",marginBottom:"0px"});
}

function adjuse_time_range(start, end){
    var start_index;
    var end_index;
    for(var i = 0; i < fog.length; i++){
        var pubtime = fog[i].pubtime;
        if(pubtime.indexOf(start) >= 0){
            start_index = i;
            break;
        }
    }
    for(var i = 0; i < fog.length; i++){
        var pubtime = fog[fog.length - 1 - i].pubtime;
        if(pubtime.indexOf(end) >= 0){
            end_index = fog.length - 1 - i;
            break;
        }
    }
    fog_ = fog.slice(start_index,end_index);
    map_data = fliter_map_data(fog_);
    key_word_data = fliter_key_word_data(fog_);

    set_map_option(map_data);
    key_word.setOption({
        series : [ 
            {  
                data : key_word_data
            }
        ]
    });
}

//初始化折线图数据
for(var i = 0; i < 366; i++){
    weibo_data[i] = 0;
    weibo_like_data[i] = 0;
    weibo_comment_data[i] = 0;
    weibo_transfer_data[i] = 0;
}

//生成地图数据
map_data = fliter_map_data(fog_);
function fliter_map_data(data){
    var res = [];
    data.forEach(function(element) {
        var isIn = user_city_in_array(element,res);
        if(isIn){
            res.forEach(function(item){
                if(item.name === element.user_city){
                    item.value++;
                }
            });
        } else {
            res.push({
                name: element.user_city,
                value: 1
            });
        }
    }, this);
    return res;
}
function user_city_in_array(ele, res){
    var isIn = false;
    res.forEach(function(element) {
        if(element.name == ele.user_city) {
            isIn = true;
        }
    }, this);
    return isIn;
}

//生成词云数据
key_word_data = fliter_key_word_data(fog_);
function fliter_key_word_data(data){
    var res = [];
    data.forEach(function(element) {
        var isIn = user_name_in_array(element,res);
        if(isIn){
            res.forEach(function(item){
                if(item.name == element.user_name){
                    item.value++;
                }
            });
        } else {
            res.push({
                name: element.user_name,
                value: 1
            });
        }
    }, this);
    var rank =  res.sort(function (a, b) {
                return b.value - a.value;});
    var top = rank.slice(0,20);
    return top;
}
function user_name_in_array(ele, res){
    var isIn = false;
    res.forEach(function(element) {
        if(element.name == ele.user_name) {
            isIn = true;
        }
    }, this);
    return isIn;
}

//生成折线图数据
fliter_weibo_data(fog);
function fliter_weibo_data(data){
    var base = +new Date(2016, 0, 0);
    var oneDay = 24 * 3600 * 1000;
    var date = [];
    for (var i = 1; i <= 366; i++) {
        var now = new Date(base += oneDay);
        var month = now.getMonth()+1;
        if(month < 10){
            month = "0" + month;
        }
        var day = now.getDate();
        if(day < 10){
            day = "0" + day;
        }
        date.push([now.getFullYear(), month , day].join('-'));
    }
    var cur = date[0];
    var index = 0;
    for(var i = 0; i < data.length; i++){
        var pubtime = data[i].pubtime;
        if(pubtime.indexOf(cur) >= 0){
            weibo_data[index]++;
            weibo_like_data[index] += data[i].likes;
            weibo_comment_data[index] += data[i].comments;
            weibo_transfer_data[index] += data[i].transfers;
        } else {
            index++;
            cur = date[index];
        }
    }
    for(var i = 0; i < 366; i++) {
        weibo_like_data[i] /= fog.length;
        weibo_comment_data[i] /= fog.length;
        weibo_transfer_data[i] /= fog.length;
    }
}
function nextDay(base){
    var oneDay = 24 * 3600 * 1000;
    var next = new Date(base += oneDay);
    var month = next.getMonth()+1;
    if(month < 10){
        month = "0" + month;
    }
    var day = next.getDate();
    if(day < 10){
        day = "0" + day;
    }
    return ([next.getFullYear(),month, day].join('-'));
}

//初始化地图
var map = echarts.init(document.getElementById('map'));
var geoCoordMap;                           //defined from map.js
var convertData = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value)
            });
        }
    }
    return res;
};
set_map_option(map_data);
function set_map_option(map_data){
    option = {
        backgroundColor: '#404a59',
        tooltip : {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            y: 'bottom',
            x:'right',
            data:['话题热度'],
            textStyle: {
                color: '#fff'
            }
        },
        geo: {
            map: 'china',
            label: {
                emphasis: {
                    show: false
                }
            },
            roam: true,
            itemStyle: {
                normal: {
                    areaColor: '#323c48',
                    borderColor: '#111'
                },
                emphasis: {
                    areaColor: '#2a333d'
                }
            }
        },
        series : [
            {
                name: '话题热度',
                type: 'scatter',
                coordinateSystem: 'geo',
                data: convertData(map_data),
                symbolSize: function (val) {
                    return val[2] / 10;
                },
                label: {
                    normal: {
                        formatter: '{b}',
                        position: 'right',
                        show: false
                    },
                    emphasis: {
                        show: true
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#ddb926'
                    }
                }
            },
            {
                name: 'Top 5',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                data: convertData(map_data.sort(function (a, b) {
                    return b.value - a.value;
                }).slice(0, 6)),
                symbolSize: function (val) {
                    return val[2] / 10;
                },
                showEffectOn: 'render',
                rippleEffect: {
                    brushType: 'stroke'
                },
                hoverAnimation: true,
                label: {
                    normal: {
                        formatter: '{b}',
                        position: 'right',
                        show: true
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#f4e925',
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                },
                zlevel: 1
            }
        ]
    };
    map.setOption(option);
}

//初始化折线图
var trend = echarts.init(document.getElementById('trend'));  
var base = +new Date(2016, 0, 0);
var oneDay = 24 * 3600 * 1000;
var date = [];
for (var i = 1; i <= 366; i++) {
    var now = new Date(base += oneDay);
    var month = now.getMonth()+1;
    if(month < 10){
        month = "0" + month;
    }
    var day = now.getDate();
    if(day < 10){
        day = "0" + day;
    }
    date.push([now.getFullYear(), month , day].join('-'));
}
// 指定图表的配置项和数据
var option = {

    title : {
        text: '微博话题热度趋势图',
        color:'white',
            textStyle: {
            fontWeight: 'normal',              //标题颜色
            color: 'white'
        }
    },
    grid: {
        y:60,
        height:150,
        y2:40,
        bottom: 10
    },
    toolbox: {
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            }
        }
    },
    tooltip : {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            animation: false,
            label: {
                backgroundColor: '#505765'
            }
        }
    },
    legend:
        {
            data:['微博数','点赞量','评论量','转发量'],
            left: 200,
        },
    dataZoom: [
        {
            show: true,
            realtime: false,
            start: 65,
            end: 85,
            bottom:40,
            dataBackgroundColor: '#eee',
        },
        {
            type: 'inside',
            realtime: true,
            start: 65,
            end: 85
        }
    ],
    xAxis : [
        {
            name: '时间',
            type : 'category',
            boundaryGap : false,
            axisLine: {onZero: false,show:false},
            data : date,
            axisLine:{
                lineStyle:{
                    color:'white',
                    width:2
                }
            }
        }
    ],
    yAxis: [
        {
            name: '数量',
            type: 'value',
            axisLine:{
                lineStyle:{
                    color:'white',
                    width:2
                }
            },
        },
        {
            name: '微博热度因素',
            type: 'value',
            axisLine:{
                lineStyle:{
                    color:'white',
                    width:2
                }
            },
        },

    ],
    series: [
        {
            name:'微博数',
            type:'line',
            animation: false,
            itemStyle: {
                normal: {
                    width: 1,
                    lineStyle:{
                        color:'#FFEB00'
                    }
                }
            },

            data: weibo_data
        },

        {
            name:'点赞量',
            type:'line',
            animation:false,
            itemStyle:{
                normal:{
                    width:1,
                    lineStyle:{
                        color:'#B74856'
                    }
                }
            },
            data: weibo_like_data
        },
        {
            name:'评论量',
            type:'line',
            yAxisIndex:1,
            animation: false,
            itemStyle: {
                normal: {
                    width: 1,
                    lineStyle:{
                        color:'#3F92D2'
                    }
                }
            },

            data: weibo_comment_data
        },
        {
            name:'转发量',
            type:'line',
            yAxisIndex:1,
            animation: false,
            lineStyle: {
                normal: {
                    width: 1,
                    lineStyle:{
                        color:'#3F92D2'
                    }
                }
            },

            data: weibo_transfer_data
        },
    ]
};
trend.setOption(option);  
window.onresize = trend.resize; //自适应  
trend.on('datazoom', function(params) {
    var xAxis = trend.getModel().option.xAxis[0];
    var endTime = xAxis.data[xAxis.rangeEnd];
    var startTime = xAxis.data[xAxis.rangeStart];
    adjuse_time_range(startTime,endTime);
});


//初始化词云
var key_word = echarts.init(document.getElementById('key_word'));
key_word.setOption({  
    tooltip : {},  
    series : [ {  
        type : 'wordCloud',  
        shape:'smooth',  
        gridSize : 2,  
        sizeRange : [ 30, 100 ],  
        // rotationRange : [ 46, 80 ],  
        textStyle : {  
            normal : {  
                color : function() {  
                    return 'rgb('  
                            + [ Math.round(Math.random() * 255),  
                                    Math.round(Math.random() * 255),  
                                    Math.round(Math.random() * 255) ]  
                                    .join(',') + ')';  
                }  
            },  
            emphasis : {  
                shadowBlur : 10,  
                shadowColor : '#333'  
            }  
        },  
        data : key_word_data
    }]  
});
