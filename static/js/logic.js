
function createMap(data, tectonic_data) {
  
  // STEP 1: Create Base Layers

  // Define variables for our tile layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });


  // Step 2: Create the Overlay layers
  
  // Create Arrays
  let circleArray = [];
  let markers = L.markerClusterGroup();
  let heatArray = [];
  
  // Populate the Arrays
  for (let i = 0; i < data.length; i++){
    let row = data[i];
    let location = row.geometry;

    // Create Markers
    if (location) {
        // Extract Latitude and Longitude
        let point = [location.coordinates[1], location.coordinates[0]];

        // Create Markers at point and assign a Popup Label 
        let marker = L.marker(point);
        let popup = `<h1>${row.properties.title}</h1>`;
        marker.bindPopup(popup);
        markers.addLayer(marker);

        // Create "Heat" at point
        heatArray.push(point);

        // Create Circles at point
        let circleMarker = L.circle(point, {
            fillOpacity: 0.6,
            color: "black",
            weight: 0.8,
            fillColor: chooseColor(location.coordinates[2]),
            radius: markerSize(row.properties.mag)
        }).bindPopup(popup);

        circleArray.push(circleMarker);     
    };
  };

  // Create Heat Layer from Array
  let heatLayer = L.heatLayer(heatArray, {
    radius: 50,
    blur: 0,
    maxOpacity: 1.0 
  });

  // Create Circle Layer form Array
  let circleLayer = L.layerGroup(circleArray); 
  
  // Create Tectonic Layer
  let geo_layer = L.geoJSON(tectonic_data)


  // Step 3: Create Map Controls

  // Base Layer Controls
  let baseLayers = {
    Street: street,
    Topography: topo
  };

  // Overlay Controls
  let overlayLayers = {
    Circles: circleLayer,
    "Cluster Markers": markers,
    Heatmap: heatLayer,
    "Tectonic Plates": geo_layer
  };


  // Step 4: Initialize the map 

  let quake_map = L.map("map", {
    center: [38.0000, -111.0000],
    zoom: 5.5,
    layers: [street, geo_layer, circleLayer]
  });


  // Step 5: Add the Layer Controls to map
  L.control.layers(baseLayers, overlayLayers).addTo(quake_map);


  // Step 6: Add a legend to the map to explain color scale
  let legend = L.control({position: "bottomright"});
  legend.onAdd = function() {
    // Create div
    let div = L.DomUtil.create("div", "info legend");

    // Add the Info on the legend
    let legendInfo = "<i style='background: #98EE00'></i>-10-10<br/>";
    legendInfo += "<i style='background: #D4EE00'></i>10-30<br/>";
    legendInfo += "<i style='background: #EECC00'></i>30-50<br/>";
    legendInfo += "<i style='background: #EE9C00'></i>50-70<br/>";
    legendInfo += "<i style='background: #EA822C'></i>70-90<br/>";
    legendInfo += "<i style='background: #EA2C2C'></i>90+<br/>";

    div.innerHTML = legendInfo;
    return div;
  };

  // Adding the legend to quake_map
  legend.addTo(quake_map);
};


// Start Helper Functions

// Manage Circle Size
function markerSize(mag) {
    let radius = 1;

    if (mag > 0) {
        radius = mag * 10000;
    }

    return radius
};

// Manage Circle color
function chooseColor(depth) {
    let color = "black";

    // If statement for depth of quakes
    if (depth <= 10) {
        color = "#98EE00";
    } else if (depth <= 30) {
        color = "#D4EE00";
    }else if (depth <= 50) {
        color = "#EECC00";
    }else if (depth <= 70) {
        color = "#EE9C00";
    }else if (depth <= 90) {
        color = "#EA822C";
    }else {
        color = "#EA2C2C";
    }

    // Return correct color
    return (color);
};

// End Helper Functions


  
// Run the created map and layers
function earthquake_map() {
  
  // Assemble the API query URL.
  // Earthquakes URL
  let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  // Tectonic Plates URL
  let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

  // Fetch Quake data
  d3.json(url).then(function (data) {
    // Fetch Tectonic data
    d3.json(url2).then(function (tectonic_data) {
    let data_rows = data.features;

    createMap(data_rows, tectonic_data);
    });
  });
}

// On default load in
earthquake_map();
