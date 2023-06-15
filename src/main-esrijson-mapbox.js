import "./style.css";

import EsriJSON from 'ol/format/EsriJSON.js';
import Map from 'ol/Map.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import { OSM } from "ol/source";
import XYZ from 'ol/source/XYZ.js';
import {Fill, Stroke, Style} from 'ol/style.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {createXYZ} from 'ol/tilegrid.js';
import {fromLonLat} from 'ol/proj.js';
import {tile as tileStrategy} from 'ol/loadingstrategy.js';

import MapboxVectorLayer from "ol/layer/MapboxVector.js";

const serviceUrl = 'https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Transportation/HeavyVehicleRoutesAndRestrictions/MapServer/';
const layer = '18';
const accessToken = "pk.eyJ1Ijoibmh2ci1wcm9kdWN0aW9uIiwiYSI6ImNsZWRpbHg1MzA0bTM0Mmxmb2V6M2dsaW4ifQ._0Dc9yxbFdL06WkpE6vm8g";

const fillColors = {
  // 'Lost To Sea Since 1965': [0, 0, 0, 1],
  // 'Urban/Built-up': [104, 104, 104, 1],
  // 'Shacks': [115, 76, 0, 1],
  // 'Industry': [230, 0, 0, 1],
  // 'Wasteland': [230, 0, 0, 1],
  // 'Caravans': [0, 112, 255, 0.5],
  // 'Defence': [230, 152, 0, 0.5],
  // 'Transport': [230, 152, 0, 1],
  // 'Open Countryside': [255, 255, 115, 1],
  // 'Woodland': [38, 115, 0, 1],
  // 'Managed Recreation/Sport': [85, 255, 0, 1],
  // 'Amenity Water': [0, 112, 255, 1],
  // 'Inland Water': [0, 38, 115, 1],
};

const style = new Style({
  fill: new Fill(),
  stroke: new Stroke({
    color: [0, 0, 0, 1],
    width: 2,
  }),
});

const vectorSource = new VectorSource({
  format: new EsriJSON(),
  url: function (extent, resolution, projection) {

    console.log('extent', extent);
    console.log('resluton', resolution);
    console.log('projection', projection)
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid = projection
      .getCode()
      .split(/:(?=\d+$)/)
      .pop();

      console.log('srid', srid);

    const url = 
      serviceUrl +
      layer +
      '/query/?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent(
        '{"xmin":' +
          extent[0] +
          ',"ymin":' +
          extent[1] +
          ',"xmax":' +
          extent[2] +
          ',"ymax":' +
          extent[3] +
          ',"spatialReference":{"wkid":' +
          srid +
          '}}'
      ) +
      '&geometryType=esriGeometryEnvelope&inSR=' +
      srid +
      '&outFields=*' +
      '&outSR=' +
      srid;

    return url;
  },
  strategy: tileStrategy(
    createXYZ({
      tileSize: 512,
    })
  ),
  // attributions:
  //   'University of Leicester (commissioned by the ' +
  //   '<a href="https://www.arcgis.com/home/item.html?id=' +
  //   'd5f05b1dc3dd4d76906c421bc1727805">National Trust</a>)',
});

// https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Transportation/HeavyVehicleRoutesAndRestrictions/MapServer18/query/?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22%3A15028131.257091936%2C%22ymin%22%3A-10018754.17139462%2C%22xmax%22%3A20037508.342789248%2C%22ymax%22%3A-5009377.085697309%2C%22spatialReference%22%3A%7B%22wkid%22%3A3857%7D%7D
//&geometryType=esriGeometryEnvelope&inSR=3857&outFields=*&outSR=3857

const vector = new VectorLayer({
  source: vectorSource,
  style: function (feature) {
    const classify = feature.get('street');
    const color = fillColors[classify] || [0, 0, 0, 0];
    style.getFill().setColor(color);
    return style;
  },
  opacity: 0.7,
});

const raster = new TileLayer({
  // source: new XYZ({
  //   attributions:
  //     'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
  //     'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
  //   url: 
  //     'https://server.arcgisonline.com/ArcGIS/rest/services/' +
  //     'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  // }),

  source: new XYZ({
    url: `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
    attributions: '© <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    maxZoom: 18,
  }),


});

const mapboxVectorLayer = new MapboxVectorLayer({
  styleUrl: "mapbox://styles/mapbox/streets-v11",
  accessToken:
    "pk.eyJ1Ijoibmh2ci1wcm9kdWN0aW9uIiwiYSI6ImNsZWRpbHg1MzA0bTM0Mmxmb2V6M2dsaW4ifQ._0Dc9yxbFdL06WkpE6vm8g",
  zoom: 1,
});

const map = new Map({
  layers: [mapboxVectorLayer,vector],
  target: document.getElementById('map'),
  view: new View({
    center: fromLonLat([138,-24]),
    zoom: 5,
  }),
});

// const displayFeatureInfo = function (pixel) {
//   const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
//     return feature;
//   });
//   if (feature) {
//     const info =
//       '2014 Land Use: ' +
//       feature.get('LU_2014') +
//       '<br>1965 Land Use: ' +
//       feature.get('LU_1965');
//     document.getElementById('info').innerHTML = info;
//     map.getTarget().style.cursor = 'pointer';
//   } else {
//     document.getElementById('info').innerHTML = '&nbsp;<br>&nbsp;';
//     map.getTarget().style.cursor = '';
//   }
// };

map.on(['click', 'pointermove'], function (evt) {
  if (evt.dragging) {
    return;
  }
  // displayFeatureInfo(evt.pixel);
});
