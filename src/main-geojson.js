import "./style.css";
import { Map, View } from "ol";
import {
  OSM,
  ImageArcGISRest
} from "ol/source";
import {
  Image as ImageLayer,
  Tile as TileLayer,
  MapboxVector as MVT,
} from "ol/layer.js";
import MapboxVectorLayer from "ol/layer/MapboxVector.js";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

const url =
  "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Transportation/HeavyVehicleRoutesAndRestrictions/MapServer";

const layers = [
  // Setup OSM as a base layer
  new TileLayer({
    source: new OSM(),
    title: "National Heavy Vehicle Network",
  }),

  // Load a ArcGIS REST TileLayer as MVT
  new ImageLayer({
    source: new ImageArcGISRest({
      ratio: 1,
      params: {
        layers: "show:18",
      },
      url: url,
    }),
  }),
];

const map = new Map({
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
  layers: [
    new MapboxVectorLayer({
      styleUrl: "mapbox://styles/mapbox/streets-v11",
      accessToken:
        "pk.eyJ1Ijoibmh2ci1wcm9kdWN0aW9uIiwiYSI6ImNsZWRpbHg1MzA0bTM0Mmxmb2V6M2dsaW4ifQ._0Dc9yxbFdL06WkpE6vm8g",
      zoom: 1,
    }),
  ],
  target: "map",
});

const params = {
  where: "1=1",
  outFields: "*",
  returnGeometry: true,
  f: "geojson",
  isDataVersioned: false,
  isDataArchived: false,
};

const style = new Style({
  fill: new Fill({
    color: "#000000",
  }),
  stroke: new Stroke({
    color: "#000000",
    width: 1,
  }),
});

// Use the GeoJSON to create an OpenLayers vector layer
const addVectorLayer = (layerId) => {
  // geojson
  new VectorLayer({
    source: new VectorSource({
      url: `${url}/${layerId}/query?${new URLSearchParams(params)}`,
      // features: new GeoJSON().readFeatures(geojson),
      format: new GeoJSON(),
    }),
    style: style,
    map: map,
  });
};

addVectorLayer(18);
