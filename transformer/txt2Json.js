const readline = require("readline")
const fs = require("fs")

const rl = readline.createInterface({
    input: fs.createReadStream("network.txt")
});

var i = 1
var result = {
    "nodes": [],
    "links": [],
}

rl.on('line', (line) => {
    // console.log('Line from file:' + i + " " + line)
    // i += 1
    var arr = line.split("\t")
    result.nodes.push({"id": arr[0], "group": 0})
    for(var i=1; i<arr.length; ++i) {
        if (arr[i] != "")
            result.links.push({"source": arr[i], "target": arr[0], "value": 1})
    }
})

rl.on('close', () => {
    console.log(result)
    fs.writeFile("output.json", JSON.stringify(result))
})
