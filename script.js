$(function() {

    var $weather = $('.weather');
    var $goalInput = $('.mainForm input');
    var $clock = $('.clock');
    var $usClock = $('.usclock');
    var $datep = $('.date');
    var $quote = $('blockquote');
    var $submittedGoalSpan = $('#submittedGoal + label > span');
    var $goalPrompt = $('.goalPrompt');
    var $submittedGoalContainer  = $('.submittedGoalContainer');
    var $submittedGoal = $('#submittedGoal');
    var $tempUnit;
    var $temperatureSpans;

    var format12;
    
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = (position.coords.latitude);
            var longitude = (position.coords.longitude);


            var yql = 'select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text="('+ latitude + ',' + longitude + ')")';
            var url = "https://query.yahooapis.com/v1/public/yql?q=" + yql + "&format=json";

            $.getJSON(url, function(weather) {

                var data = weather.query.results.channel.item.condition;

                // main data (condition, temp, icon, location)
                var fahr = Math.round(data.temp);                
                var condition = data.text;
                var icon = "<img src='http://l.yimg.com/a/i/us/we/52/" + data.code + ".gif'> ";
                var location = weather.query.results.channel.location.city;

                
                $weather.prepend($('<p>').html(icon + '<span class="temp">' + fahr + '</span>\u00B0 <span class="tempUnit">F</span>'));
                $weather.prepend($('<p>').text(location));
                
                // 10 day forecast (array of objects)
                var forecast = weather.query.results.channel.item.forecast;
                // properties are code, date, day, high, low, text
                
                // here 7 days forecast, or forecast.length to append all 10 days
                for (var i = 0; i < 7; i++) {
                    $(".forecast").append($('<tr>').html(
                        '<td>' + forecast[i].day + ' ' + forecast[i].date.substring(3,7) + forecast[i].date.substring(0,2) + '<br>' + forecast[i].text + '</td>' + 
                        '<td><span class="temp">' + forecast[i].low + '</span>\u00B0 <span class="tempUnit">F</span></td>' + 
                        '<td><span class="temp">' + forecast[i].high + '</span>\u00B0 <span class="tempUnit">F</span></td>' + 
                        '<td>' + "<img src='http://l.yimg.com/a/i/us/we/52/" + forecast[i].code  + ".gif'></td>"
                    ));
                }
                
                $temperatureSpans = $('#weatherBox .temp');
                $tempUnit = $('.tempUnit');
                
                chrome.storage.local.get('celsBool', function(obj) {    
                    if (!obj.celsBool) {                        
                        // need to get the value because variables are in local getJSON weather scope                        
                        $('.fahrenheit').addClass('tempChoice');
                        $tempUnit.text('F');
                    } else {                        
                        $('.celsius').addClass('tempChoice');
                        $tempUnit.text('C');
                        $temperatureSpans.each(function() {
                            $(this).text(Math.round(($(this).text() - 32 ) / 1.8));
                        });
                    }
                });

            }); // end getJSON

        });
    } // end navigator.gelocation


    // Quotes from forismatic
    var call = "https://cors-anywhere.herokuapp.com/http://api.forismatic.com/api/1.0/?method=getQuote&key=457653&format=json&lang=en";
    $.getJSON(call, function(quote) {
        var theQuote = quote.quoteText;
        var author = quote.quoteAuthor;
        $quote.append($('<div>').text('\u275D ' + theQuote + '\u275E'));
        $quote.append($('<cite>').text('\u007E' + author));
    });

    // Hide one element, display another one and do it smoothly
    function transitionSmoothly(toHide, toDisplay) {
        toHide.css('opacity', 0);       // used in conjunction with the css 'transition' property to make it gradually disappear
        setTimeout(function() {
            toHide.css('display', 'none');   // when transition is over (rough approximation of 1000ms), remove the element from the document flow
            toDisplay.css('display', 'block');   // and add the other one instead - default CSS value for opacity is set to 0, so it won't appear yet
            setTimeout(function() {
                toDisplay.css('opacity', '1');   // A slight delay is needed before setting the opacity to 1, otherwise 'transition' effect will be ignored
            }, 10);                              
        }, 1000);
    }

    // attach 'submit' event handler to daily focus prompt
    $('.mainForm').on('submit', function(event) {
        event.preventDefault();     // prevent the page from reloading, which is the default action for 'submit' event
        var goal = $goalInput.val();
        if(goal) {                  // ensure that the input is not empty
            chrome.storage.local.set({'mainGoal': { text: goal, checked: false }});     // store the input text
            $submittedGoalSpan.text(goal);
            transitionSmoothly($goalPrompt, $submittedGoalContainer);
        }        
    });
    
    // attach event handler to the 'x' button to remove the daily focus
    $('#removeDailyGoal').on('click', function() {
        $goalInput.val('');
        chrome.storage.local.set({'mainGoal': ''});    // remove the daily focus text from the storage
        transitionSmoothly($submittedGoalContainer, $goalPrompt);
        setTimeout(function() {                         // set the checkbox contents to nothing and reset its 'checked' property after enough time has passed, allowing the
            $submittedGoalSpan.text('');// containing div to disappear
            $submittedGoal.prop('checked', false);
        }, 1000);
    });

    // Update the page and other open tabs
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
            var storageChange = changes[key];
            
            if(key == "mainGoal") {
                showDailyGoal(storageChange.newValue);
            } else if(key == "list") {
                list = storageChange.newValue;
                drawList();
            }
        }
    });
    
    
    
    function padZero(n) {
        return n < 10 ? '0' + n : n;
    }
    

    function theTime() {
        var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var now = new Date();
        var date = padZero(now.getDate());
        var day = now.getDay();
        var today = dayNames[day];
        var month = padZero(now.getMonth() + 1);
        
        var hours = now.getHours();
        var minutes = padZero(now.getMinutes());        
        
        $datep.html(today + ', ' + month + '/' + date);
        
        if(!format12) {
            $clock.html(padZero(hours) + ':' + minutes);
        } else {
            //12 hour clock variables
            var ampm = hours >= 12 ? 'PM' : 'AM';
            var usHours = hours % 12 || 12;
            $clock.html(padZero(usHours) + ':' + minutes);
            $clock.append($('<span>').addClass('ampm').text(ampm));
        }
        
    }

    // toggle weather forecast
    $weather.on('click', function() {
        $('.weatherForecast').slideToggle(1000);
    });

    // Toggle clock to 12 and 24 hour mode
    $('.time').on('click', function() {
        format12 = !format12;
        chrome.storage.local.set({'format12': format12});
        theTime();
    });    

    // Toggle temperature units
    $('tfoot').on('click', function() {
        $('.fahrenheit, .celsius').toggleClass('tempChoice');        
        // get temp choice and store it
        var celsBool = $('.celsius').hasClass('tempChoice');        

        chrome.storage.local.set({'celsBool': celsBool});

        if (celsBool) {
            $tempUnit.text('C');
            $temperatureSpans.each(function() {
                $(this).text(Math.round(($(this).text() - 32 ) / 1.8));
            });
        } else {
            $tempUnit.text('F');
            $temperatureSpans.each(function() {
                $(this).text(Math.round(($(this).text() * 1.8) + 32));
            });
        }        
    });    
    

     function showDailyGoal(obj) {        
        if(obj && obj.text) {                         // if there is already a stored text, display it            
            $submittedGoalSpan.text(obj.text);          
            $submittedGoal.prop('checked', obj.checked);
            transitionSmoothly($goalPrompt, $submittedGoalContainer);
        } else {      // otherwise, display the prompt
            $submittedGoalSpan.text('');
            $submittedGoal.prop('checked', false);            
            transitionSmoothly($submittedGoalContainer, $goalPrompt);
        }
    }
    
    
    // on page load, check if there is previous text stored
    chrome.storage.local.get('mainGoal', function(response) {
        var obj = response.mainGoal;
        showDailyGoal(obj);
    });
    
    // check the temp choice on page load
    
    
    // on page load, check clock status and apply the appropriate format
    chrome.storage.local.get('format12', function(obj) {
        format12 = obj.format12 ? true : false;        
        setInterval(theTime, 1000);
    });
    
    
    var $listContainer = $('.to-do .listContainer');
    var $showList = $("#showList");
    
    $showList.on('click', function() {    
        let currentLeft = $listContainer.css("left");
        let newLeft;
        if(currentLeft == '0px') {
            newLeft = '100%';
            $showList.css('right', '0.7em');
            setTimeout(function() {
                $('.to-do').css('visibility', 'hidden');
            }, 600);
        }
        else {
            newLeft = '0px';
            $showList.css('right', '7em');
            setTimeout(function() {
                $('#addNote').focus();
            }, 700);
            $('.to-do').css('visibility', 'visible');
        }
        $listContainer.animate({
            "left": newLeft
        }, 500);    
    });
    
    var currentID = 0;
    var $list = $('.to-do-list');
    var list = [];

    
    
    function addItem(item) {
        var idNum = currentID;
        var id = 'item' + currentID;
        let $checkbox = $('<input type="checkbox">').attr('id', id).prop('checked', item.checked);
        $checkbox.on('change', function() {
            list[idNum].checked = this.checked;
            chrome.storage.local.set({ 'list': list });
        });
        var $span = $('<span></span>').text(item.text);
        let $label = $('<label>').attr('for', id);
        $label.append($span);
        var $button = $('<button type="button"></button>');
        $button.on('click', function() {
            list.splice(idNum, 1);
            chrome.storage.local.set({'list': list});
        });
        var $container = $('<li></li>').append($checkbox, $label, $button);
        $list.append($container);
        currentID++;
    }
    
    function drawList() {
        currentID = 0;
        $list.empty();
        chrome.storage.local.get('list', function(obj) {
            if(obj.list) {                
                list = obj.list;
                list.forEach(addItem);        
            }
        });        
    }
    
    var $addNote = $('#addNote');
    
    $('#noteForm').on('submit', function(event) {
        event.preventDefault();
        let text = $addNote.val();
        list.push({ text: text, checked: false });
        chrome.storage.local.set({'list': list});             
        $addNote.val('');        
    }); 
    
    
    $submittedGoal.on('change', function() {
        var that = this;
        chrome.storage.local.get('mainGoal', function(response) {
            chrome.storage.local.set({ 'mainGoal': {text: response.mainGoal.text, checked: that.checked }});
        });      
    });
    
     drawList();    
});
