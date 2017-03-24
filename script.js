$(function() {

    var $weather = $('.weather');
    var $timediv = $('.time');
    var $datediv = $('.date');

    if(navigator.geolocation) { 
      navigator.geolocation.getCurrentPosition(function(position) { 
        var latitude = (position.coords.latitude);
        var longitude = (position.coords.longitude);

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

          $weather.append($('<p>').text(location));
          $weather.append($('<p>').html(cels + '\u00B0 C, ' + condition + " <img src='http://openweathermap.org/img/w/" + json.weather[0].icon + ".png'>" ));
          //$weather.append($('<p>').text(condition)); */          

          

      });
      });
}
// Date and Time
var now = new Date();
var date = now.getDate();
var day = now.getDay();
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var today = dayNames[day];
var month = now.getMonth() + 1;    
var hours = now.getHours();
var minutes = now.getMinutes();

$timediv.append($('<p>').text(hours + ':' + minutes));
$timediv.append($('<p>').text(today + ', ' + month + '/' + date));
$('p:last').addClass('date');
});