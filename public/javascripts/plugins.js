//     jquery.sausage.js 1.0.0
//     (c) 2011 Christopher Cliff
//     Freely distributed under the MIT license.
//     For all details and documentation:
//     http://christophercliff.github.com/sausage

(function($, undefined){
    
    $.widget('cc.sausage', {
        
        // # Options
        //
        //
        
        options: {
            
            // ### page `string`
            //
            // Sets the string to be used to select page elements.
            // 
            // Example:
            // 
            //      $(window)
            //          .sausage({
            //              page: '.my-page-selector'
            //          })
            //          ;
            //
            page: '.page',
            
            // ### content `function`
            // 
            // Sets the content of the sausage elements. Use `i` and `$page` to render content dynamically.
            // 
            // Example:
            // 
            //      $(window)
            //          .sausage({
            //              content: function (i, $page) {
            //                  return '<div>' + $page.data('name') + '</div>';
            //          }
            //      })
            //      ;
            //
            content: function (i, $page) {
                return '<span class="sausage-span">' + (i + 1) + '</span>';
            }
            
        },
        
        // # Private Methods
        //
        //
        
        // ## `._create()`
        //
        //
        _create: function () {
            
            var self = this,
                $el = self.element;
            
            // Use $el for the outer element.
            self.$outer = $el;
            // Use `body` for the inner element if the outer element is `window`. Otherwise, use the first child of `$el`.
            self.$inner = $.isWindow(self.element.get(0)) ? $('body') : $el.children(':first-child');
            self.$sausages = $('<div class="sausage-set"/>');
            self.sausages = self.$sausages.get(0);
            self.offsets = [];
            
            self.$sausages
                .appendTo(self.$inner)
                ;
            
            // Trigger the `create` event.
            self._trigger('create');
            
            return;
        },
        
        // ## `._init()`
        //
        //
        _init: function () {
            
            var self = this;
            
            // Stop and destroy if scroll bar is not present.
            if (self.$outer.height() >= self.$inner.height())
            {
                self.destroy();
                
                return;
            }
            
            self.draw();
            self._update();
            self._events();
            self._delegates();
            
            // Add a CSS class for styling purposes.
            self.$sausages
                .addClass('sausage-set-init')
                ;
            
            self.blocked = false;
            
            // Trigger the `init` event.
            self._trigger('init');
            
            return;
        },
        
        // ## `._events()`
        //
        //
        _events: function () {
            
            var self = this;
            
            self.hasScrolled = false;
            
            self.$outer
                .bind('resize.sausage', function(){
                    
                    self.draw();
                    
                })
                .bind('scroll.sausage', function(e){
                    
                    self.hasScrolled = true;
                    
                })
                ;
            
            // [Prevent crazy amounts of scroll events from being fired](http://ejohn.org/blog/learning-from-twitter/) by setting an interval and listening.
            setInterval(function(){
                
                if (!self.hasScrolled)
                {
                    return;
                }
                
                self.hasScrolled = false;
                self._update();
                
            }, 250);
            
            return;
        },
        
        // ## `._getCurrent()`
        //
        //
        _getCurrent: function () {
            
            var self = this,
                st = self.$outer.scrollTop() + self._getHandleHeight(self.$outer, self.$inner)/4,
                h_win = self.$outer.height(),
                h_doc = self.$inner.height(),
                i = 0;
            
            for (l = self.offsets.length; i < l; i++)
            {
                if (!self.offsets[i + 1])
                {
                    return i;
                }
                else if (st <= self.offsets[i])
                {
                    return i;
                }
                else if (st > self.offsets[i] && st <= self.offsets[i + 1])
                {
                    return i;
                }
            }
            
            return i;
        },
        
        // ## `._delegates()`
        //
        //
        _delegates: function () {
            
            var self = this;
            
            self.$sausages
                .delegate('.sausage', 'hover', function(){
                    
                    if (self.blocked)
                    {
                        return;
                    }
                    
                    $(this)
                        .toggleClass('sausage-hover')
                        ;
                    
                })
                .delegate('.sausage', 'click', function(e){
                    e.preventDefault();
                    
                    if (self.blocked)
                    {
                        return;
                    }
                    
                    var $sausage = $(this),
                        val = $sausage.index(),
                        o = self.$inner.find(self.options.page).eq(val).offset().top;
                    
                    self._scrollTo(o);
                    
                    // Trigger the `onClick` event.
                    // 
                    // Example:
                    // 
                    //      $(window)
                    //          .sausage({
                    //              onClick: function (e, o) {
                    //                  alert('You clicked the sausage at index: ' + o.i);
                    //          }
                    //      })
                    //      ;
                    //
                    self._trigger('onClick', e, {
                        $sausage: $sausage,
                        i: val
                    });
                    
                    if ($sausage.hasClass('current'))
                    {
                        return;
                    }
                    
                    // Trigger the `onUpdate` event.
                    self._trigger('onUpdate', e, {
                        $sausage: $sausage,
                        i: val
                    });
                })
                ;
            
            return;
        },
        
        _scrollTo: function (o) {
            
            var self = this,
                $outer = self.$outer,
                rate = 2/1, // px/ms
                distance = self.offsets[self.current] - o,
                duration = Math.abs(distance/rate);
                // Travel at 2 px per 1 ms but never longer than 1 s.
                duration = (duration < 1000) ? duration : 1000;
            
            if (self.$outer.get(0) === window)
            {
                $outer = $('body, html, document');
            }
            
            $outer
                .stop(true)
                .animate({
                    scrollTop: o
                }, duration)
                ;
            
            return;
        },
        
        _handleClick: function () {
            
            var self = this
            
            
            
            return;
        },
        
        // ## `._update()`
        //
        //
        _update: function () {
            
            var self = this;
                i = self._getCurrent(),
                c = 'sausage-current';
            
            if (i === self.current || self.blocked)
            {
                return;
            }
            
            self.current = i;
            
            self.$sausages.children().eq(i)
                .addClass(c)
            .siblings()
                .removeClass(c)
                ;
            
            // Trigger the `update` event.
            self._trigger('update');
            
            return;
        },
        
        // ### `._getHandleHeight()`
        // 
        // 
        _getHandleHeight: function ($outer, $inner) {
            
            var h_outer = $outer.height(),
                h_inner = $inner.height();
            
            return h_outer/h_inner*h_outer;
        },
        
        // # Public Methods
        //
        //
        
        // ### draw `.sausage("draw")`
        // 
        // Creates the sausage UI elements.
        draw: function () {
            
            var self = this,
                h_win = self.$outer.height(),
                h_doc = self.$inner.height(),
                $items = self.$inner.find(self.options.page),
                $page,
                s = [],
                offset_p,
                offset_s;
            
            self.offsets = [];
            self.count = $items.length;
            
            // Detach from DOM while making changes.
            self.$sausages
                .detach()
                .empty()
                ;
            
            // Calculate the element heights and push to an array.
            for (var i = 0; i < self.count; i++)
            {
                $page = $items.eq(i);
                offset_p = $page.offset();
                offset_s = offset_p.top/h_doc*h_win;
                
                s.push('<div class="sausage' + ((i === self.current) ? ' sausage-current' : '') + '" style="height:' + ($page.outerHeight()/h_doc*h_win) + 'px;top:' + offset_s + 'px;">' + self.options.content(i, $page) + '</div>');
                
                // Create `self.offsets` for calculating current sausage.
                self.offsets.push(offset_p.top);
            }
            
            // Use Array.join() for speed.
            self.sausages.innerHTML = s.join('');
            
            // And reattach.
            self.$sausages
                .appendTo(self.$inner)
                ;
            
            return;
        },
        
        // ### block `.sausage("block")`
        // 
        // Blocks the UI to prevent users from interacting with the sausage UI. Useful when loading data and updating the DOM.
        block: function () {
            
            var self = this,
                c = 'sausage-set-blocked';
            
            self.blocked = true;
            
            // Add a CSS class for styling purposes.
            self.$sausages
                .addClass(c)
                ;
            
            return;
        },
        
        // ### unblock `.sausage("unblock")`
        // 
        // Unblocks the UI once loading and DOM manipulation are complete.
        unblock: function () {
            
            var self = this,
                c = 'sausage-set-blocked';
            
            self.$sausages
                .removeClass(c)
                ;
            
            self.blocked = false;
            
            return;
        },
        
        // ### destroy `.sausage("destroy")`
        // 
        // Removes the sausage instance from the DOM.
        destroy: function () {
            
            var self = this;
            
            self.$outer
                .unbind('.sausage')
                ;
            
            self.$sausages
                .remove()
                ;
            
            return;
        }
        
    });
    
})(jQuery);





