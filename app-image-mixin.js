
/**
  * `AppImageMixin`
  * 
  *   Logic that is common amongst 'app-images' elements.
  *
  *
  *
  *  Properites:
  *
  *
  *    
  *
  *
  *
  *
  *
  *
  * @customElement
  * @polymer
  * @demo demo/index.html
  *
  **/


export const AppImageMixin = superClass => {
  return class AppImageMixin extends superClass {    


	  static get properties() {
	    return {	      

	      // Image alt tag.
	      alt: {
	        type: String,
	        value: ''
	      },

	      error: Boolean,

	      loaded: Boolean,

	      // Disable opacity transitions.
	      noFade: Boolean,

	      // Image sizing type.
	      sizing: {
	        type: String,
	        value: 'cover' // or 'contain'
	      },

	      // 'app-image' - URL String, or 
	      //							 an image Object from webpack 'resonsive-loader' or
	      // 							 a file item Object originating from use of 'app-file-system'.
	      //
	      // 'lazy-image' - Full quality image url string.
	      //
	      // 'responsive-image' - Image object from webpack responsive-loader import.
	      src: Object,

	      // The distance in pixels to pad
	      // to the carousel trigger threshold.
	      // For instance, 0 would mean that the
	      // next lazy image would not start to download
	      // until a single pixel intersects the edge of
	      // the carousel.
	      // Or 128 means that the image would start to
	      // download 128px before the next image comes
	      // into view.
	      trigger: {
	        type: Number,
	        value: 0
	      },

	      _aspect: {
	        type: Number,
	        computed: '__computeAspect(_naturalHeight, _naturalWidth)'
	      },

	      // To be overwritten by implementation.
	      _elementType: {
	      	type: String,
	      	value: 'app-image',
	      	readOnly: true
	      },

	      _height: Number,

	      _naturalHeight: Number,

	      _naturalWidth: Number,

	      _resizeObserver: Object,

	      // To be set or overwritten by implementation.
	      _shouldResize: Boolean,

	      _width: Number

	    };
	  }


	  static get observers() {
	    return [
	      '__altSrcChanged(alt, src)',
	      '__aspectWidthChanged(_aspect, _width)',
	      '__errorChanged(error)',
	      '__loadedChanged(loaded)',
	      '__shouldResizeChanged(_shouldResize)',
	      '__srcObjChanged(src)'
	    ];
	  }


	  disconnectedCallback() {
	  	super.disconnectedCallback();

	  	this.__cleanUpObserver();
	  }


	  __computeAspect(height, width) {
	    if (!height || !width) { return; }

	    return width / height;
	  }


	  __altSrcChanged(alt, src) {
	    if (!alt && (src && src !== '#')) {
	      console.warn(this, ` Missing alt tag for ${src}`);
	    } 
	  }	 

	  
	  __aspectWidthChanged(aspect, width) {
	    if (!aspect || !width) { return; }

	    this.style['height'] = `${width / aspect}px`;
	  } 


	  __errorChanged(error) {
	    this.fire(`${this._elementType}-error-changed`, {value: error});
	  }


	  __loadedChanged(loaded) {
	    this.fire(`${this._elementType}-loaded-changed`, {value: loaded});
	  }


	  __shouldResizeChanged(should) {

	  	if (should) {

	  		// No need to start a new observer.
	  		if (this._resizeObserver) { return; }

	  		this._resizeObserver = new ResizeObserver(entries => {

	  			if (!entries || !entries[0]) { return; }	  			

	  			const {height, width} = entries[0].contentRect;

	  			this._height = height;
	  			this._width  = width;
	  		});

	  		this._resizeObserver.observe(this);
	  	}
	  	else {
	  		this.__cleanUpObserver();
	  	}
	  }

	  // CANNOT use a computed for this since these properties are
	  // set directly but asynchronously in 'lazy-image'.
	  __srcObjChanged(src) {
	  	if (!src || typeof src !== 'object') { return; }

	  	const {height, width} = src;

	  	this._naturalHeight = height;
	  	this._naturalWidth 	= width;
	  }


	  __cleanUpObserver() {
	  	if (this._resizeObserver) {
	  		this._resizeObserver.disconnect();
	  		this._resizeObserver = undefined;
	  	}
	  }	 

  };
};
