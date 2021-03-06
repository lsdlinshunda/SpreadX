// 年份滑动条
$("#slider").slider({
    value: defaultOption.year.default,
    min: defaultOption.year.min,
    max: defaultOption.year.max,
    step: defaultOption.year.step,
    slide: function(event, ui) {
        $("#year").val(ui.value);
        filterByYear(ui.value);
        // 重置记录的数据
        data = {
            total: [],
            observed: [],
            infected: [],
        };
    }
});

$("#year").bind("change", function() {
    $("#slider").slider("value", this.value);
    filterByYear(this.value);
    // 重置记录的数据
    data = {
        total: [],
        observed: [],
        infected: [],
    };
})

// 读取数据文件
var reader = new FileReader();

reader.onload = function(e) {
    try {
        var data = JSON.parse(e.target.result);
        initGraph(data);
        $("#year").val(defaultOption.year.default);
        $("#slider").slider("value", defaultOption.year.default);
    } catch(error) {
        alert("载入文件错误");
    }
}

$("#inputfile").bind("change", function() {
    reader.readAsText(this.files[0])
})

$("#menu").draggable()

// 初始化设置
resetOption()

function resetOption() {
    $("#year").val(defaultOption.year.default);
    $("#seed_number").val(defaultOption.seed_number);
    $("#probability").val(defaultOption.probability);
    $("#threshold").val(defaultOption.threshold);
    $("#estimation").val(defaultOption.estimation);
    $("#auto").prop('checked', true);
}

function getOption() {
    return {
        year: parseInt($('#year').val()),
        algorithm: $('#algorithm').val(),
        seed_number: parseInt($('#seed_number').val()),
        probability: parseFloat($('#probability').val()) / 100,
        threshold: parseInt($('#threshold').val()),
        estimation: parseFloat($('#estimation').val()),
        auto: $('#auto').prop('checked'),
    }
}
