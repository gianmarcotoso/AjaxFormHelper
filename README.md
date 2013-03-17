JAM! AJAX FORM HELPER
================

## Description

Jam! Ajax Form Helper is a simple plugin for jQuery that allows you to ajaxify a form in an almost codeless way. It takes care of setting things up so that the form is submitted to the server using AJAX, and an event is fired when the server replies (with an error or a success message). It will also report back the progress status, so that you can use some kind of indicator to give feedback to the user, and supports file upload as well (single and multiple).

Tested working on: Safari 6, Firefox 19, Chrome 25, IE 10, Mobile Safari (iPad with iOS 6.1.2) 
Does not work on: IE 6,7,8 and 9.

You can find a live, working example on my website, here: http://www.gianmarcotoso.com/projects/jam-ajax-form-helper/

## Requirements

This plugin requires at least jQuery 1.9. I have not tested it with 2.0 and I've not been successful with 1.8.3 but I might get results with a little fiddling. It also requires the doctype of the document to be HTML5 compliant, since data attributes are used quite extensively. 

## How to use it!

### Simple usage, step by step

*Step 1*. Include the JS in your HTML document, after jQuery. For example:
``` html
<script type="text/javascript" src="http://code.jquery.com/jquery.js"></script>
... other scripts ...
<script type="text/javascript" src="/js/jam-ajaxformhelper.js"></script>
```

*Step 2*. Add markup to a form, like this:
```html
<form 
  action="/path/to/action/"
	method="post"
	data-ajax="true"
	data-success="mySuccessFunction"
	data-error="myErrorFunction"
>
	<input name="anInput" type="text" value="" placeholder="Some Input..." />
	<textarea name="anotherInput" placeholder="Some long text"></textarea>
	<input type="submit" value="Go!" />
</form>
```

*Step 3*. Write an UI update behavior to be fired when the form is successfully submitted, or when an error occurs:
```javascript
function mySuccessFunction(data, status, xhr) {
	alert("Success!");
}

function myErrorFunction(xhr) {
	console.log(xhr);
	alert("Error!");
}
```
*Step 4*. Enjoy! :)

Remember, if your javascript has errors, the form will *not* be submitted with ajax. Double check your syntax!

### Uploading Files, the AJAX way.

Since XMLHTTPRequest 2.0 it's possible to send files alongside post data through an AJAX request, and get a report of the progress as an added bonus. This usually requires some code to be written, and even though jQuery supports some of it, it requires a little work. This plugin takes care of all that (using the code from https://github.com/englercj/jquery-ajax-progress to add the progress event to the jQuery.ajax call). This is how you would handle a form that uploads a file, HTML side:

```html
<form 
	action="/path/to/action/"
	method="post"
	enctype="multipart/form-data"
	data-ajax="true"
	data-success="mySuccessFunction"
	data-error="myErrorFunction"
	data-progress="myProgressFunction"
	data-beforeSend="myBeforeSendFunction"
>
	<input name="anInput" type="text" value="" placeholder="Some Input..." />
	<textarea name="anotherInput" placeholder="Some long text"></textarea>
	<input type="file" name="aFile" />
	<input type="submit" value="Go!" />
</form>
```

As you can see, alongside the file input, two data attributes have been added: one that points to a function that handles the progress, and another to a function that gets called just before the AJAX request is submitted. Neither one is mandatory, so you could just have added the file input and called it a day, but when life gives you lemons...

```javascript
function myProgressFunction(e) {
	// This code is taken straight from https://github.com/englercj/jquery-ajax-progress
	if (e.lenghtComputable) {
		if(e.lengthComputable) {
            var pct = (e.loaded / e.total) * 100;
            
            // I just print the progress to the console, but you can (and should!) use it to update a progressbar or something like that.
            console.log(pct);	
        }
	}
}

function myBeforeSendFunction() {
	// Do something to reset the UI. Show the progressbar, disable some controls, etc...
}
```

