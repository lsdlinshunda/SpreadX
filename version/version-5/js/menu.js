// 年份滑动条
$("#slider").slider({
    value:2017,
    min:2000,
    max:2017,
    step:1,
    slide: function(event, ui) {
        $("#year").val(ui.value);
        filterByYear(ui.value);
    }
});
$("#year").val($("#slider").slider("value"));
// 为输入框绑定事件
$("#year").bind("change", function() {
    $("#slider").slider("value", this.value)
    filterByYear(this.value)
})
