var i, e, allPeople;
    
for (i=0; i<10; i++) {

  $("<div />", {
  
    "class": "person",
    "id"   : "person-" + i
  
  }).hide().appendTo("#people");
  
  $("#person-" + i).load("parts/person.html", function() {
  
    $(this).find("img").load(function() {

      $(this).parent().fadeIn(400, function(){
      		$(this).css('display', 'inline-block');
      	});

	//	if (i == 10) {
	//		allPeople = $(".person");
	//	}
    
    });
  
  });

};

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