// FancyZoom.js - v1.1 - http://www.fancyzoom.com
//
// Copyright (c) 2008 Cabel Sasser / Panic Inc
// All rights reserved.
// 
//     Requires: FancyZoomHTML.js
// Instructions: Include JS files in page, call setupZoom() in onLoad. That's it!
//               Any <a href> links to images will be updated to zoom inline.
//               Add rel="nozoom" to your <a href> to disable zooming for an image.
// 
// Redistribution and use of this effect in source form, with or without modification,
// are permitted provided that the following conditions are met:
// 
// * USE OF SOURCE ON COMMERCIAL (FOR-PROFIT) WEBSITE REQUIRES ONE-TIME LICENSE FEE PER DOMAIN.
//   Reasonably priced! Visit www.fancyzoom.com for licensing instructions. Thanks!
//
// * Non-commercial (personal) website use is permitted without license/payment!
//
// * Redistribution of source code must retain the above copyright notice,
//   this list of conditions and the following disclaimer.
//
// * Redistribution of source code and derived works cannot be sold without specific
//   written prior permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var includeCaption = true; // Turn on the "caption" feature, and write out the caption HTML
var zoomTime       = 5;    // Milliseconds between frames of zoom animation
var zoomSteps      = 15;   // Number of zoom animation frames
var includeFade    = 1;    // Set to 1 to fade the image in / out as it zooms
var minBorder      = 90;   // Amount of padding between large, scaled down images, and the window edges
var shadowSettings = '0px 5px 25px rgba(0, 0, 0, '; // Blur, radius, color of shadow for compatible browsers

var zoomImagesURI   = '../images/zoom/'; // Location of the zoom and shadow images

// Init. Do not add anything below this line, unless it's something awesome.

var myWidth = 0, myHeight = 0, myScroll = 0; myScrollWidth = 0; myScrollHeight = 0;
var zoomOpen = false, preloadFrame = 1, preloadActive = false, preloadTime = 0, imgPreload = new Image();
var preloadAnimTimer = 0;

var zoomActive = new Array(); var zoomTimer  = new Array(); 
var zoomOrigW  = new Array(); var zoomOrigH  = new Array();
var zoomOrigX  = new Array(); var zoomOrigY  = new Array();

var zoomID         = "ZoomBox";
var theID          = "ZoomImage";
var zoomCaption    = "ZoomCaption";
var zoomCaptionDiv = "ZoomCapDiv";

if (navigator.userAgent.indexOf("MSIE") != -1) {
	var browserIsIE = true;
}

// Zoom: Setup The Page! Called in your <body>'s onLoad handler.

function setupZoom() {
	prepZooms();
	insertZoomHTML();
	zoomdiv = document.getElementById(zoomID);  
	zoomimg = document.getElementById(theID);
}

// Zoom: Inject Javascript functions into hrefs pointing to images, one by one!
// Skip any href that contains a rel="nozoom" tag.
// This is done at page load time via an onLoad() handler.

function prepZooms() {
	if (! document.getElementsByTagName) {
		return;
	}
	var links = document.getElementsByTagName("a");
	for (i = 0; i < links.length; i++) {
		if (links[i].getAttribute("href")) {
			if (links[i].getAttribute("href").search(/(.*)\.(jpg|jpeg|gif|png|bmp|tif|tiff)/gi) != -1) {
				if (links[i].getAttribute("rel") != "nozoom") {
					links[i].onclick = function (event) { return zoomClick(this, event); };
					links[i].onmouseover = function () { zoomPreload(this); };
				}
			}
		}
	}
}

