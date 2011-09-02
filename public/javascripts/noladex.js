var noladex = {
	run : function () {
		this.bindCategoryChange();
		this.setupFancyZoom();
		this.setupAbout();
		this.bindHovers();
		this.bindDisplay('.about-link');
		this.bindClose('.close-link');
	},
	
	setupAbout : function() {
		$("#about").hide();
		$(".close-link").hide();
	},
	
	bindDisplay : function(target) {
		var self = this;
		
		$(target).click(function() {
			var href = $(this).attr('href');
			self.toggleDisplay(href);
			$('body').css('overflow', 'hidden');		
		});		
	},
	
	bindClose : function(target) {
		var self = this;
		
		$(target).click(function() {
			var href = $(this).attr('href');
			self.toggleDisplay(href);
			$('body').css('overflow','auto');
		});
	},
	
	toggleDisplay : function(href) {
			$(href).fadeToggle(function(){
			});
			$('.close-link').fadeToggle(800);		
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




