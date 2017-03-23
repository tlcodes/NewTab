$(function() {

var $weather = $('.weather');    
    
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
      var location = json.name + ', ' + json.sys.country;
      
      $weather.append($('<p>').text(location));
      $weather.append($('<p>').text(cels + '\u00B0 C, ' + condition));
      //$weather.append($('<p>').text(condition));

      
  });
  });
}

});