// Zoom: Load an image into an image object. When done loading, function sets preloadActive to false,
// so other bits know that they can proceed with the zoom.
// Preloaded image is stored in imgPreload and swapped out in the zoom function.

function zoomPreload(from) {

	var theimage = from.getAttribute("href");

	// Only preload if we have to, i.e. the image isn't this image already

	if (imgPreload.src.indexOf(from.getAttribute("href").substr(from.getAttribute("href").lastIndexOf("/"))) == -1) {
		preloadActive = true;
		imgPreload = new Image();

		// Set a function to fire when the preload is complete, setting flags along the way.

		imgPreload.onload = function() {
			preloadActive = false;
		}

		// Load it!
		imgPreload.src = theimage;
	}
}

// Zoom: Start the preloading animation cycle.

function preloadAnimStart() {
	preloadTime = new Date();
	document.getElementById("ZoomSpin").style.left = (myWidth / 2) + 'px';
	document.getElementById("ZoomSpin").style.top = ((myHeight / 2) + myScroll) + 'px';
	document.getElementById("ZoomSpin").style.visibility = "visible";	
	preloadFrame = 1;
	document.getElementById("SpinImage").src = zoomImagesURI+'zoom-spin-'+preloadFrame+'.png';  
	preloadAnimTimer = setInterval("preloadAnim()", 100);
}

// Zoom: Display and ANIMATE the jibber-jabber widget. Once preloadActive is false, bail and zoom it up!

function preloadAnim(from) {
	if (preloadActive != false) {
		document.getElementById("SpinImage").src = zoomImagesURI+'zoom-spin-'+preloadFrame+'.png';
		preloadFrame++;
		if (preloadFrame > 12) preloadFrame = 1;
	} else {
		document.getElementById("ZoomSpin").style.visibility = "hidden";    
		clearInterval(preloadAnimTimer);
		preloadAnimTimer = 0;
		zoomIn(preloadFrom);
	}
}

// ZOOM CLICK: We got a click! Should we do the zoom? Or wait for the preload to complete?
// todo?: Double check that imgPreload src = clicked src

function zoomClick(from, evt) {

	var shift = getShift(evt);

	// Check for Command / Alt key. If pressed, pass them through -- don't zoom!
	if (! evt && window.event && (window.event.metaKey || window.event.altKey)) {
		return true;
	} else if (evt && (evt.metaKey|| evt.altKey)) {
		return true;
	}

	// Get browser dimensions
	getSize();

	// If preloading still, wait, and display the spinner.
	if (preloadActive == true) {
		// But only display the spinner if it's not already being displayed!
		if (preloadAnimTimer == 0) {
			preloadFrom = from;
			preloadAnimStart();	
		}
	} else {
		// Otherwise, we're loaded: do the zoom!
		zoomIn(from, shift);
	}
	
	return false;
	
}

// Zoom: Move an element in to endH endW, using zoomHost as a starting point.
// "from" is an object reference to the href that spawned the zoom.

function zoomIn(from, shift) {

	zoomimg.src = from.getAttribute("href");

	// Determine the zoom settings from where we came from, the element in the <a>.
	// If there's no element in the <a>, or we can't get the width, make stuff up

	if (from.childNodes[0].width) {
		startW = from.childNodes[0].width;
		startH = from.childNodes[0].height;
		startPos = findElementPos(from.childNodes[0]);
	} else {
		startW = 50;
		startH = 12;
		startPos = findElementPos(from);
	}

	hostX = startPos[0];
	hostY = startPos[1];

	// Make up for a scrolled containing div.
	// TODO: This HAS to move into findElementPos.
	
	if (document.getElementById('scroller')) {
		hostX = hostX - document.getElementById('scroller').scrollLeft;
	}

	// Determine the target zoom settings from the preloaded image object

	endW = imgPreload.width;
	endH = imgPreload.height;

	// Start! But only if we're not zooming already!

	if (zoomActive[theID] != true) {

		// Clear everything out just in case something is already open

		if (document.getElementById("ShadowBox")) {
			document.getElementById("ShadowBox").style.visibility = "hidden";
		} else if (! browserIsIE) {
		
			// Wipe timer if shadow is fading in still
			if (fadeActive["ZoomImage"]) {
				clearInterval(fadeTimer["ZoomImage"]);
				fadeActive["ZoomImage"] = false;
				fadeTimer["ZoomImage"] = false;			
			}
			
			document.getElementById("ZoomImage").style.webkitBoxShadow = shadowSettings + '0.0)';			
		}
		
		document.getElementById("ZoomClose").style.visibility = "hidden";     

		// Setup the CAPTION, if existing. Hide it first, set the text.

		if (includeCaption) {
			document.getElementById(zoomCaptionDiv).style.visibility = "hidden";
			if (from.getAttribute('title') && includeCaption) {
				// Yes, there's a caption, set it up
				document.getElementById(zoomCaption).innerHTML = from.getAttribute('title');
			} else {
				document.getElementById(zoomCaption).innerHTML = "";
			}
		}

		// Store original position in an array for future zoomOut.

		zoomOrigW[theID] = startW;
		zoomOrigH[theID] = startH;
		zoomOrigX[theID] = hostX;
		zoomOrigY[theID] = hostY;

		// Now set the starting dimensions

		zoomimg.style.width = startW + 'px';
		zoomimg.style.height = startH + 'px';
		zoomdiv.style.left = hostX + 'px';
		zoomdiv.style.top = hostY + 'px';

		// Show the zooming image container, make it invisible

		if (includeFade == 1) {
			setOpacity(0, zoomID);
		}
		zoomdiv.style.visibility = "visible";

		// If it's too big to fit in the window, shrink the width and height to fit (with ratio).

		sizeRatio = endW / endH;
		if (endW > myWidth - minBorder) {
			endW = myWidth - minBorder;
			endH = endW / sizeRatio;
		}
		if (endH > myHeight - minBorder) {
			endH = myHeight - minBorder;
			endW = endH * sizeRatio;
		}

		zoomChangeX = ((myWidth / 2) - (endW / 2) - hostX);
		zoomChangeY = (((myHeight / 2) - (endH / 2) - hostY) + myScroll);
		zoomChangeW = (endW - startW);
		zoomChangeH = (endH - startH);
		
		// Shift key?
	
		if (shift) {
			tempSteps = zoomSteps * 7;
		} else {
			tempSteps = zoomSteps;
		}

		// Setup Zoom

		zoomCurrent = 0;

		// Setup Fade with Zoom, If Requested

		if (includeFade == 1) {
			fadeCurrent = 0;
			fadeAmount = (0 - 100) / tempSteps;
		} else {
			fadeAmount = 0;
		}

		// Do It!
		
		zoomTimer[theID] = setInterval("zoomElement('"+zoomID+"', '"+theID+"', "+zoomCurrent+", "+startW+", "+zoomChangeW+", "+startH+", "+zoomChangeH+", "+hostX+", "+zoomChangeX+", "+hostY+", "+zoomChangeY+", "+tempSteps+", "+includeFade+", "+fadeAmount+", 'zoomDoneIn(zoomID)')", zoomTime);		
		zoomActive[theID] = true; 
	}
}

