(function ($){
	var pluginName = "popover",
		$doc = $(document),
		$body = $(document.body)


	//Popover class
	var Popover = function (el, opts){
		this.target = $(el);
		this.create(opts)
	}


	//Static thing
	$.extend(Popover, {
		defaults: {
			animDuration: null,
			animInClass: "in",
			animOutClass: "out",
			animClass: "animated",

			activeClass: "active",

			content: 'None', //Element, jquery-object, html-string, function atc			
			container: $body, //Where to place in
			targets: null, //selector, array of objects etc. Synonims of current target

			type: "tooltip", //tooltip, popover, overlay, dropdown, custom
			types: {
				//some_type: { "event [target|container|close|outside|selector] delay": show }
				tooltip: {
					"mouseenter target 200": "show",
					"mouseleave target 200": "hide"
				},
				popover: {					
					"mouseenter target 50": "show",
					"click target 0": "show",
					"mouseenter container 0": "show",
					"mouseleave target 200": "hide",
					"mouseleave container 200": "hide"					
				},
				overlay: {					
					"click target 0": "show",
					"click outside": "hide",
					"click close 0": "hide"					
				},
				dropdown: {
					"mouseenter container 0": "show",
					"click target 0": "trigger",
					"click outside": "hide",
					"mouseleave container 1000": "hide",
					"mouseleave target 1000": "hide"
				}
			},

			close: false,
			closeText: "x",

			overlay: false,

			placing: "horizontal",
			tip: true,

			avoid: null, //selector of elements to avoid overlapping with

			//Callbacks
			show: undefined,
			hide: undefined,
			beforeShow: undefined,
			beforeHide: undefined
		}
	})


	//Instance thing
	$.extend(Popover.prototype, {
		create: function (opts) {
			var self = this,
				o = self.options = $.extend({}, Popover.defaults, opts);

			self.timeouts = {};

			self.hideOnClickOutside = false;

			//Initial content comprehension
			o.content = o.content.trim();
			if (o.content[0] == '.' || o.content[0] == '#') {
				o.content = $(o.content);
			}

			self.target.addClass(pluginName + "-target");
			self.container = $(self.containerTpl({
				name: pluginName
			}))
			.append(o.content)
			.attr('hidden', true)
			.addClass([pluginName] + "-" + o.type)
			.appendTo(o.container);

			if (o.animDuration){ //set duration through options
				self.setAnimDuration(o.animDuration);
			} else { //get duration from css
				o.animDuration = self.getAnimDuration();
			}

			self.bindEvents();

			return self;
		},

		bindEvents: function(){
			var self = this, o = self.options;
			if (!o.types[o.type]) return console.log("Not existing type of popover: " + o.type)
			var bindings = o.types[o.type];

			for (var bindStr in bindings){
				self.bindString(bindStr, self[bindings[bindStr]])
			}

			return self;
		},

		bindString: function(bindStr, meth){
			var self = this, o = self.options;
			var props = bindStr.split(" "),
				evt = props[0], selector = props[1], delay = props[2];

			switch (selector) {
				case "outside": //only click outside supported
					self.hideOnClickOutside = true;
					return;
				case "target":
					selector = self.target;
					break;
				case "container":
					selector = self.container;
					break;
				case "close":
					selector = $("." + pluginName + "-close", self.container);
					break;
				default:
					selector = $(selector);
			}

			if (!delay) {
				selector.on(evt, meth.bind(self) );
			} else {
				selector.on(evt, function() { self.delayedCall(meth.bind(self), delay) } );
			}
		},

		//Call method after @delay ms.
		delayedCall: function(fn, delay, key){
			var self = this;
			key == null && (key = 'none')
			clearTimeout(self.timeouts[key])
			self.timeouts[key] = setTimeout(fn, delay)
		},

		setAnimDuration: function(dur){
			var self = this, o = self.options;
			dur == null && (dur = o.animDuration);
			dur += "ms";
			self.container.css({
				'-webkit-animation-duration': dur,
				'-khtml-animation-duration': dur,
				'-moz-animation-duration': dur,
				'-o-animation-duration': dur,
				'animation-duration': dur
			})

			return self;
		},

		getAnimDuration: function(){
			var self = this, o = self.options;

			var dur = self.container.css("animation-duration") ||
			self.container.css("-webkit-animation-duration") ||
			self.container.css("-moz-animation-duration") ||
			self.container.css("-o-animation-duration") ||
			self.container.css("-khtml-animation-duration");

			var unit = dur.slice(-2);
			if (unit == "ms"){
				dur = parseInt(dur)
			} else {
				dur = parseFloat(dur) * 1000
			}
			console.log(dur)
			return dur;
		},

		//API
		show: function(){
			var self = this, o = self.options;

			if (self.target.hasClass(o.activeClass) && !self.container.hasClass(o.animOutClass)){
				return self;
			}

			self.container
			.removeAttr('hidden')
			.addClass(o.animClass + " " + o.animInClass)
			.removeClass(o.animOutClass);

			self.move();

			self.delayedCall(function(){
				self.container.removeClass(o.animClass + " " + o.animInClass);
			}, o.animDuration, "anim");
			
			self.target.addClass(o.activeClass);

			//Handle outside click
			if (self.hideOnClickOutside){
				$doc.on("click.outside."+pluginName, function(e) {
					if (e.target === self.container[0] || e.target === self.target[0]) {
						return;
					}
					self.hide();
				});
			}

			console.log("show")

			return self;
		},

		hide: function(){
			var self = this, o = self.options;

			if (!self.target.hasClass(o.activeClass) && !self.container.hasClass(o.animInClass)){
				return self;
			}

			self.container
			.addClass(o.animClass + " " + o.animOutClass)
			.removeClass(o.animInClass);


			self.delayedCall(function(){
				self.container
				.removeClass(o.animClass + " " + o.animOutClass)
				.attr('hidden', true);
			}, o.animDuration, "anim");

			self.target.removeClass(o.activeClass);

			if (self.hideOnClickOutside) $doc.off("click.outside."+pluginName)

			//console.log("hide")

			return self;
		},

		trigger: function(){
			var self = this, o = self.options;

			if (self.target.hasClass(o.activeClass)) {
				self.hide();
			} else {
				self.show();
			}

			return self;
		},


		move: function(){
			var self = this, o = self.options;

			var pos = self.target.position();

			self.container.css({
				'left':pos.left + 'px',
				'top':pos.top - self.container.height() + 'px'
			});

			return self;
		},

		//Rendering
		containerTpl: function (opts) {
			opts == null && (opts = {name: pluginName})
			return '<div class="' + opts.name + '-container"/>'
		}
	})


	//Plugin. 
	$.fn[pluginName] = function (arg, arg2) {
		if (typeof arg == "string") {//Call API method
			return $(this).each(function (i, el) {
				$(el).data(pluginName)[arg](arg2);
			})
		} else {//Init this
			return $(this).each(function (i, el) {
				var po = new Popover(el, arg);
				if (!$(el).data(pluginName)) $(el).data(pluginName, po);
			})			
		}
	}


	//Simple options parser. The same as $.fn.data(), or element.dataset but for zepto	
	if (!$.parseDataAttributes) {		
		$.parseDataAttributes = function(el) {
			var data = {};
			if (el.dataset) {
				$.extend(data, el.dataset);
			} else {
				[].forEach.call(el.attributes, function(attr) {
					if (/^data-/.test(attr.name)) {
						var camelCaseName = attr.name.substr(5).replace(/-(.)/g, function ($0, $1) {
						    return $1.toUpperCase();
						});
						data[camelCaseName] = attr.value;
					}
				});
			}
			return data;
		}
	}

	//Autolaunch
	//Possible options location: preinit [Popover] object of the window, data-attributes, passed options.
	$(function () {
		var name = window[pluginName] && window[pluginName].defaultClass || pluginName;
		$("." + pluginName).each(function (i, e){
			var $e = $(e),
				opts = $.extend(window[pluginName] || {}, $.parseDataAttributes(e));
			$e[pluginName](opts);
		});
	});

})(window.jQuery || window.Zepto);