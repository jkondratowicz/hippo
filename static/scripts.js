function addSpinner(el) {
	$(el).html("<div class='spinner'></div>");
}

$(function() {
	addSpinner(".content");
});