// Zoom it back out.

function zoomOut(from, evt) {

	// Get shift key status.
	// IE events don't seem to get passed through the function, so grab it from the window.

	if (getShift(evt)) {
		tempSteps = zoomSteps * 7;
	} else {
		tempSteps = zoomSteps;
	}	

	// Check to see if something is happening/open
  
	if (zoomActive[theID] != true) {

		// First, get rid of the shadow if necessary.

		if (document.getElementById("ShadowBox")) {
			document.getElementById("ShadowBox").style.visibility = "hidden";
		} else if (! browserIsIE) {
		
			// Wipe timer if shadow is fading in still
			if (fadeActive["ZoomImage"]) {
				clearInterval(fadeTimer["ZoomImage"]);
				fadeActive["ZoomImage"] = false;
				fadeTimer["ZoomImage"] = false;			
			}
			
			document.getElementById("ZoomImage").style.webkitBoxShadow = shadowSettings + '0.0)';			
		}

		// ..and the close box...

		document.getElementById("ZoomClose").style.visibility = "hidden";

		// ...and the caption if necessary!

		if (includeCaption && document.getElementById(zoomCaption).innerHTML != "") {
			// fadeElementSetup(zoomCaptionDiv, 100, 0, 5, 1);
			document.getElementById(zoomCaptionDiv).style.visibility = "hidden";
		}

		// Now, figure out where we came from, to get back there

		startX = parseInt(zoomdiv.style.left);
		startY = parseInt(zoomdiv.style.top);
		startW = zoomimg.width;
		startH = zoomimg.height;
		zoomChangeX = zoomOrigX[theID] - startX;
		zoomChangeY = zoomOrigY[theID] - startY;
		zoomChangeW = zoomOrigW[theID] - startW;
		zoomChangeH = zoomOrigH[theID] - startH;

		// Setup Zoom

		zoomCurrent = 0;

		// Setup Fade with Zoom, If Requested

		if (includeFade == 1) {
			fadeCurrent = 0;
			fadeAmount = (100 - 0) / tempSteps;
		} else {
			fadeAmount = 0;
		}

		// Do It!

		zoomTimer[theID] = setInterval("zoomElement('"+zoomID+"', '"+theID+"', "+zoomCurrent+", "+startW+", "+zoomChangeW+", "+startH+", "+zoomChangeH+", "+startX+", "+zoomChangeX+", "+startY+", "+zoomChangeY+", "+tempSteps+", "+includeFade+", "+fadeAmount+", 'zoomDone(zoomID, theID)')", zoomTime);	
		zoomActive[theID] = true;
	}
}

// Finished Zooming In

function zoomDoneIn(zoomdiv, theID) {

	// Note that it's open
  
	zoomOpen = true;
	zoomdiv = document.getElementById(zoomdiv);

	// Position the table shadow behind the zoomed in image, and display it

	if (document.getElementById("ShadowBox")) {

		setOpacity(0, "ShadowBox");
		shadowdiv = document.getElementById("ShadowBox");

		shadowLeft = parseInt(zoomdiv.style.left) - 13;
		shadowTop = parseInt(zoomdiv.style.top) - 8;
		shadowWidth = zoomdiv.offsetWidth + 26;
		shadowHeight = zoomdiv.offsetHeight + 26; 
	
		shadowdiv.style.width = shadowWidth + 'px';
		shadowdiv.style.height = shadowHeight + 'px';
		shadowdiv.style.left = shadowLeft + 'px';
		shadowdiv.style.top = shadowTop + 'px';

		document.getElementById("ShadowBox").style.visibility = "visible";
		fadeElementSetup("ShadowBox", 0, 100, 5);
		
	} else if (! browserIsIE) {
		// Or, do a fade of the modern shadow
		fadeElementSetup("ZoomImage", 0, .8, 5, 0, "shadow");
	}
	
	// Position and display the CAPTION, if existing
  
	if (includeCaption && document.getElementById(zoomCaption).innerHTML != "") {
		// setOpacity(0, zoomCaptionDiv);
		zoomcapd = document.getElementById(zoomCaptionDiv);
		zoomcapd.style.top = parseInt(zoomdiv.style.top) + (zoomdiv.offsetHeight + 15) + 'px';
		zoomcapd.style.left = (myWidth / 2) - (zoomcapd.offsetWidth / 2) + 'px';
		zoomcapd.style.visibility = "visible";
		// fadeElementSetup(zoomCaptionDiv, 0, 100, 5);
	}   
	
	// Display Close Box (fade it if it's not IE)

	if (!browserIsIE) setOpacity(0, "ZoomClose");
	document.getElementById("ZoomClose").style.visibility = "visible";
	if (!browserIsIE) fadeElementSetup("ZoomClose", 0, 100, 5);

	// Get keypresses
	document.onkeypress = getKey;
	
}

