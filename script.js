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
    
    // Check if localStorage is supported and available
    
    var storageIsAvailable = (function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
})('localStorage');
    
    
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
//                 var icon = "<img src='http://l.yimg.com/a/i/us/we/52/" + data.code + ".gif'> ";
                
                function setWicon(weatherCode) {
  var wicon = '';
      switch(weatherCode) {
        case '0': wicon  = 'tornado';
          break;
        case '1': wicon = 'tropical-storm';
          break;
        case '2': wicon = 'hurricane';
          break;
        case '3': wicon = 'severe-thunderstorms';
          break;
        case '4': wicon = 'thunderstorms';
          break;
        case '5': wicon = 'mixed-rain-snow';
          break;
        case '6': wicon = 'mixed-rain-sleet';
          break;
        case '7': wicon = 'mixed-snow-sleet';
          break;
        case '8': wicon = 'freezing-drizzle';
          break;
        case '9': wicon = 'drizzle';
          break;
        case '10': wicon = 'freezing-rain';
          break;
        case '11': wicon = 'shower-drizzle';
          break;
        case '12': wicon = 'shower-rain';
          break;
        case '13': wicon = 'snow-flurries';
          break;
        case '14': wicon = 'light-scattered-snow-showers';
          break;
        case '15': wicon = 'blowing-snow';
          break;
        case '16': wicon = 'snow';
          break;
        case '17': wicon = 'hail';
          break;
        case '18': wicon = 'sleet';
          break;
        case '19': wicon = 'dust';
          break;
        case '20': wicon = 'fog';
          break;
        case '21': wicon = 'haze';
          break;
        case '22': wicon = 'smoky';
          break;
        case '23': wicon = 'blustery';
          break;
        case '24': wicon = 'windy';
          break;
        case '25': wicon = 'cold';
          break;
        case '26': wicon = 'cloudy';
          break;
        case '27': wicon = 'mostly-cloudy-night';
          break;
        case '28': wicon = 'mostly-cloudy-day';
          break;
        case '29': wicon = 'partly-cloudy-night';
          break;
        case '30': wicon = 'partly-cloudy-day';
          break;
        case '31': wicon = 'clear-night';
          break;
        case '32': wicon = 'sunny';
          break;
        case '33': wicon = 'fair-night';
          break;
        case '34': wicon = 'fair-day';
          break;
        case '35': wicon = 'mixed-rain-hail';
          break;
        case '36': wicon = 'hot';
          break;
        case '37': wicon = 'isolated-thunderstorm';
          break;
        case '38': wicon = 'scattered-thunderstorms';
          break;
        case '39': wicon = 'scattered-thunderstorms2';
          break;
        case '40': wicon = 'scattered-showers';
          break;
        case '41': wicon = 'heavy-shower-snow';
          break;
        case '42': wicon = 'light-scattered-snow-showers';
          break;
        case '43': wicon = 'heavy-shower-snow';
          break;
        case '44': wicon = 'unavailable';
          break;
        case '45': wicon = 'thundershowers';
          break;
        case '46': wicon = 'snow-showers';
          break;
        case '47': wicon = 'isolated-thunderstorms2';
          break;
        case '3200': wicon = 'unavailable';
          break;
        default: wicon = 'unavailable';
          break;
      }
  
      return '<span class="wicon icon-'+wicon+'"></span>';
}


                var icon = setWicon(data.code);
                
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
                        '<td>' + setWicon(forecast[i].code) + '</td>'
//                         '<td>' + "<img src='http://l.yimg.com/a/i/us/we/52/" + forecast[i].code  + ".gif'></td>"
                    ));
                }
                
                $temperatureSpans = $('#weatherBox .temp');
                $tempUnit = $('.tempUnit');
                
                if(storageIsAvailable) {
                    if(localStorage.getItem('celsBool') == "true") {
                        $('.celsius').addClass('choice');
                        $tempUnit.text('C');
                        $temperatureSpans.each(function() {
                            $(this).text(Math.round(($(this).text() - 32 ) / 1.8));
                        });
                    } else {
                        // Choice defaults to Fahrenheit units
                        $('.fahrenheit').addClass('choice');
                        $tempUnit.text('F');
                    }
                }
                /*
                chrome.storage.local.get('celsBool', function(obj) {    
                    if (!obj.celsBool) {                        
                        // need to get the value because variables are in local getJSON weather scope                        
                        $('.fahrenheit').addClass('choice');
                        $tempUnit.text('F');
                    } else {                        
                        $('.celsius').addClass('choice');
                        $tempUnit.text('C');
                        $temperatureSpans.each(function() {
                            $(this).text(Math.round(($(this).text() - 32 ) / 1.8));
                        });
                    }
                });*/
                
            }); // end getJSON
            
        });
    } // end navigator.gelocation
    
    
    // Quotes from forismatic
