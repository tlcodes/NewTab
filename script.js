$(function() {

var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var bgStyle = 'url("https://source.unsplash.com/category/nature/' + width + 'x' + height + '")';

$('body').css('background', bgStyle);

});