// Finished Zooming Out

function zoomDone(zoomdiv, theID) {

	// No longer open
  
	zoomOpen = false;

	// Clear stuff out, clean up

	zoomOrigH[theID] = "";
	zoomOrigW[theID] = "";
	document.getElementById(zoomdiv).style.visibility = "hidden";
	zoomActive[theID] == false;

	// Stop getting keypresses

	document.onkeypress = null;

}

// Actually zoom the element

function zoomElement(zoomdiv, theID, zoomCurrent, zoomStartW, zoomChangeW, zoomStartH, zoomChangeH, zoomStartX, zoomChangeX, zoomStartY, zoomChangeY, zoomSteps, includeFade, fadeAmount, execWhenDone) {

	// console.log("Zooming Step #"+zoomCurrent+ " of "+zoomSteps+" (zoom " + zoomStartW + "/" + zoomChangeW + ") (zoom " + zoomStartH + "/" + zoomChangeH + ")  (zoom " + zoomStartX + "/" + zoomChangeX + ")  (zoom " + zoomStartY + "/" + zoomChangeY + ") Fade: "+fadeAmount);
    
	// Test if we're done, or if we continue

	if (zoomCurrent == (zoomSteps + 1)) {
		zoomActive[theID] = false;
		clearInterval(zoomTimer[theID]);

		if (execWhenDone != "") {
			eval(execWhenDone);
		}
	} else {
	
		// Do the Fade!
	  
		if (includeFade == 1) {
			if (fadeAmount < 0) {
				setOpacity(Math.abs(zoomCurrent * fadeAmount), zoomdiv);
			} else {
				setOpacity(100 - (zoomCurrent * fadeAmount), zoomdiv);
			}
		}
	  
		// Calculate this step's difference, and move it!
		
		moveW = cubicInOut(zoomCurrent, zoomStartW, zoomChangeW, zoomSteps);
		moveH = cubicInOut(zoomCurrent, zoomStartH, zoomChangeH, zoomSteps);
		moveX = cubicInOut(zoomCurrent, zoomStartX, zoomChangeX, zoomSteps);
		moveY = cubicInOut(zoomCurrent, zoomStartY, zoomChangeY, zoomSteps);
	
		document.getElementById(zoomdiv).style.left = moveX + 'px';
		document.getElementById(zoomdiv).style.top = moveY + 'px';
		zoomimg.style.width = moveW + 'px';
		zoomimg.style.height = moveH + 'px';
	
		zoomCurrent++;
		
		clearInterval(zoomTimer[theID]);
		zoomTimer[theID] = setInterval("zoomElement('"+zoomdiv+"', '"+theID+"', "+zoomCurrent+", "+zoomStartW+", "+zoomChangeW+", "+zoomStartH+", "+zoomChangeH+", "+zoomStartX+", "+zoomChangeX+", "+zoomStartY+", "+zoomChangeY+", "+zoomSteps+", "+includeFade+", "+fadeAmount+", '"+execWhenDone+"')", zoomTime);
	}
}

// Zoom Utility: Get Key Press when image is open, and act accordingly

function getKey(evt) {
	if (! evt) {
		theKey = event.keyCode;
	} else {
		theKey = evt.keyCode;
	}

	if (theKey == 27) { // ESC
		zoomOut(this, evt);
	}
}

////////////////////////////
//
// FADE Functions
//

function fadeOut(elem) {
	if (elem.id) {
		fadeElementSetup(elem.id, 100, 0, 10);
	}
}

function fadeIn(elem) {
	if (elem.id) {
		fadeElementSetup(elem.id, 0, 100, 10);	
	}
}

// Fade: Initialize the fade function

var fadeActive = new Array();
var fadeQueue  = new Array();
var fadeTimer  = new Array();
var fadeClose  = new Array();
var fadeMode   = new Array();

function fadeElementSetup(theID, fdStart, fdEnd, fdSteps, fdClose, fdMode) {

	// alert("Fading: "+theID+" Steps: "+fdSteps+" Mode: "+fdMode);

	if (fadeActive[theID] == true) {
		// Already animating, queue up this command
		fadeQueue[theID] = new Array(theID, fdStart, fdEnd, fdSteps);
	} else {
		fadeSteps = fdSteps;
		fadeCurrent = 0;
		fadeAmount = (fdStart - fdEnd) / fadeSteps;
		fadeTimer[theID] = setInterval("fadeElement('"+theID+"', '"+fadeCurrent+"', '"+fadeAmount+"', '"+fadeSteps+"')", 15);
		fadeActive[theID] = true;
		fadeMode[theID] = fdMode;
		
		if (fdClose == 1) {
			fadeClose[theID] = true;
		} else {
			fadeClose[theID] = false;
		}
	}
}

// Fade: Do the fade. This function will call itself, modifying the parameters, so
// many instances can run concurrently. Can fade using opacity, or fade using a box-shadow.

function fadeElement(theID, fadeCurrent, fadeAmount, fadeSteps) {

	if (fadeCurrent == fadeSteps) {

		// We're done, so clear.

		clearInterval(fadeTimer[theID]);
		fadeActive[theID] = false;
		fadeTimer[theID] = false;

		// Should we close it once the fade is complete?

		if (fadeClose[theID] == true) {
			document.getElementById(theID).style.visibility = "hidden";
		}

		// Hang on.. did a command queue while we were working? If so, make it happen now

		if (fadeQueue[theID] && fadeQueue[theID] != false) {
			fadeElementSetup(fadeQueue[theID][0], fadeQueue[theID][1], fadeQueue[theID][2], fadeQueue[theID][3]);
			fadeQueue[theID] = false;
		}
	} else {

		fadeCurrent++;
		
		// Now actually do the fade adjustment.
		
		if (fadeMode[theID] == "shadow") {

			// Do a special fade on the webkit-box-shadow of the object
		
			if (fadeAmount < 0) {
				document.getElementById(theID).style.webkitBoxShadow = shadowSettings + (Math.abs(fadeCurrent * fadeAmount)) + ')';
			} else {
				document.getElementById(theID).style.webkitBoxShadow = shadowSettings + (100 - (fadeCurrent * fadeAmount)) + ')';
			}
			
		} else {
		
			// Set the opacity depending on if we're adding or subtracting (pos or neg)
			
			if (fadeAmount < 0) {
				setOpacity(Math.abs(fadeCurrent * fadeAmount), theID);
			} else {
				setOpacity(100 - (fadeCurrent * fadeAmount), theID);
			}
		}

		// Keep going, and send myself the updated variables
		clearInterval(fadeTimer[theID]);
		fadeTimer[theID] = setInterval("fadeElement('"+theID+"', '"+fadeCurrent+"', '"+fadeAmount+"', '"+fadeSteps+"')", 15);
	}
}

