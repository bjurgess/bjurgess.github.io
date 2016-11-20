// Main.js
// Used mainly for sending contact message through ajax

(function ($) {
    'use strict';

    function createMessage(message, type) {
        var $snackbar = $('.snackbar', $(document));

        var $toast = $('<div/>', {
            class: generateClass(),
        });

        $toast.hide();

        $toast.html(generateMessage());

        $toast.one('click', function () {
            hideMessage();
        });

        return {
            show: showMessage,
            hide: hideMessage
        };


        function generateClass() {
            if (type === 0) // This is a success state
                return "toast toast-success";

            return "toast toast-error";
        }

        function generateMessage() {
            if (type === 0)
                return "<em class='fa fa-check'></em> " + message;

            return "<em class='fa fa-times'></em> " + message;
        }

        function showMessage() {
            $snackbar.empty();
            $snackbar.append($toast);
            $toast.fadeIn(400);
        }

        function hideMessage() {
            $toast.fadeOut(400);

            window.setTimeout(function () {
                $toast.off('click');
                $snackbar.empty();
            }, 500);
        }
    }


    function sendMessage() {
        var $contactForm = $('#SendMessageForm', $(document));
        var $email = $('input[name=email]', $contactForm);
        var $name = $('input[name=name]', $contactForm);
        var $message = $('textarea[name=message]', $contactForm);


        $contactForm.on('submit', function (e) {
            console.log('hit');
            e.preventDefault();

            send();
        });

        $email.on('focus', removeErrorClass);
        $message.on('focus', removeErrorClass);
        $name.on('focus', removeErrorClass);


        function validate() {
            var validation = {
                name: validateName($name.val()),
                email: validateEmail($name.val()),
                message: validateEmail($name.val())
            };
        }

        function getDataObject() {
            return {
                _replyto: $email.val(),
                message: $message.val(),
                _subject: "New message from: " + $name.val()
            };
        }

        function removeErrorClass(e) {
            $(e.target).removeClass('error');
        }


        function send() {
            $.ajax({
                type: 'POST',
                url: 'https://formspree.io/jurgessbrian@gmail.com',
                data: JSON.stringify(getDataObject()),
                contentType: 'application/json',
                dataType: 'json',
                success: function () {
                    $contactForm[0].reset();

                    var toast = createMessage("Successfully Sent!", 0);
                    toast.show();

                    window.setTimeout(function() {
                        toast.hide();
                    }, 5000);
                },
                error: function (xhr, status, errorThrown) {
                    var responseObj = {};
                    console.log(xhr.responseText);
                    if (typeof xhr.responseText !== 'undefined') {
                        try {
                            responseObj = JSON.parse(xhr.responseText);
                        } catch(e) {
                            responseObj = {};
                        }

                    }

                    for (var field in responseObj) {
                        if (field === 'message')
                            $message.addClass('error');
                        else
                            $('input[name=' + field + ']').addClass('error');
                    }

                    var toast = createMessage("Unable to send message!", 1);
                    toast.show();

                    window.setTimeout(function() {
                        toast.hide();
                    }, 5000);
                }
            });
        }

    }


    $(document).ready(function () {
        sendMessage();
    });

})(jQuery);
