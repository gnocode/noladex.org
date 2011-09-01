var noladex = {
	run : function () {
		this.bindCategoryChange();
		this.setupFancyZoom();
		this.setupAbout();
		this.bindHovers();

		$(".about-link").click(function() {
			var href = $(this).attr('href');
			console.log(href);
			$(href).slideToggle();	
		});
	},
	
	setupAbout : function() {
		$("#about").hide();

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
			var self = this;
			$("#tagline").val($(self).find(".tag").text());
			$(self).children('.overlay').fadeToggle(300);
		});
	}
}


$(document).ready(function(){
	noladex.run();
});




