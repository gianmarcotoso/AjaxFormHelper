/*
LICENSE
========================================================
Copyright (c) 2013 Gian Marco Toso

Permission is hereby granted, free of charge, to any person 
obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the 
Software, and to permit persons to whom the Software is furnished to 
do so, subject to the following conditions:

The above copyright notice and this permission notice shall be 
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR 
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
========================================================
*/

(function( $ ) {
	var methods = {
		init: function(options) {
			$(this).ajaxFormHelper( 'update', options );
			
			$(this).submit(function() {
				var data = $(this).data('ajaxFormHelper').data;
				
				var validationResult = $(this).ajaxFormHelper( 'validate' );
			
				if (validationResult === true) {
					if (data.validationSuccess) 
						data.validationSuccess.call(this);
						
					$(this).ajaxFormHelper( 'upload' );	
				} else {
					if (data.validationFailed) 
						data.validationFailed.call(this, validationResult);
				}
			
				return false; 
			});
						
			$('input[data-role="abort"]', $(this)).click(function() { $(this).ajaxFormHelper( 'abort' ) }.bind(this));
		},
		
		validate: function() {
			var data = $(this).data('ajaxFormHelper').data;
			var failed = new Array();
			
			for (var name in data.validateFields) {
				var input = data.validateFields[name].input;
			
				if (data.validateFields[name].validate && !data.validateFields[name].validate($(input).attr('type') == "file" ? input.files : $(input).val()))
					failed.push(input);
			}
			
			return failed.length == 0 ? true : failed;
		},
		
		update: function(options) {
			if (typeof options === "undefined") options = {};
			oldData = $(this).data('ajaxFormHelper') ? $(this).data('ajaxFormHelper').data : {};			
			
			var data = {
				method : options.method || oldData.method || $(this).attr('method'),	
				url : options.url || oldData.url || $(this).attr('action'),
				dataType: options.dataType || oldData.dataType || $(this).attr('data-type') || 'json',
				success : options.success || oldData.success || window[$(this).attr('data-success')] || function(data, status, xhr) { $(this).ajaxFormHelper( 'success' , data, status, xhr ) } ,
				progress : options.progress || oldData.progress || window[$(this).attr('data-progress')] || function(e) { $(this).ajaxFormHelper( 'progress', e ) },
				error: options.error || oldData.error || window[$(this).attr('data-error')] || function(xhr) { $(this).ajaxFormHelper( 'error' , xhr ) },
				beforeSend: options.beforeSend || oldData.beforeSend || window[$(this).attr('data-beforeSend')] || function() { $(this).ajaxFormHelper( 'beforeSend' ) },
				
/* 				VALIDATION */
				validationFailed: options.validationFailed || oldData.validationFailed || window[$(this).attr('data-validationFailed')] || null,
				validationSuccess: options.validationSuccess || oldData.validationSuccess || window[$(this).attr('data-validationSuccess')] || null,
				validateFields: options.validateFields || oldData.validateFields || null,
			}
			
			// Setup data.validateFields if not set in options
			if (!data.validateFields) {
				data.validateFields = new Array();
				var inputs = $('input,textarea,select', $(this));
				
				$.each(inputs, function() {
					if (!$(this).attr('data-validate')) return;
					
					data.validateFields[$(this).attr('name')] = {
						validate: window[$(this).attr('data-validate')].bind(this),
						input: this
					};
				});
			}
			
			$(this).data('ajaxFormHelper', {
				target: this,
				data: data
			});
		}, 
			
		upload: function() {
			var data = $(this).data('ajaxFormHelper').data;
			
			var fileInputs = $('input[type="file"]', $(this));
			var fd = new FormData();
			
			$.each($('input[type="file"]', $(this)), function() {
				var files = $(this)[0].files;
				var fileData = new Array();
				var inputName = $(this).attr('name');
				
				if (files.length == 1) {
					fd.append(inputName, files[0]);
				} else {
					for (var i = 0; i < files.length; i++) {
						fd.append(inputName + "[" + i + "]", files[i]);
					}
				}
			});
			
			var post = $(this).serializeArray();
	
			for (var key in post) {
				fd.append(post[key].name, post[key].value);
			}
			
			var request = $.ajax({
				url: data.url,
				type: data.method,
				data: fd,
				dataType: data.dataType,
				processData: false,
				contentType: false,
				beforeSend: data.beforeSend.bind(this),
				success: data.success.bind(this),
				error: data.error.bind(this),
				progress: data.progress.bind(this)
			});
			
			$(this).data('ajaxFormHelper', {
				target: this,
				data: data,
				request: request
			});
		},
		
		abort: function() {
			var request = $(this).data('ajaxFormHelper').request;
			
			if (request) {
				request.abort();
			}		
		},
		
		beforeSend: function() { 
			// This default function does nothing, but you can override it!
		},
		
		progress: function(e) {
/*
			This is how you calculate the progress completion percentage:

			if(e.lengthComputable) {
            	var pct = (e.loaded / e.total) * 100;
            	
            	... do something with pct. You might want to round it down
            	using Math.floor(pct * 100) / 100 or something like that
            }
*/

			// This default function does nothing, but you can override it!
        },
        
        error: function(xhr) {
	        // This default function does nothing, but you can override it!
        },
        
        success: function(data, status, xhr) {
	        // This default function does nothing, but you can override it!
        }
	}

	$.fn.ajaxFormHelper = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.ajaxFormHelper' );
		}
	};
})( jQuery );

$(document).ready(function() {
	$.each($('form[data-ajax="true"]'), function() { $(this).ajaxFormHelper() });
});

/* 
	This snippet of code was taken from https://github.com/englercj/jquery-ajax-progress  
	It adds the progress event to jQuery.ajax so that we can track the status of the upload
*/
(function($, window, undefined) {
    //patch ajax settings to call a progress callback
    var oldXHR = $.ajaxSettings.xhr;
    $.ajaxSettings.xhr = function() {
        var xhr = oldXHR();
        if(xhr instanceof window.XMLHttpRequest) {
            xhr.addEventListener('progress', this.progress, false);
        }
        
        if(xhr.upload) {
            xhr.upload.addEventListener('progress', this.progress, false);
        }
        
        return xhr;
    };
})(jQuery, window);
