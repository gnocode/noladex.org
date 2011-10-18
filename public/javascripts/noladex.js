var noladex = {
	run : function () {
		this.bindCategoryChange();
		this.setupFancyZoom();
		this.setupAbout();
		this.bindHovers();
		this.bindDisplay('.about-link');
		this.bindClose('.close-link');
		this.searchButton();
	},

	searchButton : function() {
		$('#search-button').click(function() {
      var s = window.prompt('Search NOLADEX');
      if (s) { window.location = "/users?utf8=✓&search="+s; }
      return false;
    });
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
			$(href).fadeToggle();
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
		$('.person').live('mouseenter', function() {
    	$(this).find('.overlay').stop(true, false).fadeTo(200, 1);
    }).live('mouseleave', function(){
    	$(this).find('.overlay').stop(true, false).fadeTo(200, 0);
    });
	}
}


$(document).ready(function(){
	noladex.run();
});