The server will receive a perfectly standard post request. If you're using PHP as I do, your $_POST array is going to be populated with the values of the various inputs, and the $_FILES array is going to contain the uploaded files. The plugin supports both single and multiple file uploading, and can handle as many file inputs as you want. If you want to add a button to cancel the upload while it's in progress, you can do so by using the data-role="abort" in a button or input. The abort event will call the error function, you can check the response status to determine whether the error was due to an user triggered event or something else.

### Validation

Validation is a very important part when designing forms. This plugin supports validation on a per-input basis, and will submit the form only if everything goes smoothly. Validation is not mandatory (although you should always validate the data on the server) and can be used for as many inputs as you like. Here's how to do it:

```html
<form 
	action="/path/to/action/"
	method="post"
	enctype="multipart/form-data"
	data-ajax="true"
	data-success="mySuccessFunction"
	data-error="myErrorFunction"
	data-progress="myProgressFunction"
	data-beforeSend="myBeforeSendFunction"

	data-validationSuccess="myValidationSuccess"
	data-validationFailed="myValidationFailed"
>
	<input name="anInput" type="text" value="" placeholder="Some Input..." data-validate="validateText" />
	<textarea name="anotherInput" placeholder="Some long text"></textarea>
	<input type="file" name="aFile" data-validate="validateFiles" />
	<input type="submit" value="Go!" />
</form>
```

As you can see, the form has two new data attributes: one contains a pointer to a function that gets called in the event that the validation process succeeds (before the beforeSend event), and another that contains a pointer to a function that gets called when validation fails. The inputs inside the form get individually validated when they have a valid data-validate attribute, pointing to a function that handles the validation. These validation functions are completely up to you, but here's an example:

```javascript
function myValidationSuccess() {
	console.log("Everything is fine, submitting...");
} 

function myValidationFailed(inputs) {
	console.log("Validation failed on these inputs:");
	console.log(inputs);
}

funciton validateText(text) {
	return text.match(/[a-z]+/i);
}

function validateFiles(files) {
	// If no files are present validation passes.

    for (var i = 0; i < files.length; i++)
    	if (!files[i].type.match(/(jpeg|png|gif)$/i)) 
    		return false;
    
    return true;
}
```
And that's pretty much it. Now for some in-depth documentation about functions, javascript, life, the universe and everything...

## Documentation

### Data Attributes

As detailed in the previous section, this plugin makes heavy use of data attributes. These attributes do nothing more than represent the same options you could use to initialize the plugin with a JavaScript call, although with some limitations. Each and every one of them is optional. Here's a roundup of the data-attributes and their use:

<table>
  <tr>
    <th>data-attribute</th><th>What's it for?</th><th>Function Prototype (pseudocode)</th><th>Limitations</th>
  </tr>
  <tr>
    <td>data-ajax</td><td>Tells the plugin that you want to apply it to this form. If this is not present, the form will not be touched by the plugin when the document is loaded, but you can still use the other data attributes for later use.</td><td></td><td></td>
  </tr>
  <tr>
    <td>data-success</td><td>Contains a pointer to the function that gets called when the AJAX request is completed successfully</td><td>function successFunction((returned data)data, (request status)status, (xmlhttprequest)xhr)</td><td>Must be a function pointer to a global function</td>
  </tr>
  <tr>
    <td>data-error</td><td>Contains a pointer to the function that gets called when the AJAX request returns with an error</td><td>function errorFunction((xmlhttprequest)xhr)</td><td>Must be a function pointer to a global function</td>
  </tr>
  <tr>
    <td>data-beforeSend</td><td>Contains a pointer to the function that gets called when the before the AJAX request is submitted</td><td>function beforeSendFunction()</td><td>Must be a function pointer to a global function</td>
  </tr>
  <tr>
    <td>data-progress</td><td>Contains a pointer to the function that gets called whenever the AJAX request progress updated</td><td>function progressFunction((progress event)event)</td><td>Must be a function pointer to a global function</td>
  </tr>
  <tr>
    <td>data-validationFailed</td><td>Contains a pointer to the function that gets called when the input validation fails</td><td>function validationFaliledFunction((failed)inputs)</td><td>Must be a function pointer to a global function</td>
  </tr>
  <tr>
    <td>data-validationSuccess</td><td>Contains a pointer to the function that gets called when the input validation succeeds</td><td>function validationSuccessFunction()</td><td>Must be a function pointer to a global function</td>
  </tr>
  <tr>
    <td>data-validate</td><td>Contains a pointer to the function that gets called to validate the single input</td><td>function validationFunction((input value or files list)value)</td><td>Must be a function pointer to a global function</td>
  </tr>
  <tr>
    <td>data-role</td><td>If placed on a button or an input with the "abort" value, it makes it behave as an abort button. For now there are no other uses. The abort event calls the error function.</td><td></td><td>Must be "abort"</td>
  </tr>
