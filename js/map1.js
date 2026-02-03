mapboxgl.accessToken = 'pk.eyJ1IjoiYmVubmk2NjYiLCJhIjoiY21sNjZoNnVlMGNmMTNmcHJjejF5MjY2ZSJ9.HZCyV0Yiu4FXBwelJyogww';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  zoom: 3,
  center: [-100, 40],
  projection: 'albers' // ✅ correct way for Mapbox GL JS v2.15
});

async function geojsonFetch() {
  // load GeoJSON
  let response = await fetch('assets/us-covid-2020-rates.geojson');
  let covidData = await response.json();

  map.on('load', function loadingData() {
    // source
    map.addSource('covidData', {
      type: 'geojson',
      data: covidData
    });

    // layer
    map.addLayer({
      id: 'covidData-layer',
      type: 'fill',
      source: 'covidData',
      paint: {
        'fill-color': [
          'step',
          ['coalesce', ['get', 'rates'], 0],
          '#FFEDA0',
          10, '#FED976',
          20, '#FEB24C',
          50, '#FD8D3C',
          100, '#FC4E2A',
          200, '#E31A1C',
          500, '#BD0026',
          1000, '#800026'
        ],
        'fill-outline-color': '#BBBBBB',
        'fill-opacity': 0.7
      }
    });

    // legend
    const layers = ['0-9', '10-19', '20-49', '50-99', '100-199', '200-499', '500-999', '1000 and more'];
    const colors = ['#FFEDA070', '#FED97670', '#FEB24C70', '#FD8D3C70', '#FC4E2A70', '#E31A1C70', '#BD002670', '#80002670'];

    const legend = document.getElementById('legend');
    legend.innerHTML = "<b>COVID-19 Rate<br>(cases per 100,000 residents)</b><br><br>";

    layers.forEach((layer, i) => {
      let item = document.createElement('div');

      let key = document.createElement('span');
      key.className = 'legend-key';
      key.style.backgroundColor = colors[i];

      let value = document.createElement('span');
      value.innerHTML = layer;

      item.appendChild(key);
      item.appendChild(value);
      legend.appendChild(item);
    });

    // hover interaction
    map.on('mousemove', ({ point }) => {
      const county = map.queryRenderedFeatures(point, { layers: ['covidData-layer'] });

      document.getElementById('text-description').innerHTML = county.length
        ? `<h3>${county[0].properties.county}, ${county[0].properties.state}</h3>
           <p><strong><em>${county[0].properties.rates}</strong> cases per 100k</em></p>`
        : `<p>Hover over a county!</p>`;
    });
  });
}

geojsonFetch();
