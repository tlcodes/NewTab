$(function() {

var $weather = $('.weather');    
var goalInput = $('.mainForm input');
var $timediv = $('.time');

if(navigator.geolocation) { 
  navigator.geolocation.getCurrentPosition(function(position) { 
    var latitude = (position.coords.latitude);
    var longitude = (position.coords.longitude);
    // var url = 'https://api.apixu.com/v1/current.json?key=981a4177d5834ae89f9180839172203&q=' + latitude + ',' + longitude;
      
    //API keys from OpenWeatherMap.com
    var apikey = "54e8a43f5589a7c590f20fdd08aacde1";
    //default key : a608afe2d88483c2a0197c42108a03c6
    var url = "https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&type=accurate&units=imperial&APPID=" + apikey;

  $.getJSON(url, function(json) {
      
      var fahr = Math.round(json.main.temp);
      var cels = Math.round((json.main.temp - 32) / 1.8);
      var condition = json.weather[0].main;
      // for more precise description (such as 'scattered clouds' instead of 'Clouds'), use:
      // json.weather[0].description;
      var location = json.name;
      
      var $icon = $("<img src='http://openweathermap.org/img/w/" + json.weather[0].icon + ".png'>")
      $weather.append($icon);
      $weather.append($('<p>').text(cels + '\u00B0 C'));
//      $weather.append($('<p>').text(condition));
      $weather.append($('<p>').text(location));

      
  });
  });
}



function saveMainGoal(event) {
    event.preventDefault();
    var goal = goalInput.val();
    if(goal) {
       chrome.storage.sync.set({'mainGoal': goal});
    }    
}
    // $('.mainForm input').eq(0).focus();   // Chrome forbids the extensions that substitute the new tab page from grabbing focus from the omnibar

$('.mainForm').on('submit', saveMainGoal);
    
    // Test if the submit text has been saved
      chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
          var storageChange = changes[key];
          console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      namespace,
                      storageChange.oldValue,
                      storageChange.newValue);
        }
      });
      
    var now = new Date();
    var date = now.getDate();
    var day = now.getDay();
    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var today = dayNames[day];
    var month = now.getMonth() + 1;    
    var hours = now.getHours();
    var minutes = now.getMinutes();
    
    var $datediv = $('<p>').text(today + ', ' + month + '/' + date);
    $datediv.addClass('date');
    var $clock = $('<p>').text(hours + ':' + minutes);
    $clock.addClass('clock');
    
    $timediv.append($datediv);
    $timediv.append($clock);
    
    

});