</table>

*All these functions set JavaScript's `this` keyword to the form on which the plugin is operating.*

As you can see, you are limited to global functions only. To avoid this limitation, you can decide not to use data-attributes and initialize the plugin through Javascript instead, like this:

```javascript
function initMyForm(form) {
	$(form).ajaxFormHelper(options);
}
```

The `options` parameter is a JSON object that can contain the following data:

<table>
	<tr>
		<th>Option</th><th>Description</th><th>Default</th>
	</tr>
	<tr>
		<td>url</td><td>Indicates to what URL the AJAX request must be sent</td><td>The form's `action` attribute</td>
	</tr>
	<tr>
		<td>method</td><td>Indicates wether the request is GET or POST request</td><td>The form's `method` attribute</td>
	</tr>
	<tr>
		<td>dataType</td><td>Tells the plugin if the type of the data returned by the server</td><td>json</td>
	</tr>
	<tr>
		<td>success</td><td>The pointer to the function called upon the success event</td><td>Empty function</td>
	</tr>
	<tr>
		<td>error</td><td>The pointer to the function called upon the error event</td><td>console.log(xhr)</td>
	</tr>
	<tr>
		<td>beforeSend</td><td>The pointer to the function called before submitting the request</td><td>Empty function</td>
	</tr>
	<tr>
		<td>progress</td><td>The pointer to the function called when the request's status is updated</td><td>Empty function</td>
	</tr>
	<tr>
		<td>validationFailed</td><td>The pointer to the function called when validation fails</td><td>Empty function</td>
	</tr>
	<tr>
		<td>validationSuccess</td><td>The pointer to the function called when validation succeeds</td><td>Empty function</td>
	</tr>
	<tr>
		<td>validationFields</td><td>A JSON object containing a pointer to each field's validation function (where present) and the the field itself</td><td>Empty Object</td>
	</tr>
</table>

The `validationFields` element contains many elements that must all have the following attributes:

<table>
	<tr>
		<td>validate</td><td>The pointer to the function called to validate the input</td><td>null</td>
	</tr>
	<tr>
		<td>input</td><td>The pointer to the input itself</td><td>null</td>
	</tr>
</table>

Let this example speak for itself:

```javascript
function initMyForm(form) {
	$(form).ajaxFormHelper({
		url: '/path/to/action',
		method: 'post',
		dataType: 'json',

		success: someObject.success,
		error: someObject.error,
		beforeSend: someObject.beforeSend,
		progress: someObject.progress,

		validationFailed: validationHelper.fail,
		validationSuccess: validationHelper.success,
		validationFields: {
			anInput: {
				validate: validationHelper.textValidator,
				input: document.getElementById('anInput')
			},

			anotherInput: {
				validate: validationHelper.emailValidator,
				input: document.getElementById('anotherInput')
			},

			fileInput: {
				validate: validationHelper.imageValidator,
				input: document.getElementById('fileInput')
			}
		}
	});
}
```

If at any point you decide to change some of the options, you can do it like this:

```javascript
function changeSomeOptions(form) {
	$(form).ajaxFormHelper('update', {
		url: 'some/other/url',
		success: someOtherObject.success
	});
}
```

The options you pass will get updated, while the others will stay untouched!

## That's all!

There are probably some bugs in there, and tons of way to make this plugin better. If you have any input, feel free to tell me so that I can make this better! The documentation here is a little bit confused probably, so if you have any suggestion that can help me improve it, that is apreciated as well :)

Enjoy! ;)



