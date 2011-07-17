var i, e, allPeople;
    
for (i=0; i<10; i++) {

  $("<div />", {
  
    "class": "person",
    "id"   : "person-" + i
  
  }).hide().appendTo("#people");
  
  $("#person-" + i).load("parts/person.html", function() {
  
    $(this).find("img").load(function() {
    
      $(this).parent().fadeIn();

		if (i == 10) {
			allPeople = $(".person");
		}
    
    });
  
  });

};

$(document).delegate(".person", "hover", function() {
	
	$("#tagline").val($(this).find(".tag").text());
	
});