//     var call = "https://cors-anywhere.herokuapp.com/http://api.forismatic.com/api/1.0/?method=getQuote&key=457653&format=json&lang=en";
//     $.getJSON(call, function(quote) {
//         var theQuote = quote.quoteText;
//         var author = quote.quoteAuthor;
//         $quote.append($('<div>').text('\u275D ' + theQuote + '\u275E'));
//         $quote.append($('<cite>').text('\u007E' + author));
//     });
    
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
            if(storageIsAvailable) {
                localStorage.setItem('mainGoal', JSON.stringify({ text: goal, checked: false }));   // store the input text
            }
            $submittedGoalSpan.text(goal);
            transitionSmoothly($goalPrompt, $submittedGoalContainer);
            /*
            chrome.storage.local.set({'mainGoal': { text: goal, checked: false }});     
            $submittedGoalSpan.text(goal);
            transitionSmoothly($goalPrompt, $submittedGoalContainer);*/
        }        
    });
    
    // attach event handler to the 'x' button to remove the daily focus
    $('#removeDailyGoal').on('click', function() {
        $goalInput.val('');
        if(storageIsAvailable) {
            localStorage.setItem('mainGoal', '');  // remove the daily focus text from the storage
        }
        /*
         * chrome.storage.local.set({'mainGoal': ''});
         */
        transitionSmoothly($submittedGoalContainer, $goalPrompt);
        setTimeout(function() {                         // set the checkbox contents to nothing and reset its 'checked' property after enough time has passed, allowing the
            $submittedGoalSpan.text('');// containing div to disappear
            $submittedGoal.prop('checked', false);
        }, 1000);
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
    
    // Toggle settings
    
    $('.cog').on('click', function() {
        $('#settingList').animate({width:'toggle'});
    });
    
    // Show team
    $('.creditIcon').on('click', function() {
        $('.team').slideToggle(1000);
    });
    
    var panels = [['hideGoal', $('.todaysGoal'), $('.setGoal')],
  ['hideWeather', $('#weatherBox'), $('.setWeather')],
  ['hideQuote', $('blockquote'), $('.setQuote')],
  ['hideTodo', $('#showList'), $('.setTodo')]];
  
  // Attach event listeners to setting buttons
  panels.forEach(function(panel) {
      panel[2].on('click', function() {
          panel[2].toggleClass('choice');
          panel[1].toggleClass('hide');
          // get the current state and store it as a setting
          let state = panel[1].hasClass('hide');
          if(storageIsAvailable) {
              localStorage.setItem(panel[0], state);
          }
          /*
          chrome.storage.local.set({[panel[0]] : state});
      */
          //             let test = {[panel[0]] : state};
          //             console.log(test);
      });
  });
  
  // toggle settings choices
  // Show/hide weather
  //     $('.setWeather').on('click', function() {
  //         $('.setWeather').toggleClass('choice');
  //         $('#weatherBox').toggleClass('hide');
  //         // get temp choice and store it
  //         var hideWeather = $('.setWeather').hasClass('choice');        
  //         chrome.storage.local.set({'hideWeather': hideWeather});
  //     });
  //     // Show/hide main goal
  //     $('.setGoal').on('click', function() {
  //         $('.setGoal').toggleClass('choice');
  //         $('.todaysGoal').toggleClass('hide');
  //         // get temp choice and store it
  //         var hideGoal = $('.setGoal').hasClass('choice');        
  //         chrome.storage.local.set({'hideGoal': hideGoal});
  //     });
  //     // Show/Hide quote
  //     $('.setQuote').on('click', function() {
  //         $('.setQuote').toggleClass('choice');
  //         $('blockquote').toggleClass('hide');
  //         // get temp choice and store it
  //         var hideQuote = $('.setQuote').hasClass('choice');        
  //         chrome.storage.local.set({'hideQuote': hideQuote});
  //     });
  //     // Show/Hide todo list
  //     $('.setTodo').on('click', function() {
  //         $('.setTodo').toggleClass('choice');
  //         $('#showList').toggleClass('hide');
  //         // get temp choice and store it
  //         var hideTodo = $('.setTodo').hasClass('choice');        
  //         chrome.storage.local.set({'hideTodo': hideTodo});
  //     });
  
  // Toggle clock to 12 and 24 hour mode
  $('.time').on('click', function() {
      format12 = !format12;
      if(storageIsAvailable) {
          localStorage.setItem('format12', format12);
      }
      /*
      chrome.storage.local.set({'format12': format12});
      */
      theTime();
  });    
  
  // Toggle temperature units
  $('tfoot').on('click', function() {
      $('.fahrenheit, .celsius').toggleClass('choice');        
      // get temp choice and store it
      var celsBool = $('.celsius').hasClass('choice');        
      if(storageIsAvailable) {
          localStorage.setItem('celsBool', celsBool);
      }
      /*
      chrome.storage.local.set({'celsBool': celsBool});
      */
      
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
  
  
  // on page load, check if there is previous text stored
  if(storageIsAvailable) {
      // Show the goal prompt or the stored goal text
      let goal = localStorage.getItem('mainGoal');
      if(goal) {
          try {
          showDailyGoal(JSON.parse(goal));
          } catch(e) {
              alert("An error occured. Some data may have been lost :(");
              localStorage.setItem('mainGoal', '');
              showDailyGoal('');
          }
      }
      else
          showDailyGoal('');
      
      // Get the preffered time format setting, if already set, otherwise default to 24h format
      format12 = localStorage.getItem('format12') == "true" ? true : false;
  
      // Start the clock
      setInterval(theTime, 1000);
  
      // Show/hide panels on page load
      panels.forEach(function(panel) {
      renderPanel(panel[0], panel[1], panel[2]);          
    });
  }
  
  /*
  chrome.storage.local.get('mainGoal', function(response) {
      var obj = response.mainGoal;
      showDailyGoal(obj);
  });
  */
  
  // on page load, check clock status and apply the appropriate format
  /*
  chrome.storage.local.get('format12', function(obj) {
      format12 = obj.format12 ? true : false;        
                           setInterval(theTime, 1000);
  });
  */
  
  function renderPanel(name, panel, setter) {
      
      if(localStorage.getItem(name) == "true") {
          panel.addClass('hide');
          setter.removeClass('choice');
      } else {
          panel.removeClass('hide');
          setter.addClass('choice');
      }
  
      /*
      chrome.storage.local.get(name, function(obj) {
          if(!obj[name]) {
              panel.removeClass('hide');
              setter.addClass('choice');
          } else {                
              panel.addClass('hide');
              setter.removeClass('choice');
          }
      });
      */
  }  

  
  
/*     
  // Show/Hide weather on page load
  chrome.storage.local.get('showWeather', function(obj) {
      if (obj.showWeather) {
          $('#weatherBox').removeClass('hide');
          $('.setWeather').addClass('choice');
          
      } else {
          $('#weatherBox').addClass('hide');
          $('.setWeather').removeClass('choice');
      }
  });
  
  
  // Show/Hide Goal on page load
  chrome.storage.local.get('showGoal', function(obj) {
      if (obj.showGoal) {
          $('.todaysGoal').removeClass('hide');
          $('.setGoal').addClass('choice');
      } else {
          $('.todaysGoal').addClass('hide');
          $('.setGoal').removeClass('choice');
      }
  });
  
  
      
  // Show/Hide Quote on page load
  chrome.storage.local.get('showQuote', function(obj) {
      if (obj.showQuote) {
          $('blockquote').removeClass('hide');
          $('.setQuote').addClass('choice');
          
      } else {
          $('blockquote').addClass('hide');
          $('.setQuote').removeClass('choice');
      }
  });
  
  // Show/Hide Quote on page load
  chrome.storage.local.get('showTodo', function(obj) {
      if (obj.showTodo) {
          $('#showList').removeClass('hide');
          $('.setTodo').addClass('choice');
      } else {
          $('#showList').addClass('hide');
          $('.setTodo').removeClass('choice');
      }
  });
*/  

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
          $showList.css('right', '7.6em');
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
          localStorage.setItem('list', JSON.stringify(list));
          /*
          chrome.storage.local.set({ 'list': list });
          */
      });
      var $span = $('<span></span>').text(item.text);
      let $label = $('<label>').attr('for', id);
      $label.append($span);
      var $button = $('<button type="button"><span class="icon-cancel-circle"></button>');
      $button.on('click', function() {
          list.splice(idNum, 1);
          localStorage.setItem('list', JSON.stringify(list));
//           chrome.storage.local.set({'list': list});
          drawList();    
      });
      var $container = $('<li></li>').append($checkbox, $label, $button);
      $list.append($container);
      currentID++;
  }
  
  function drawList() {
      currentID = 0;
      $list.empty();
      try {
      var storedList = JSON.parse(localStorage.getItem('list'));
      } catch(e) {
          alert("An error occured. Some data may have been lost :(");
          var storedList = [];
          localStorage.setItem('list', JSON.stringify(storedList));          
      }
      if(storedList) {
          list = storedList;
          list.forEach(addItem);
      }
      /*
      chrome.storage.local.get('list', function(obj) {
          if(obj.list) {                
              list = obj.list;
              list.forEach(addItem);        
          }
      });
    */
  }
  
  var $addNote = $('#addNote');
  
  $('#noteForm').on('submit', function(event) {
      event.preventDefault();
      let text = $addNote.val();
      list.push({ text: text, checked: false });
      if(storageIsAvailable) {
          localStorage.setItem('list', JSON.stringify(list));
      }
//       chrome.storage.local.set({'list': list});             
      $addNote.val('');    
      if(storageIsAvailable)
          drawList();    
  }); 
  
  
  $submittedGoal.on('change', function() {
      var that = this;
      // First get the stored text from the storage to assign it back to it together with the current state of the checkbox  
      if(storageIsAvailable) {
          try {
              localStorage.setItem('mainGoal', JSON.stringify({ text: JSON.parse(localStorage.getItem('mainGoal')).text, checked: this.checked }));
          } catch(e) {              
              alert('An error occured. Some data may have been lost :(');
              localStorage.setItem('mainGoal', '');  
              showDailyGoal('');
          }
      }
      /*
       *    chrome.storage.local.get('mainGoal', function(response) {
       *        chrome.storage.local.set({ 'mainGoal': {text: response.mainGoal.text, checked: that.checked }});
  });
  */
  });
  
  
  // Update other open tabs
  
  window.addEventListener('storage', function (e) {
      if(e.key == "mainGoal") {
          if(e.newValue) {
              try {
                  showDailyGoal(JSON.parse(e.newValue));  // If not an empty string, then it's a JSON-encoded object
              } catch(e) {
                  alert('An error occured. Some data may have been lost :(');
                  localStorage.setItem('mainGoal', '');  
                  showDailyGoal('');
              }
          }
          else
              showDailyGoal('');
      }
      else if(e.key == "list") {
          try {
          list = JSON.parse(e.newValue);
          } catch(e) {
              alert('An error occured. Some data may have been lost :(');
              var storedList = [];
              localStorage.setItem('list', JSON.stringify(storedList));                
          }
          drawList();
      } else {
              // 'some' is used instead of 'forEach' in order to break out of the loop at the first match
              // as it will be the only match anyways
              panels.some(function(panel) {
                  if(e.key == panel[0]) {
                      renderPanel(panel[0], panel[1], panel[2]);
                      return true;
                  }
              });
      }
  });
  
  
  /*
  chrome.storage.onChanged.addListener(function(changes, namespace) {
      for (key in changes) {
          var storageChange = changes[key];
          
          if(key == "mainGoal") {
              showDailyGoal(storageChange.newValue);
          } else if(key == "list") {
              list = storageChange.newValue;
              drawList();
          } else {
              // 'some' is used instead of 'forEach' in order to break out of the loop at the first match
              // as it will be the only match anyways
              panels.some(function(panel) {
                  if(key === panel[0]) {
                      renderPanel(panel[0], panel[1], panel[2]);
                      return true;
                  }
              });
          }            
      }
  });
  */
  if(storageIsAvailable)
      drawList();    
});
