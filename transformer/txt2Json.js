const readline = require("readline")
const fs = require("fs")

//读取结点出现年份
const rl_year = readline.createInterface({
    input: fs.createReadStream("year.txt")
});

var i = 1
var result = {
    "nodes": [],
    "links": [],
}

var year = {}

//先读取年份
rl_year.on('line', (line) => {
    var arr = line.split("\t")
    year[arr[0]] = parseInt(arr[1])
})

rl_year.on('close', () => {
    console.log(year)

    //读取结点连接关系
    const rl_net = readline.createInterface({
        input: fs.createReadStream("network.txt")
    });

    rl_net.on('line', (line) => {
        // console.log('Line from file:' + i + " " + line)
        // i += 1
        var arr = line.split("\t")
        console.log(arr)
        result.nodes.push({"id": arr[0], "year": year[arr[0]]})
        for(var i=1; i<arr.length; ++i) {
            if (arr[i] != "")
                result.links.push({"source": arr[i], "target": arr[0], "value": 1})
        }
    })

    rl_net.on('close', () => {
        console.log(result)
        fs.writeFile("output.json", JSON.stringify(result))
    })
})




