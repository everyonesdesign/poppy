var Poppy = require('../index');
var Mod = window.Mod || require('mod-constructor');
var place = require('placer');
var extend = require('extend');


/**
 * Dropdown component - as you used to know it
 *
 * @constructor
 * @extends {Poppy}
 * @module dropdown
 */

var Dropdown = module.exports = Poppy.extend();


/** Parent component name to use as class identifier */
var name = Poppy.displayName;


var proto = Dropdown.prototype;


proto.created = function(){
	// console.log('dropdown created');
};


/**
 * Add dropdown class to the container
 */

proto.$container.changed = function($container){
	$container.classList.add(name + '-dropdown');
};


/**
 * Behaviour
 */

proto.state.hidden = {
	'click': 'show'
	//TODO: preventDefault
};
extend(proto.state.visible, {
	'document click:not(.poppy-dropdown)': 'hide'
});


/**
* Dropdowns are usually placed below the element, except for border cases
*/

proto.alignment.init = 0.5;

proto.place = function(){
	var side = 'bottom';

	place(this.$container, {
		relativeTo: this,
		side: side,
		within: this.holder,
		align: this.alignment
	});
	this.tip = 'top';


	//if placing bottom failed, try to place top (too close to the bottom of the page)
	var containerRect = this.$container.getBoundingClientRect();
	var thisRect = this.getBoundingClientRect();

	if (containerRect.bottom > window.innerHeight) {
		if (containerRect.height < thisRect.top) {
			side = 'top';
			place(this.$container, {
				relativeTo: this,
				side: side,
				within: this.holder,
				align: this.alignment
			});
			this.tip = 'bottom';
		}

		//if placing top failed, show the popup instead
		else {
			this.tip = false;
			side = 'center';
			place(this.$container, {
				relativeTo: window,
				side: side
			});
		}
	}


	return this;
};


/**
 * Show dropdown tip by default
 */

proto.tip.init = true;


/**
 * Autoinit instances.
 *
 * @see Use [selector-observer]{@link https://www.npmjs.org/package/selector-observer}
 *      if you want to init items dynamically. *
 */

document.addEventListener("DOMContentLoaded", function() {
	var items = document.querySelectorAll('[data-dropdown]');
	for(var i = items.length; i--;){
		new Dropdown(items[i]);
	}
});