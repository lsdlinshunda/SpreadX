// 年份滑动条
$("#slider").slider({
    value: defaultOption.year.default,
    min: defaultOption.year.min,
    max: defaultOption.year.max,
    step: defaultOption.year.step,
    slide: function(event, ui) {
        $("#year").val(ui.value);
        filterByYear(ui.value);
    }
});

$("#year").bind("change", function() {
    $("#slider").slider("value", this.value)
    filterByYear(this.value)
})

resetOption()

function resetOption() {
    $("#year").val(defaultOption.year.default);
    $("#seed_number").val(defaultOption.seed_number);
    $("#probability").val(defaultOption.probability);
    $("#threshold").val(defaultOption.threshold);
    $("#estimation").val(defaultOption.estimation);
}

function getOption() {
    return {
        year: parseInt($('#year').val()),
        algorithm: $('#algorithm').val(),
        seed_number: parseInt($('#seed_number').val()),
        probability: parseFloat($('#probability').val()) / 100,
        threshold: parseInt($('#threshold').val()),
        estimation: parseFloat($('#estimation').val()),
    }
}