////////////////////////////
//
// UTILITY functions
//

// Utility: Set the opacity, compatible with a number of browsers. Value from 0 to 100.

function setOpacity(opacity, theID) {

	var object = document.getElementById(theID).style;

	// If it's 100, set it to 99 for Firefox.

	if (navigator.userAgent.indexOf("Firefox") != -1) {
		if (opacity == 100) { opacity = 99.9999; } // This is majorly awkward
	}

	// Multi-browser opacity setting

	object.filter = "alpha(opacity=" + opacity + ")"; // IE/Win
	object.opacity = (opacity / 100);                 // Safari 1.2, Firefox+Mozilla

}

// Utility: Math functions for animation calucations - From http://www.robertpenner.com/easing/
//
// t = time, b = begin, c = change, d = duration
// time = current frame, begin is fixed, change is basically finish - begin, duration is fixed (frames),

function linear(t, b, c, d)
{
	return c*t/d + b;
}

function sineInOut(t, b, c, d)
{
	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
}

function cubicIn(t, b, c, d) {
	return c*(t/=d)*t*t + b;
}

function cubicOut(t, b, c, d) {
	return c*((t=t/d-1)*t*t + 1) + b;
}

function cubicInOut(t, b, c, d)
{
	if ((t/=d/2) < 1) return c/2*t*t*t + b;
	return c/2*((t-=2)*t*t + 2) + b;
}

function bounceOut(t, b, c, d)
{
	if ((t/=d) < (1/2.75)){
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)){
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)){
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
}


// Utility: Get the size of the window, and set myWidth and myHeight
// Credit to quirksmode.org

function getSize() {

	// Window Size

	if (self.innerHeight) { // Everyone but IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
		myScroll = window.pageYOffset;
	} else if (document.documentElement && document.documentElement.clientHeight) { // IE6 Strict
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
		myScroll = document.documentElement.scrollTop;
	} else if (document.body) { // Other IE, such as IE7
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
		myScroll = document.body.scrollTop;
	}

	// Page size w/offscreen areas

	if (window.innerHeight && window.scrollMaxY) {	
		myScrollWidth = document.body.scrollWidth;
		myScrollHeight = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight) { // All but Explorer Mac
		myScrollWidth = document.body.scrollWidth;
		myScrollHeight = document.body.scrollHeight;
	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		myScrollWidth = document.body.offsetWidth;
		myScrollHeight = document.body.offsetHeight;
	}
}

// Utility: Get Shift Key Status
// IE events don't seem to get passed through the function, so grab it from the window.

function getShift(evt) {
	var shift = false;
	if (! evt && window.event) {
		shift = window.event.shiftKey;
	} else if (evt) {
		shift = evt.shiftKey;
		if (shift) evt.stopPropagation(); // Prevents Firefox from doing shifty things
	}
	return shift;
}

// Utility: Find the Y position of an element on a page. Return Y and X as an array

function findElementPos(elemFind)
{
	var elemX = 0;
	var elemY = 0;
	do {
		elemX += elemFind.offsetLeft;
		elemY += elemFind.offsetTop;
	} while ( elemFind = elemFind.offsetParent )

	return Array(elemX, elemY);
}




// FancyZoomHTML.js - v1.0
// Used to draw necessary HTML elements for FancyZoom
//
// Copyright (c) 2008 Cabel Sasser / Panic Inc
// All rights reserved.

