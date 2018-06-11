var seed_node = []

var zoom = d3.zoom().scaleExtent([0.5, 8]).on("zoom", zoomed);

var svg = d3.select("svg").call(zoom),
    width = +svg.attr("width"),
    height = +svg.attr("height");
    center = {x: width / 2, y: height / 2}

function zoomed() {
    d3.selectAll("g").attr("transform", d3.event.transform);
}

d3.json("../data/01.json", function(error, graph) {
    if (error) throw error;
    initGraph(graph);
});
 
function initGraph(graph) {
    $("svg").empty()

    // 建立节点id到节点对象的映射
    var hash = []; 
    for (var i = 0; i < graph.nodes.length; ++i) {
        hash[graph.nodes[i].id] = graph.nodes[i];
    } 

    // 将边的端点替换成相应的节点对象
    for (var i = 0; i < graph.edges.length; ++i) {
        graph.edges[i]["source"] = hash[graph.edges[i]["source"]];
        graph.edges[i]["target"] = hash[graph.edges[i]["target"]];
        graph.edges[i]["year"] = Math.max(graph.edges[i]["source"].attributes.year, graph.edges[i]["target"].attributes.year)
    }

    console.log(graph.edges);
        
    var link = svg.append("g")
        .selectAll("line")
        .data(graph.edges)
        .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.size); })
        .attr("x1", function(d) { return center.x + d.source.x * 0.2; })
        .attr("y1", function(d) { return center.y + d.source.y * 0.2; })
        .attr("x2", function(d) { return center.x + d.target.x * 0.2; })
        .attr("y2", function(d) { return center.y + d.target.y * 0.2; })
        .attr("class", "observed");

    var node = svg.append("g")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("cx", function(d) { return center.x + d.x * 0.2; })
        .attr("cy", function(d) { return center.y + d.y * 0.2; })
        .attr("r", function(d) { return d.size * 0.24; })
        .attr("class", "observed")
        .on("click", function(d) {
            chosen = d3.select(this);
            if (chosen.classed("seed")) {
                chosen.attr("class", "observed");
            } else { 
                chosen.attr("class", "seed");
            }
        });

    node.append("title")
        .text(function(d) { return d.id + "(" + d.attributes.year + ")"; });
}

// 过滤年份
function filterByYear(year) {
    d3.selectAll("circle").filter(function(d, i) {
        if ( d.attributes.year > year)
            return true;
        else 
            return false;
    }).attr("class", "invisible");

    d3.selectAll("circle").filter(function(d, i) {
        if ( d.attributes.year <= year)
            return true;
        else 
            return false;
    }).attr("class", "observed");

    d3.selectAll("line").filter(function(d, i) {
        if ( d.year > year)
            return true;
        else 
            return false;
    }).attr("class", "invisible");

    d3.selectAll("line").filter(function(d, i) {
        if ( d.year <= year)
            return true;
        else 
            return false;
    }).attr("class", "observed");
}

async function simulation() {
    // 禁用设置面板
    $("fieldset").attr("disabled", true);
    $("#slider").slider("disable");
    // 获取参数
    var option = getOption();
    console.log(option)
    // 记录模拟的结果
    var year = option.year;
    while (year<2017) {
        await getSeeds(option)
        //新一年的节点加入网络
        ++year;
        $("#year").val(year);
        $("#slider").slider("value", year)
        d3.selectAll("circle").filter(function(d, i) {
            return d.attributes.year == year;
        }).attr("class", "unobserved");
        d3.selectAll("line").filter(function(d, i) {
            return d.year == year;
        }).attr("class", "unobserved");
        await sleep(750)
        await startSpread(option.probability).then(() => {
            console.log(year + " finish");
        });
        record(year);
        d3.selectAll("circle.infected").attr("class", "observed");
        d3.selectAll("line.infected").attr("class", "observed");
        if (!option.auto) break;
        await sleep(750);
    }
    // 重新启用设置面板
    $("fieldset").attr("disabled", false);
    $("#slider").slider("enable");
}

function startSpread(probability) {
    return new Promise((resolve) => {
        var seed = d3.selectAll("circle.seed")
        //不存在种子
        if (seed.empty()) {
            resolve();
            return;
        }
        seed.each(function(d){
            //随机选择种子的相邻边
            var new_seed = d3.selectAll("line").filter(function(l) {
                if (l.source.id == d.id) {
                    var count = 0;
                    d3.selectAll("circle.observed").filter(function(c) {
                        if (c.id == l.target.id) ++count;
                    });
                    d3.selectAll("circle.unobserved").filter(function(c) {
                        if (c.id == l.target.id) ++count;
                    });
                    //以一定概率抽取未感染的相邻节点（包括观测到的和未观测到的）
                    return Math.random() < probability && count == 1;
                }
                return false;
            }).attr("class", "infected");
            
            //生成新的种子
            new_seed.each(function(l) {
                d3.selectAll("circle").filter(function(c) {
                    return c.id == l.target.id;
                }).attr("class", "seed");
                //种子节点的相邻节点置为观测到的节点
                d3.selectAll("line.unobserved").filter(function(ul) {
                    if (ul.source.id == l.target.id) {
                        d3.selectAll("circle.unobserved").filter(function(c){
                            return c.id == ul.target.id; 
                        }).attr("class", "observed");
                        return true;
                    };
                    return false;
                }).attr("class", "observed");
            });
            d3.select(this).attr("class", "infected");
        });
        //新一轮传播
        sleep(750).then(() => {
            return startSpread(probability);
        }).then(() => {
            resolve();
        })
    })
}

//延迟函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//设置rpc服务的地址
$.jsonRPC.setup({
    endPoint: 'http://127.0.0.1:5000/api/algorithm'
});

//通过算法选取种子
function getSeeds(option) {
    return new Promise((resolve) => {
        var network = {};
        d3.selectAll("circle.observed").each(function(c) {
            network[c.id] = []; 
            d3.selectAll("line.observed").each(function(l) {
                if (l.source.id == c.id) {
                    network[c.id].push(l.target.id);
                }
            })
        })
        $.jsonRPC.request(option.algorithm , {
            params: {
                network: network,
                n: option.seed_number,
                threshold: option.threshold,
                estimation: option.estimation,
            },
            success: function(result) {
                var seeds = result.result;
                console.log(seeds)
                seeds.forEach(id => {
                    //对选取的种子进行标记
                    d3.selectAll("circle.observed").filter(function(c) {
                        return id == c.id;
                    }).attr("class", "seed");
                });
                resolve();
            },
            error: function(result) {
                console.log(result);
                resolve();
            }
        });
    });
}
