$(function() {

var $weather = $('.weather');    
    
if(navigator.geolocation) { 
  navigator.geolocation.getCurrentPosition(function(position) { 
    var latitude = Math.round(position.coords.latitude);
    var longitude = Math.round(position.coords.longitude);
    var url = 'https://api.apixu.com/v1/current.json?key=981a4177d5834ae89f9180839172203&q=' + latitude + ',' + longitude;
    

  $.getJSON(url, function(json) {
      
      var temp = json.current.temp_c + '\u00B0 C';
      var condition = json.current.condition.text;
      
      $weather.append($('<p>').text(temp));
      $weather.append($('<p>').text(condition));

      
  });
  });
}

});