function insertZoomHTML() {

	// All of this junk creates the three <div>'s used to hold the closebox, image, and zoom shadow.
	
	var inBody = document.getElementsByTagName("body").item(0);
	
	// WAIT SPINNER
	
	var inSpinbox = document.createElement("div");
	inSpinbox.setAttribute('id', 'ZoomSpin');
	inSpinbox.style.position = 'absolute';
	inSpinbox.style.left = '10px';
	inSpinbox.style.top = '10px';
	inSpinbox.style.visibility = 'hidden';
	inSpinbox.style.zIndex = '525';
	inBody.insertBefore(inSpinbox, inBody.firstChild);
	
	var inSpinImage = document.createElement("img");
	inSpinImage.setAttribute('id', 'SpinImage');
	inSpinImage.setAttribute('src', zoomImagesURI+'zoom-spin-1.png');
	inSpinbox.appendChild(inSpinImage);
	
	// ZOOM IMAGE
	//
	// <div id="ZoomBox">
	//   <a href="javascript:zoomOut();"><img src="/images/spacer.gif" id="ZoomImage" border="0"></a> <!-- THE IMAGE -->
	//   <div id="ZoomClose">
	//     <a href="javascript:zoomOut();"><img src="/images/closebox.png" width="30" height="30" border="0"></a>
	//   </div>
	// </div>
	
	var inZoombox = document.createElement("div");
	inZoombox.setAttribute('id', 'ZoomBox');
	
	inZoombox.style.position = 'absolute'; 
	inZoombox.style.left = '10px';
	inZoombox.style.top = '10px';
	inZoombox.style.visibility = 'hidden';
	inZoombox.style.zIndex = '499';
	
	inBody.insertBefore(inZoombox, inSpinbox.nextSibling);
	
	var inImage1 = document.createElement("img");
	inImage1.onclick = function (event) { zoomOut(this, event); return false; };	
	inImage1.setAttribute('src',zoomImagesURI+'spacer.gif');
	inImage1.setAttribute('id','ZoomImage');
	inImage1.setAttribute('border', '0');
	// inImage1.setAttribute('onMouseOver', 'zoomMouseOver();')
	// inImage1.setAttribute('onMouseOut', 'zoomMouseOut();')
	
	// This must be set first, so we can later test it using webkitBoxShadow.
	inImage1.setAttribute('style', '-webkit-box-shadow: '+shadowSettings+'0.0)');
	inImage1.style.display = 'block';
	inImage1.style.width = '10px';
	inImage1.style.height = '10px';
	inImage1.style.cursor = 'pointer'; // -webkit-zoom-out?
	inZoombox.appendChild(inImage1);

	var inClosebox = document.createElement("div");
	inClosebox.setAttribute('id', 'ZoomClose');
	inClosebox.style.position = 'absolute';
	
	// In MSIE, we need to put the close box inside the image.
	// It's 2008 and I'm having to do a browser detect? Sigh.
	if (browserIsIE) {
		inClosebox.style.left = '-1px';
		inClosebox.style.top = '0px';	
	} else {
		inClosebox.style.left = '-15px';
		inClosebox.style.top = '-15px';
	}
	
	inClosebox.style.visibility = 'hidden';
	inZoombox.appendChild(inClosebox);
		
	var inImage2 = document.createElement("img");
	inImage2.onclick = function (event) { zoomOut(this, event); return false; };	
	inImage2.setAttribute('src',zoomImagesURI+'closebox.png');		
	inImage2.setAttribute('width','30');
	inImage2.setAttribute('height','30');
	inImage2.setAttribute('border','0');
	inImage2.style.cursor = 'pointer';		
	inClosebox.appendChild(inImage2);
	
	// SHADOW
	// Only draw the table-based shadow if the programatic webkitBoxShadow fails!
	// Also, don't draw it if we're IE -- it wouldn't look quite right anyway.
	
	if (! document.getElementById('ZoomImage').style.webkitBoxShadow && ! browserIsIE) {

		// SHADOW BASE
		
		var inFixedBox = document.createElement("div");
		inFixedBox.setAttribute('id', 'ShadowBox');
		inFixedBox.style.position = 'absolute'; 
		inFixedBox.style.left = '50px';
		inFixedBox.style.top = '50px';
		inFixedBox.style.width = '100px';
		inFixedBox.style.height = '100px';
		inFixedBox.style.visibility = 'hidden';
		inFixedBox.style.zIndex = '498';
		inBody.insertBefore(inFixedBox, inZoombox.nextSibling);	
	
		// SHADOW
		// Now, the shadow table. Skip if not compatible, or irrevelant with -box-shadow.
		
		// <div id="ShadowBox"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0"> X
		//   <tr height="25">
		//   <td width="27"><img src="/images/zoom-shadow1.png" width="27" height="25"></td>
		//   <td background="/images/zoom-shadow2.png">&nbsp;</td>
		//   <td width="27"><img src="/images/zoom-shadow3.png" width="27" height="25"></td>
		//   </tr>
		
		var inShadowTable = document.createElement("table");
		inShadowTable.setAttribute('border', '0');
		inShadowTable.setAttribute('width', '100%');
		inShadowTable.setAttribute('height', '100%');
		inShadowTable.setAttribute('cellpadding', '0');
		inShadowTable.setAttribute('cellspacing', '0');
		inFixedBox.appendChild(inShadowTable);

		var inShadowTbody = document.createElement("tbody");	// Needed for IE (for HTML4).
		inShadowTable.appendChild(inShadowTbody);
		
		var inRow1 = document.createElement("tr");
		inRow1.style.height = '25px';
		inShadowTbody.appendChild(inRow1);
		
		var inCol1 = document.createElement("td");
		inCol1.style.width = '27px';
		inRow1.appendChild(inCol1);  
		var inShadowImg1 = document.createElement("img");
		inShadowImg1.setAttribute('src', zoomImagesURI+'zoom-shadow1.png');
		inShadowImg1.setAttribute('width', '27');
		inShadowImg1.setAttribute('height', '25');
		inShadowImg1.style.display = 'block';
		inCol1.appendChild(inShadowImg1);
		
		var inCol2 = document.createElement("td");
		inCol2.setAttribute('background', zoomImagesURI+'zoom-shadow2.png');
		inRow1.appendChild(inCol2);
		// inCol2.innerHTML = '<img src=';
		var inSpacer1 = document.createElement("img");
		inSpacer1.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer1.setAttribute('height', '1');
		inSpacer1.setAttribute('width', '1');
		inSpacer1.style.display = 'block';
		inCol2.appendChild(inSpacer1);
		
		var inCol3 = document.createElement("td");
		inCol3.style.width = '27px';
		inRow1.appendChild(inCol3);  
		var inShadowImg3 = document.createElement("img");
		inShadowImg3.setAttribute('src', zoomImagesURI+'zoom-shadow3.png');
		inShadowImg3.setAttribute('width', '27');
		inShadowImg3.setAttribute('height', '25');
		inShadowImg3.style.display = 'block';
		inCol3.appendChild(inShadowImg3);
		
		//   <tr>
		//   <td background="/images/zoom-shadow4.png">&nbsp;</td>
		//   <td bgcolor="#ffffff">&nbsp;</td>
		//   <td background="/images/zoom-shadow5.png">&nbsp;</td>
		//   </tr>
		
		inRow2 = document.createElement("tr");
		inShadowTbody.appendChild(inRow2);
		
		var inCol4 = document.createElement("td");
		inCol4.setAttribute('background', zoomImagesURI+'zoom-shadow4.png');
		inRow2.appendChild(inCol4);
		// inCol4.innerHTML = '&nbsp;';
		var inSpacer2 = document.createElement("img");
		inSpacer2.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer2.setAttribute('height', '1');
		inSpacer2.setAttribute('width', '1');
		inSpacer2.style.display = 'block';
		inCol4.appendChild(inSpacer2);
		
		var inCol5 = document.createElement("td");
		inCol5.setAttribute('bgcolor', '#ffffff');
		inRow2.appendChild(inCol5);
		// inCol5.innerHTML = '&nbsp;';
		var inSpacer3 = document.createElement("img");
		inSpacer3.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer3.setAttribute('height', '1');
		inSpacer3.setAttribute('width', '1');
		inSpacer3.style.display = 'block';
		inCol5.appendChild(inSpacer3);
		
		var inCol6 = document.createElement("td");
		inCol6.setAttribute('background', zoomImagesURI+'zoom-shadow5.png');
		inRow2.appendChild(inCol6);
		// inCol6.innerHTML = '&nbsp;';
		var inSpacer4 = document.createElement("img");
		inSpacer4.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer4.setAttribute('height', '1');
		inSpacer4.setAttribute('width', '1');
		inSpacer4.style.display = 'block';
		inCol6.appendChild(inSpacer4);
		
		//   <tr height="26">
		//   <td width="27"><img src="/images/zoom-shadow6.png" width="27" height="26"</td>
		//   <td background="/images/zoom-shadow7.png">&nbsp;</td>
		//   <td width="27"><img src="/images/zoom-shadow8.png" width="27" height="26"></td>
		//   </tr>  
		// </table>
		
		var inRow3 = document.createElement("tr");
		inRow3.style.height = '26px';
		inShadowTbody.appendChild(inRow3);
		
		var inCol7 = document.createElement("td");
		inCol7.style.width = '27px';
		inRow3.appendChild(inCol7);
		var inShadowImg7 = document.createElement("img");
		inShadowImg7.setAttribute('src', zoomImagesURI+'zoom-shadow6.png');
		inShadowImg7.setAttribute('width', '27');
		inShadowImg7.setAttribute('height', '26');
		inShadowImg7.style.display = 'block';
		inCol7.appendChild(inShadowImg7);
		
		var inCol8 = document.createElement("td");
		inCol8.setAttribute('background', zoomImagesURI+'zoom-shadow7.png');
		inRow3.appendChild(inCol8);  
		// inCol8.innerHTML = '&nbsp;';
		var inSpacer5 = document.createElement("img");
		inSpacer5.setAttribute('src',zoomImagesURI+'spacer.gif');
		inSpacer5.setAttribute('height', '1');
		inSpacer5.setAttribute('width', '1');
		inSpacer5.style.display = 'block';
		inCol8.appendChild(inSpacer5);
		
		var inCol9 = document.createElement("td");
		inCol9.style.width = '27px';
		inRow3.appendChild(inCol9);  
		var inShadowImg9 = document.createElement("img");
		inShadowImg9.setAttribute('src', zoomImagesURI+'zoom-shadow8.png');
		inShadowImg9.setAttribute('width', '27');
		inShadowImg9.setAttribute('height', '26');
		inShadowImg9.style.display = 'block';
		inCol9.appendChild(inShadowImg9);
	}

	if (includeCaption) {
	
		// CAPTION
		//
		// <div id="ZoomCapDiv" style="margin-left: 13px; margin-right: 13px;">
		// <table border="1" cellpadding="0" cellspacing="0">
		// <tr height="26">
		// <td><img src="zoom-caption-l.png" width="13" height="26"></td>
		// <td rowspan="3" background="zoom-caption-fill.png"><div id="ZoomCaption"></div></td>
		// <td><img src="zoom-caption-r.png" width="13" height="26"></td>
		// </tr>
		// </table>
		// </div>
		
		var inCapDiv = document.createElement("div");
		inCapDiv.setAttribute('id', 'ZoomCapDiv');
		inCapDiv.style.position = 'absolute'; 		
		inCapDiv.style.visibility = 'hidden';
		inCapDiv.style.marginLeft = 'auto';
		inCapDiv.style.marginRight = 'auto';
		inCapDiv.style.zIndex = '501';

		inBody.insertBefore(inCapDiv, inZoombox.nextSibling);
		
		var inCapTable = document.createElement("table");
		inCapTable.setAttribute('border', '0');
		inCapTable.setAttribute('cellPadding', '0');	// Wow. These honestly need to
		inCapTable.setAttribute('cellSpacing', '0');	// be intercapped to work in IE. WTF?
		inCapDiv.appendChild(inCapTable);
		
		var inTbody = document.createElement("tbody");	// Needed for IE (for HTML4).
		inCapTable.appendChild(inTbody);
		
		var inCapRow1 = document.createElement("tr");
		inTbody.appendChild(inCapRow1);
		
		var inCapCol1 = document.createElement("td");
		inCapCol1.setAttribute('align', 'right');
		inCapRow1.appendChild(inCapCol1);
		var inCapImg1 = document.createElement("img");
		inCapImg1.setAttribute('src', zoomImagesURI+'zoom-caption-l.png');
		inCapImg1.setAttribute('width', '13');
		inCapImg1.setAttribute('height', '26');
		inCapImg1.style.display = 'block';
		inCapCol1.appendChild(inCapImg1);
		
		var inCapCol2 = document.createElement("td");
		inCapCol2.setAttribute('background', zoomImagesURI+'zoom-caption-fill.png');
		inCapCol2.setAttribute('id', 'ZoomCaption');
		inCapCol2.setAttribute('valign', 'middle');
		inCapCol2.style.fontSize = '14px';
		inCapCol2.style.fontFamily = 'Helvetica';
		inCapCol2.style.fontWeight = 'bold';
		inCapCol2.style.color = '#ffffff';
		inCapCol2.style.textShadow = '0px 2px 4px #000000';
		inCapCol2.style.whiteSpace = 'nowrap';
		inCapRow1.appendChild(inCapCol2);
		
		var inCapCol3 = document.createElement("td");
		inCapRow1.appendChild(inCapCol3);
		var inCapImg2 = document.createElement("img");
		inCapImg2.setAttribute('src', zoomImagesURI+'zoom-caption-r.png');
		inCapImg2.setAttribute('width', '13');
		inCapImg2.setAttribute('height', '26');
		inCapImg2.style.display = 'block';
		inCapCol3.appendChild(inCapImg2);
	}
}