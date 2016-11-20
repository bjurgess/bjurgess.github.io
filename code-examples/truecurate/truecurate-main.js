/******************************************************************
 *      main.js
 *      This file contains all the standard javascript methods
 *      used to interact with the entire site.
 *      Namespace: TrueCurate
 ******************************************************************/

if (typeof TrueCurate === "undefined") {
    TrueCurate = {};
}

(function ($) {
    'use strict';
    
    // TRACK IT CLASS DEFINITION
    // -------------------------
    TrueCurate.TrackIt = function (element, options) {
        this.$element = element;
        this.$body = $(document.body);
        this.$trackItModal = $('#trackItModal');
        this.options = options;
        this.isShown = false;
    }

    TrueCurate.TrackIt.prototype = {
        $element: null,
        $body: null,
        $trackItModal: null,
        options: {},
        form_object: null,
        isShown: false,
        toggle: function (_relatedTarget) {
            return this.isShown ? this.hide() : this.show(_relatedTarget);
        },
        show: function () {
            var obj = this;
            console.log(this.product_title);
            $('.trackit-product-title').text(this.options.title);
            $('.trackit-current-price').text('$' + this.options.price);
            $("#trackItModal [name='upc']").val(this.options.upc);
            $("#trackItModal [name='act_price']").val(this.options.price);
            $("#trackItModal [name='upc_parent']").val(this.options.upc_parent);
            $("#trackItModal [name='sub_category']").val(this.options.sub_category);
            $("#trackItModal [name='sc']").val(this.options.sc);
            $("#trackItModal [name='track_title']").val(this.options.title);

            $('.trackit-form').on('submit', function (evt) {
                evt.preventDefault();

                obj.submit(evt);
            });

            this.$trackItModal.modal('show');
        },
        hide: function () {
            this.$trackItModal.modal("hide");
            $('.trackit-product-title').empty();
            $('.trackit-current-price').empty();
            $("#trackItModal [name=upc]").val("");
            $("#trackItModal [name=act_price]").val("");
            $("#trackItModal [name=upc_parent]").val("");
            $("#trackItModal [name=sub_category]").val("");
            $("#trackItModal [name='sc']").val("");
            $("#trackItModal [name=track_email]").val("");
            $("#trackItModal [name=track_phone]").val("");
            $("#trackItModal [name='track_title']").val("");
            $('.trackit-form')[0].reset();

            $('.trackit-form').off('submit');
        },
        submit: function (evt) {
            var trackObj = $('.trackit-form').serializeObject();
            var obj = this;
            console.log(trackObj);
            var trackPrice = $("#track_price").val();
            var trackEmail = $("#track_email").val();
            var trackPhone = $("#track_phone").val();
            var actPrice = $("#trackCurrentPrice").text().replace("$", "");
            if (trackPrice === '') {
                ShowTrackErrorMsg("Please enter a price to get notified.");
                return false;
            }
            if (trackEmail === '' && trackPhone == '') {
                ShowTrackErrorMsg("Please enter a method for receiving tracking notifications.");
                return false;
            }
            var intTrackPrice = parseFloat(trackPrice, 10);
            var intActPrice = parseFloat(actPrice, 10);
            if (intTrackPrice <= 0) {
                ShowTrackErrorMsg("The price entered should be higher than 0.00");
                return false;
            }
            if (intActPrice <= intTrackPrice) {
                ShowTrackErrorMsg("The price entered should be lower than the current price.");
                return false;
            }
            $("#divModalSuccess").hide();
            $("#divModalFail").hide();
            $("#divLoading").show();
            $('#trackModal').modal('hide');
            $('#trackProcessingModal').modal('show');

            $.ajax({
                url: '/api/trackit',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(trackObj),
                success: function (data) {
                    obj.hide();
                    $("#divLoading").hide();
                    if (!data.error) {
                        $("#divModalSuccess").show();
                        $("#msgTrackSuccess").show();
                        $("#msgTrackFail").hide();
                    }
                    else {
                        $("#divModalFail").show();
                        $("#modalTrackErrorMsg").text(data.error);
                        $("#trackErrorMsg").text(data.error);
                        $("#msgTrackFail").show();
                        $("#msgTrackSuccess").hide();
                    }
                }
            });
        }
    }

    function Plugin(option, _relatedTarget) {
            var $this = $(this);
            var data = $this.data('tc-trackIt');
            var options = $.extend({}, $this.data(), typeof option == 'object' && option, { show: true });

            if (!data) $this.data('tc.trackIt', (data = new TrueCurate.TrackIt(this, options)));
            if (typeof option == 'string') data[option](_relatedTarget);
            else if (options.show) data.show(_relatedTarget);
    }


    $.fn.trackIt = Plugin;

    $.fn.trackIt.Constructor = TrueCurate.TrackIt;

    function ShowTrackErrorMsg(errorMsg) {
        $("#trackErrorMsg").text(errorMsg);
        $("#msgTrackFail").show();
        $("#msgTrackSuccess").hide();
    }

    $(document).on('click.ts.trackit', '.trackit-button', function (e) {
        var $this = $(this);
        var href = $this.attr('href');
        var $target = null;
        var option = $this.data('tc-trackIt') ? 'toggle' : $.extend({}, $this.data);


        if ($this.is('a')) e.preventDefault();

        Plugin.call(this, option, $target);
    });

    // jQuery serializeObject method that can be used to
    // serialize a form into an object.
    $.fn.serializeObject = function () {
        var obj = {};
        var arr = this.serializeArray();

        $.each(arr, function () {
            if (obj[this.name] !== undefined) {
                if (!obj[this.name].push) {
                    obj[this.name] = [obj[this.name]];
                }
                obj[this.name].push(this.value || '');
            } else {
                obj[this.name] = this.value || '';
            }
        });

        return obj;
    }

    //TrueCurate.BuyItClick = function (buyNowUPC, buyNowCategory, buyNowSubCategory, buyNowRetailer, requestURL) {
    TrueCurate.BuyItClick = function (buyObject)
    {
        $.ajaxSetup({ cache: false });
        ga('send', 'event', 'Buttons', 'Buy Now', 'Buy Now Clicks');
        //var buyObject = {
        //    buyNow_upc: buyNowUPC,
        //    buyNow_category: buyNowCategory,
        //    buyNow_sub_category: buyNowSubCategory,
        //    buyNow_retailer_id: buyNowRetailer
        //};
        $.ajax({
            url: '/buynowclick',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ buyNowObject: buyObject }),
            success: function (data) {
                if (!data.error) {
                }
            }
        });
    }

    $(".btnBuyNow").on('click', function (e) {
        var buyObj = $(e.target).data();
        TrueCurate.BuyItClick(buyObj);
    });

    TrueCurate.retailerObject = {
        Amazon: {
            returnPolicy: "https://www.amazon.com/gp/orc/returns/homepage.html/ref=hp_200572800_clickhere",
            priceMatchPolicy: "https://www.amazon.com/gp/help/customer/display.html/?nodeId=201133150",
        },
        "Best Buy": {
            returnPolicy: "http://www.bestbuy.com/site/help-topics/return-exchange-policy/pcmcat260800050014.c?id=pcmcat260800050014",
            priceMatchPolicy: "http://www.bestbuy.com/site/help-topics/price-match-guarantee/pcmcat297300050000.c?id=pcmcat297300050000"
        },
        Walmart: {
            returnPolicy: "http://corporate.walmart.com/return-policy",
            priceMatchPolicy: "http://help.walmart.com/app/answers/detail/a_id/31"
        },
        Sears: {
            returnPolicy: "http://www.sears.com/csreturns/nb-100000000020507",
            priceMatchPolicy: "http://www.sears.com/cspricematch/nb-100000000022522"
        },
        eBay: {
            returnPolicy: "http://pages.ebay.com/help/buy/return-item.html",
            priceMatchPolicy: "http://ocsnext.ebay.com/ocs/home?"
        },
        Newegg: {
            returnPolicy: "http://kb.newegg.com/Policies/Article/1167",
            priceMatchPolicy: "http://www.newegg.com/ironegg"
        },
        Staples: {
            returnPolicy: "http://www.staples.com/sbd/cre/help-center/returns-policy-popup/",
            priceMatchPolicy: "http://www.staples.com/sbd/content/help/using/general_match.html"
        },
        QVC: {
            returnPolicy: "http://www.qvc.com/Returns.content.html",
            priceMatchPolicy: "http://www.qvc.com/PricingRetailOffersOtherInfo.content.html"
        },
        "Office Depot": {
            returnPolicy: "http://www.officedepot.com/a/customerservice/Refunds/",
            priceMatchPolicy: "http://www.officedepot.com/renderStaticPage.do?file=/customerservice/lowPrice.jsp"
        }
    }

     TrueCurate.openReturnPolicy = function(retailer) {
        if (retailer === undefined || retailer === "") {
            return null;
        }

        var retailerPolicies = TrueCurate.retailerObject[retailer];
        if (retailerPolicies === undefined) {
            return null;
        }

        var win = window.open(retailerPolicies["returnPolicy"], "_blank");
        win.focus();
    }

    TrueCurate.openPriceMatchPolicy = function(retailer) {
        if (retailer === undefined || retailer === "")
            return null;

        var retailerPolicies = TrueCurate.retailerObject[retailer];
        if (retailerPolicies === undefined)
            return null;

        console.log(retailerPolicies);

        var win = window.open(retailerPolicies["priceMatchPolicy"], "_blank");
        win.focus();
    }

    $(document).ready(function () {

        TrueCurate.createNotification = function(message, type, delayMS) {
            if (delayMS === undefined || delayMS === null) {
                delayMS = 500;
            }

            var alert = "<div class='alert alert-" + type + " alert-dismissable page-alert'>";
            alert += "<button type='button' class='close'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>";
            alert += message
            alert += "</div>"

            $(alert).prependTo("#notification-center").slideDown().delay(delayMS).slideUp();
        }

        function resetSidebar() {
            $('.submenu').removeClass('in');
            $('.submenu').removeClass('out');
            $('.sidebar-toggle').removeClass('sidebar-toggle');
        }

        $('.mobile-button').on('click', function (evt) {
            $('.mobile-sidebar').toggleClass('sidebar-toggle');
        });

        $('.submenu-toggle').on('click', function (evt) {

            $(evt.target).parent().parent().addClass("out");
            $(evt.target).parent().children('.submenu').addClass("in");
        });

        $('.submenu-back').on('click', function (evt) {
            $(evt.target).parent().parent().removeClass('in');
            $(evt.target).parent().parent().parent().parent().removeClass('out');
        });


        $('#feedbackModal').on('show.bs.modal', function () {
            resetSidebar();
        });

        $('#newsletterSignupModal').on('show.bs.modal', function () {
            resetSidebar();
        });

        // Search Functionality
        //$("#search-input").keydown(function (event) {
        //    if (event.keycode === $.ui.keycode.tab && $(this).data("autocomplete").menu.active) {
        //        event.preventdefault();
        //    }
        //});

        // Search Autocomplete
        var autocomplete = $("#search-input").autocomplete({
            source: function (request, response) {
                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    url: '/suggestterms',
                    data: "{'term':'" + $("#search-input").val() + "'}",
                    dataType: "json",
                    success: function (data) {
                        response(data);
                    },
                    error: function (result) {
                    }
                });
            },
            select: function (event, ui) {
                event.preventDefault();
                $("#search-input").val(ui.item.label);
                window.location.href = ui.item.value;
            },
            focus: function (event, ui) {
                event.preventDefault();
                $("#search-input").val(ui.item.label);
            },
            _resizeMenu: function () {
                console.log("Hello World");
                this.menu.element.outerWidth(500);
            },
            open: function (event, ui) {
                $('.ui-autocomplete').css({"width": $('#search-input').outerWidth()})
            }   
        });


        $('#searchDropdown li a').on('click', function (evt) {
            $('#btnSearchCat').html($(evt.target).text() + " <span class=\"fa fa-caret-down\"></span>");

            $('#sc').val($(evt.target).attr('data-sc'));
        });

        // Feedback form
        $('#feedbackForm').on('submit', function (event) {
            event.preventDefault();
            var formObject = $(this).serializeObject();

            $.ajax({
                type: 'POST',
                data: JSON.stringify(formObject),
                contentType: 'application/json',
                url: '/Home/InsertFeedback',
                beforeSend: function () {

                },
                success: function () {
                    $('#feedbackModal').modal('hide');
                    createNotification("Feedback submitted successfully!", "success", 2000);
                },
                complete: function () {

                }
            });
        });

        //$('.trackit-button').trackIt();
    });
})(jQuery);