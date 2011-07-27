$(document).ready(function(){
  // Function	that loads FancyZoom on page load
  setupZoom();
});

$(document).delegate(".person", "hover", function() {	
	$("#tagline").val($(this).find(".tag").text());
	$(this).children('.overlay').fadeToggle(300);
});

$("#contact a").click(function() {
	$("#wufoo").slideToggle();	
});

$("#about-us a").click(function() {
	$("#about-text").slideToggle();	
});

function category_change() {
  var category = $('#categories option:selected').val();
  window.location = "?category=" + category;
}
