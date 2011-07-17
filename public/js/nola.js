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

// function resetAll() {
// 	
// 	
// 
//   allPeople.css({
//   
//     "position": "relative",
//     "top"     : "auto",
//     "left"    : "auto",
//     "z-index" : 0,
//     "width"   : 200,
//     "height"  : 200,
//     "padding-left": 0
//   
//   }).find(".overlay").addClass("dim");
// 
// };
// 
// 
// $(document).delegate(".person", "click", function() {
// 
//   resetAll();
// 
//   var el = $(this);
// 
//   var pos = el.position();
//   
//   el.addClass("hideOverlay").css({
//   
//     "position": "fixed",
//     "top"     : pos.top,
//     "left"    : pos.left,
//     "z-index" : 3,
//     
//   
//   }).animate({
//   
//     "width"   : 261,
//     "height"  : 200,
//     "padding-left" : 220
//   
//   });
// 
// });