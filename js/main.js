document.addEventListener('DOMContentLoaded', _init);

function _init() {
    // check if supported
    if (window.File != null && window.FileReader && window.FileList && window.Blob) {
        document.getElementById('capture').addEventListener('change', readFileContent, false);
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPosition, function (pErr) {
            alert("Bei der Lokalisierung ist eine Fehler aufgetreten: " + pErr);
        });
    } else {
        alert('The Geolocation API is not fully supported in this browser.');
    }

    _loadEntries();



    document.getElementById('save_entry').addEventListener('click', saveEntry, false);

}

var base64Str = null;
var currentLocation = null;

var readFileContent = function(pEvt) {

    var files = pEvt.target.files;
    var file = files[0];

    if (files && file) {
        var reader = new FileReader();

        reader.readAsBinaryString(file);

        reader.onload = function (readerEvt) {
            var binaryString = readerEvt.target.result;
            base64Str = btoa(binaryString);
            document.getElementById('capture_output').src = "data:image/gif;base64," + base64Str;
            document.getElementById('capture_output').style.display = "block";
             
        };


    }
};

var getPosition = function(pPosition) {
    currentLocation = pPosition;

    // display on a map
    var mapcanvas = document.createElement('div');
    mapcanvas.id = 'mapcontainer';
    mapcanvas.style.height = '200px';
    mapcanvas.style.width = '100%';

    document.getElementById('map').innerHTML = "";
    document.getElementById('map').appendChild(mapcanvas);

    var coords = new google.maps.LatLng(pPosition.coords.latitude, pPosition.coords.longitude);

    var options = {
        zoom: 15,
        center: coords,
        mapTypeControl: false,
        navigationControlOptions: {
            style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("mapcontainer"), options);

    var marker = new google.maps.Marker({
        position: coords,
        map: map,
        title: "You are here!"
    });
}

var saveEntry = function (pEvt) {

    var entry = {};
    entry.created = new Date();
    entry.title = document.getElementById("title").value;
    entry.message = document.getElementById("entry").value;
    entry.image = base64Str;
    entry.location = {};
    entry.location.latitude = currentLocation.coords.latitude;
    entry.location.longitude = currentLocation.coords.longitude;

    console.log("saving... ");
    console.log(entry);
    localStorage.setItem((new Date()).getTime(), JSON.stringify(entry));
    
    window.location.reload();

}

var _loadEntries = function(){

    var domParser = new DOMParser();
    
    var entryKeys = Object.keys(localStorage);
    document.getElementById('entries').innerHTML = "";
    for(var i in entryKeys){
        var key = entryKeys[i];
        var entryObj =  JSON.parse(localStorage.getItem(key))
        
        var created = new Date(entryObj.created);
        
        console.log("loading... ");
        console.log(entryObj);
        
        var entry = "<article class='row'><div class='col-md-12'><h4>" + entryObj.title + "</h4>";
        entry += "<div class='label label-success'>" + created.getDate() + "." + created.getMonth() + "." + (created.getYear()+1900) + "</div>";
        entry += "<p>"+entryObj.message+"</p>";
        entry += "<div class='row'>";
        entry += "<div class='col-xs-12 col-md-6'><img id='capture_output'class='img-responsive img-thumbnail' src='data:image/gif;base64,"+entryObj.image+"' width='100%'><br><br></div>";
        if(entryObj.location != null){
            entry += "<div class='col-xs-12 col-md-6'><img src='https://maps.googleapis.com/maps/api/staticmap?center="+entryObj.location.latitude+","+entryObj.location.longitude+"&zoom=15&size=300x300'></div>";
        entry += "</div>";
        entry += "</article><hr>";
        
        }
        
        document.getElementById('entries').innerHTML += entry;
        
    }
    
    
}