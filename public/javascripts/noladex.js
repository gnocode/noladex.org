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
		
		$(target).click(function(e) {
			var href = $(this).attr('href');
			self.toggleDisplay(href);
			$('body').css('overflow', 'hidden');
			e.preventDefault();		
		});		
	},
	
	bindClose : function(target) {
		var self = this;
		
		$(target).click(function(e) {
			var href = $(this).attr('href');
			self.toggleDisplay(href);
			$('body').css('overflow','auto');
			e.preventDefault();
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
		window.onLoad = setupZoom();
	},

	bindHovers : function() {
		$("#people").delegate(".person", "hover", function() {
			var self = this;
			$("#tagline").val($(self).find(".tag").text());
			$(self).find('.overlay').fadeToggle(200);
		});
	}
}


$(document).ready(function(){
	noladex.run();
});




