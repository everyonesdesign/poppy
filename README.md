# Poppy [demo](http://dfcreative.github.io/poppy)

Popups provider.


## Use

```
npm install poppy
```

```html
<script src="poppy/popup.js"></script>

<a data-popup href="#popup">Show</a>
<div id="popup">Content to show</div>
```

You can also browserify stuff:

```
var Popup = require('poppy/popup');
```


## Kinds of popups

* popup
* tooltip
* overlay
* dropdown
* fullscreen
* modal
* zoom
* blind
* notification
* sideMenu
* dialog
* imageZoomer
* popover


## License

MIT