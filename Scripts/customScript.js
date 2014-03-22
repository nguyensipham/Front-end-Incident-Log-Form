/// <reference path="bootstrap.js" />
/// <reference path="../ckeditor/ckeditor.js" />
/// <reference path="jquery-1.9.1.js" />

//Sample data service
var dataService = function () {
    var sendRequest = function (date, name, email, details, callback) {
        // Sending AJAX request here. 
        //...
        callback(date, name, email, details);
    }

    return {
        sendRequest: sendRequest
    }
}();


//App module
var app = function () {
    var
        formId = '#simpleForm',
        msgId = '#msg',
		ckeDivId = '#cke_details',
        validationElements = $('[data-role="validate"]'),
        isPopover = false,
		
		//Wire events to elements
        wireEvents = function () {     
            var requiredElems = $('[required]');
            var emailElems = $('input[type=email]');
						
			//Bind events for common required elements
            requiredElems.on('blur keyup change', function () {
				validateRequired(this.id);
			});	
			
			validationElements.on('invalid', function () {
                $('#' + this.id).addClass('required');
                if (!isPopover) {
                    $('#' + this.id).popover('show');
                    isPopover = true;
                }
            });           
			
			//Bind events for specific elements
			$('#aDate').on('blur keyup', function () {
				validateDate(this.id);
			});
                  
            emailElems.on('blur keyup', function () {
				validateEmail(this.id);
			});
			
			CKEDITOR.instances.details.on('blur', function(e) {
					validateDetailsOfProb();
				});
			CKEDITOR.instances.details.on('change', function(e) {
					validateDetailsOfProb();
				});

			//Override the form submit event
            $(formId).submit(function (e) {
                e.preventDefault();

                if (validateForm()) {
                    //validation succeeded                    
                    var aDate = encodeURIComponent($('#aDate').val());
                    var name = encodeURIComponent($('#name').val());
                    var email = encodeURIComponent($('#email').val());                    
                    var details = encodeURIComponent(CKEDITOR.instances.details.getData());
                    dataService.sendRequest(aDate, name, email, details, submitCallback);
                }
            });
			
            $('#cancel').on('click', reset);
        },

        submitCallback = function (date, name, email, details) {
            $('#dateValue').text(decodeURIComponent(date));
            $('#nameValue').text(decodeURIComponent(name));
            $('#emailValue').text(decodeURIComponent(email));
            $('#detailsValue').html(decodeURIComponent(details));

            $(formId).hide();
            $(msgId).show();
        },
        
		//Validate required elements
        validateRequired = function (id) {
			var elem = $('#' + id);
            if (elem.val() == "") {
                elem.addClass('required');
            } else {
                elem.removeClass('required')
					.popover('hide');
                isPopover = false;
            }
        },

		//Validate email elements
        validateEmail = function (id) {
            var email = $('#' + id);
            if (isValidEmail(email.val())) {
                email.removeClass('required');
            } else {
                email.addClass('required');                
            }
        },
		
		//Validate date elements
		validateDate = function (id) {
			var date = $('#' + id);
			if (isValidDate(date.val())) {
                date.removeClass('required');
            } else {
                date.addClass('required');                
            }
		},

		//Validate Details of Problem using CKEDITOR
        validateDetailsOfProb = function () {			
            if (CKEDITOR.instances.details.getData().trim() == "") {                
				$(ckeDivId)
					.attr('title', 'Details of Incident')
					.attr('data-content', 'Details of Incident is required.')
					.attr('data-placement', 'top')
					.addClass('ckeditor_required')
					.popover('show');
                return false;
            } else {
				$(ckeDivId)
					.removeClass('ckeditor_required')
					.popover('hide');
				return true;
			}
        },

        isValidEmail = function (email) {
            return /^[a-z0-9]+([-._][a-z0-9]+)*@([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,4}$/.test(email)
                    && /^(?=.{1,64}@.{4,64}$)(?=.{6,100}$).*/.test(email);
        },
		
		isValidDate = function(date){
			return /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(date);
		},
             
		//Validate form
        validateForm = function () {			
            return $(formId)[0].checkValidity() && validateDetailsOfProb();
        },

		//Reset form
        reset = function () {
            $(formId)[0].reset();
            CKEDITOR.instances.details.setData('');
			
			//Clear all the tooltips
			var inputs = $('input');
			for (var i=0; i<inputs.length; i++){
				$('#' + inputs[i].id)
					.removeClass('required')
					.popover('hide');
			}
			$(ckeDivId)
				.removeClass('ckeditor_required')
				.popover('hide');
        }

    return {
        wireEvents: wireEvents
    }    
}();

$(function () {
    CKEDITOR.replace('details');	
	
	app.wireEvents();
	
	$.datepicker.setDefaults({
		dateFormat: 'dd/mm/yy'
	});
	$( "#aDate" ).datepicker();
});

