mapboxgl.accessToken =
    'pk.eyJ1IjoiYmVubmk2NjYiLCJhIjoiY21sNjZoNnVlMGNmMTNmcHJjejF5MjY2ZSJ9.HZCyV0Yiu4FXBwelJyogww';

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 3,
    minZoom: 2,
    center: [-100, 40],
    projection: 'albers'   // PPLY ALBERS
});

// proportional symbol setup
const grades = [1000, 5000, 20000],
    colors = ['rgb(208,209,230)', 'rgb(103,169,207)', 'rgb(1,108,89)'],
    radii = [4, 12, 22];

map.on('load', () => {

    map.addSource('covidCounts', {
        type: 'geojson',
        data: 'assets/us-covid-2020-counts.geojson'
    });

    map.addLayer({
        id: 'covidCounts-point',
        type: 'circle',
        source: 'covidCounts',
        paint: {
            'circle-radius': {
                property: 'cases',
                stops: [
                    [grades[0], radii[0]],
                    [grades[1], radii[1]],
                    [grades[2], radii[2]]
                ]
            },
            'circle-color': {
                property: 'cases',
                stops: [
                    [grades[0], colors[0]],
                    [grades[1], colors[1]],
                    [grades[2], colors[2]]
                ]
            },
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': 0.6
        }
    });

    map.on('click', 'covidCounts-point', (event) => {
        const props = event.features[0].properties;
        const coords = event.features[0].geometry.coordinates;

        new mapboxgl.Popup()
            .setLngLat(coords)
            .setHTML(
                `<strong>${props.county}, ${props.state}</strong><br>
                 Total cases (2020): ${props.cases}`
            )
            .addTo(map);
    });

    map.on('mouseenter', 'covidCounts-point', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'covidCounts-point', () => {
        map.getCanvas().style.cursor = '';
    });
});

// legend
const legend = document.getElementById('legend');
let labels = ['<strong>Total Cases</strong>'];

for (let i = 0; i < grades.length; i++) {
    let dotSize = 2 * radii[i];
    labels.push(
        `<p class="break">
            <i class="dot" style="background:${colors[i]}; width:${dotSize}px; height:${dotSize}px;"></i>
            <span class="dot-label" style="top:${dotSize / 2}px;">${grades[i]}</span>
        </p>`
    );
}

labels.push(
    `<p style="text-align:right;font-size:10pt;">
        Source: <a href="https://github.com/nytimes/covid-19-data" target="_blank">NYTimes</a>
     </p>`
);

legend.innerHTML = labels.join('');
