$(function() {
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
    var $button = $('<button type="button"><span class="icon-cancel-circle"></button>');
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


// Update the page and other open tabs
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        if(key == "list") {
            list = storageChange.newValue;
            drawList();
        }          
    }
});


drawList(); 
$('#addNote').focus();
});
