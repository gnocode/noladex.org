var noladex = {
	run : function () {
		this.bindCategoryChange();
		this.setupFancyZoom();
		this.setupWooFoo();

		$("#about-us a").click(function() {
			$("#about-text").slideToggle();	
		});
	},
	
	setupWooFoo : function() {
		$("#wufoo, #about-text").hide();

		$("#contact a").click(function() {
			$("#wufoo").slideToggle();	
		});
	},

	bindCategoryChange : function() {
		$("select#categories").change(function() {
			var category = $('#categories option:selected').val();
			window.location = "?category=" + category;
		})
	},

	setupFancyZoom : function() {
		// Function	that loads FancyZoom on page load
		window.onLoad = setupZoom();
	},

	bindHovers : function() {
		$("section#people").delegate(".person", "hover", function() {
			$("#tagline").val($(this).find(".tag").text());
			$(this).children('.overlay').fadeToggle(300);
		});
	}
}


$(document).ready(function(){
	noladex.run();
});




