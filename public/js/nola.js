$(document).delegate(".person", "hover", function() {
	
	$("#tagline").val($(this).find(".tag").text());
	
});

$("#wufoo, #about-text").hide();

$("#contact a").click(function() {
	$("#wufoo").slideToggle();	
});

$("#about-us a").click(function() {
	$("#about-text").slideToggle();	
});