var myChart = echarts.init(document.getElementById('chart'));

var option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            crossStyle: {
                color: '#999'
            }
        }
    },
    toolbox: {
        feature: {
            dataView: {show: true, readOnly: false},
            magicType: {show: true, type: ['line', 'bar']},
            restore: {show: true},
            saveAsImage: {show: true}
        }
    },
    legend: {
        data:['节点总数','观测到的节点数','感染的节点数']
    },
    xAxis: [
        {
            type: 'value',
            name: '年份',
            min: 'dataMin',
            max: 2017,
            maxInterval: 1,
            axisPointer: {
                type: 'line'
            }
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: '节点数',
            min: 0,
        },
    ],
    series: [
        {
            name:'节点总数',
            type:'line',
        },
        {
            name:'观测到的节点数',
            type:'line',
        },
        {
            name:'感染的节点数',
            type:'line',
        }
    ]
};

myChart.setOption(option);

function record(year, data) {
    var infected = $("circle.infected").length;
    var observed = $("circle.observed").length;
    var unobserved = $("circle.unobserved").length;
    // 节点总数
    data.total.push([year, observed + unobserved + infected]);
    // 观测到的节点数
    data.observed.push([year, observed + infected]);
    // 感染的节点数
    data.infected.push([year, infected]);
    myChart.setOption({
        series: [{
            data: data.total
        }, {
            data: data.observed
        }, {
            data: data.infected
        }]
    });
}