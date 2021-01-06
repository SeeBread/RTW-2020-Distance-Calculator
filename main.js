

markerArr = []
animationMarkers = []
lineArr = []

var totalStep;
var distanceMeasureMax;



function haversine_distance(mk1, mk2) {
    var Rm = 3958.8; // Radius of the Earth in miles
    var R = 6371.0710; // Radius of the Earth in kilometers
    var rlat1 = mk1.position.lat() * (Math.PI/180); // Convert degrees to radians
    var rlat2 = mk2.position.lat() * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (mk2.position.lng()-mk1.position.lng()) * (Math.PI/180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
    return d;
  }

async function randomCities() {

    for (v = 1; v < 10; v++) {
        document.getElementById('distance' + v).innerHTML = '&#8595;&#8595;';
    }

    document.getElementById('resultsDisplay').visible = false;

    randomCitiesArr = [];
    for (f = 0; f < 10; f++) {
        markerArr[f].setMap(null);
    }

    for (p = 0; p < 10; p++) {
        //alert(p);
        try {
            const proxyurl = "https://cors-anywhere.herokuapp.com/";
            const apiUrl = `https://api.3geonames.org/?randomland=yes&json=1`;
            //console.log(apiUrl);
            inow = p;
            let response = await fetch(proxyurl + apiUrl);
            let responseJSON = await response.json();
            if (response.ok) {
                console.log(responseJSON);
                let location = '(' + responseJSON.major.latt + ', ' + responseJSON.major.longt + ')';
                let currentLabel = document.getElementById('txtautocomplete' + (inow + 1));
                if (typeof responseJSON.major.prov === 'string') {
                    province = responseJSON.major.prov;
                } else {
                    province = '';
                }
                if (typeof responseJSON.major.state === 'string') {
                    state = responseJSON.major.state;
                } else {
                    state = '';
                }
                currentLabel.value = responseJSON.major.city + ', ' + province + ', ' + state;
                randomCitiesArr.push(location);
                //drawRandomMarkers(inow, location);

                markerArr[inow].setMap(null);
                createMarker(inow, location);
            } else {
                console.log(responseJSON.message);
            }
        } catch (error) {
            console.log(error);
        }
    }
}


// Initialize and add the map
var map;
function initMap() {
  // The map, centered on Central Park
  const center = {lat: 40.774102, lng: 35.971734};
  const options = {zoom: 1.7, scaleControl: true, center: center};
  map = new google.maps.Map(
      document.getElementById('map'), options);
  // Locations of landmarks
  startLocations = [
      {lat: -1.2903935, lng: 36.8165834},
      {lat: 51.48389399999999, lng: -0.6044026999999998},
      {lat: 44.5955556, lng: 33.5233333},
      {lat: 22.5646081, lng: 88.34326449999999},
      {lat: 21.9928775, lng: 96.0965524},
      {lat: -41.28293619999999, lng: 174.7666016},
      {lat: -16.4964949, lng: -68.13901609999999},
      {lat: 42.3466764, lng: -71.0972178},
      {lat: 66.5436144, lng: 25.8471974},
      {lat: -6.162249099999999, lng: 39.1878026},
  ]

  let timeDelay = 1;


    for (i = 0; i < 10; i++) {
        let inow = i;

        setTimeout(function(){
            let startMarker = new google.maps.Marker({position: startLocations[inow], map: map, animation: google.maps.Animation.DROP});
            startMarker.lat = startLocations[inow].lat;
            startMarker.lng = startLocations[inow].lng;
            markerArr[inow] = startMarker; 

        }, timeDelay);

    timeDelay += 200;
        }




  for (i = 0; i < 10; i++) {
    const autocomplete = new google.maps.places.Autocomplete(document.getElementById('txtautocomplete' + (i + 1)));
    autocomplete.setFields(["address_components", "geometry", "icon", "name", "formatted_address"]);
    autocomplete.id = i;
    autocomplete.addListener("place_changed", () => {
        var place = autocomplete.getPlace();
        createMarker(autocomplete.id, place.geometry.location);

    });
  }
}

function createMarker(n, location) {
    //alert(location);
    clearLines()
    let locationArr = location.toString().split(',');
    let latlng = {
        lat: Number(locationArr[0].substring(1)),
        lng: Number(locationArr[1].slice(0, -1)),
    }
    if (markerArr[n]) {
        markerArr[n].setMap(null);
    }
    let newMarker = new google.maps.Marker({position: latlng, map: map, animation: google.maps.Animation.DROP});
    newMarker.lat = latlng.lat;
    newMarker.lng = latlng.lng;
    markerArr[n] = newMarker;
    console.log(markerArr);
    
    //alert(newMarker.position);

}

let individualDistances = [];

function calculateDistance() {
    let total = 0;
    individualDistances = [];
    //console.log(markerArr);
    for (m = 0; m <= 9; m++) {
        if (markerArr[m + 1] !== undefined) {
            var distance = haversine_distance(markerArr[m], markerArr[m+1]);
            individualDistances.push(distance);
            total += distance;
        }
    }
    //console.log(individualDistances)
    return total.toFixed(4);
}

function preAnimate() {
    document.getElementById('smallprint').hidden = false;
    document.getElementById('resultsDisplay').style.visibility = 'visible';
    animationMarkers = [...markerArr];
    totalStep = 0
    distanceMeasureMax = (markerArr.length * 100) - 100;
    let total = calculateDistance();
    console.log(total);
    drawLines(total);
}

function drawLines(total) {

    document.getElementById('resultsDisplay').visible = true;

    //tidyArray();


    if (animationMarkers[1] !== undefined && animationMarkers.length > 1) {
        document.getElementById('drawButton').disabled = true;
        document.getElementById('clearButton').disabled = true;

        //alert('drawing line ');
        var departure = new google.maps.LatLng(animationMarkers[0].lat, animationMarkers[0].lng); //Set to whatever lat/lng you need for your departure location
        var arrival = new google.maps.LatLng(animationMarkers[1].lat, animationMarkers[1].lng); //Set to whatever lat/lng you need for your arrival location
        var line = new google.maps.Polyline({
            path: [departure, departure],
            strokeColor: "#FF0000",
            strokeOpacity: 1,
            strokeWeight: 3,
            geodesic: true, 
            map: map,
        });
        var step = 0;
        var numSteps = 99; //Change this to set animation resolution
        var timePerStep = 1; //Change this to alter animation speed
        var interval = setInterval(function() {
            step += 1;
            totalStep += 1;
            //console.log(step);
            //console.log(totalStep);
            let distanceDisplay =  (total * (totalStep / distanceMeasureMax)).toFixed(2);
            let distanceMiles = (distanceDisplay * 0.621371).toFixed(2);
            document.getElementById('km').innerHTML = distanceDisplay + ' km';
            document.getElementById('miles').innerHTML = distanceMiles + ' miles';
            document.getElementById('legs').innerHTML = ((markerArr.length - 1) * (totalStep/distanceMeasureMax)).toFixed(0) + ' legs';
            document.getElementById('foot').innerHTML = (((distanceMiles / 3.1) / 24) / 7).toFixed(0) + ' weeks on foot';
            document.getElementById('car').innerHTML = ((distanceMiles / 60) / 24).toFixed(0) + ' days by car';
            document.getElementById('plane').innerHTML = ((distanceMiles / 575)).toFixed(0) + ' hours on a plane';
            document.getElementById('bubblecraft').innerHTML = ((distanceMiles / 1000)).toFixed(0) + ' minutes on a bubblecraft';
            //document.getElementById('raised').innerHTML = 'over $' + (5000 * (totalStep/distanceMeasureMax)).toFixed(2) + ' raised';


            let currentLeg = 11 - animationMarkers.length;
            document.getElementById('distance' + currentLeg).innerHTML = (individualDistances[currentLeg - 1] * (step/100)).toFixed(2) + ' km';
            //console.log(currentLeg)

            if (step > numSteps) {
                console.log('next leg')
                clearInterval(interval);
                animationMarkers.shift();
                drawLines(total);

            } else {
                var are_we_there_yet = google.maps.geometry.spherical.interpolate(departure,arrival,step/numSteps);
                line.setPath([departure, are_we_there_yet]);
                if(step === 99) {
                    document.getElementById('clearButton').disabled = false;
                }
            }
        }, timePerStep);
        lineArr.push(line);
    }

}

function clearLines() {
    for (i = 0; i < 10; i++) {
        if (lineArr[i] !== undefined) {
            lineArr[i].setMap(null);
        }
    }

    for (i = 1; i < 10; i++) {
        document.getElementById('distance' + (i)).innerHTML = '&#8595;&#8595;';
    }
    lineArr = [];
    document.getElementById('drawButton').disabled = false;
    document.getElementById('resultsDisplay').style.visibility = 'hidden';
    document.getElementById('clearButton').disabled = true;

}

function bounce(id) {
    markerArr[id].setAnimation(google.maps.Animation.BOUNCE);
    document.getElementById('location' + (id + 1)).style.backgroundColor = '#A9A9A9';
}

function debounce(id) {
    for (v = 0; v < markerArr.length; v++) {
        markerArr[v].setAnimation(null);
        document.getElementById('location' + (v + 1)).style.backgroundColor = '#f2f2f2';
    }
}