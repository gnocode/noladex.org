var noladex = {
	run : function () {
		this.bindCategoryChange();
		this.setupFancyZoom();


		$("#wufoo, #about-text").hide();

		$("#contact a").click(function() {
			$("#wufoo").slideToggle();	
		});

		$("#about-us a").click(function() {
			$("#about-text").slideToggle();	
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
		});
	}
}


$(document).ready(function(){
	noladex.run();
});




