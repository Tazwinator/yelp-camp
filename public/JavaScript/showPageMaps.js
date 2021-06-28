  mapboxgl.accessToken = mapToken; // From show.ejs
  const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/satellite-v9', // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 9 // starting zoom
  });


  new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({offset: 25})
      .setHTML(
        `<h3>${ campground.title }</h3><p>${ campground.location }</p>`
      )
    )
    .addTo(map);

  // Below is for the map style switching
  const layerList = document.getElementById('menu'); // Standard DOM
  const inputs = layerList.getElementsByTagName('input');
 
  function switchLayer(layer) {
  const layerId = layer.target.id; // id of the input clicked
  map.setStyle('mapbox://styles/mapbox/' + layerId);
  }
 
  for (let i = 0; i < inputs.length; i++) {
  inputs[i].onclick = switchLayer; 
  // Cycles through (listens) all the inputs and when one is clicked passes it
  // to switchLayer
  }

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'bottom-right');