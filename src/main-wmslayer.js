import "./style.css";
import { Map, View } from "ol";
import { OSM, ImageArcGISRest, TileArcGISRest } from "ol/source";
import { Image as ImageLayer, Tile as TileLayer } from "ol/layer.js";
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
    title: 'National Heavy Vehicle Network',
  }),

  // Load a TileLayer from an ArcGIS wms service
  new TileLayer({
    source: new TileArcGISRest({
      ratio: 1,
      params: {
        layers: "show:18",
      },
      url: url,
    }),
    title: 'National Heavy Vehicle Network',
  }),

];

const map = new Map({
  target: "map",
  layers: layers,
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});

