import "./style.css";
import { Map, View } from "ol";
import { CartoDB, TileArcGISRest } from "ol/source";
import { Tile as TileLayer } from "ol/layer.js";
import MapboxVectorLayer from "ol/layer/MapboxVector.js";
import EsriJSON from "ol/format/EsriJSON";
import VectorSource from "ol/source/Vector";
import { createXYZ } from "ol/tilegrid";
import { fromLonLat } from "ol/proj";
import { tile as tileStrategy, bbox as bboxStrategy } from "ol/loadingstrategy";
import VectorLayer from "ol/layer/Vector";
import XYZ from "ol/source/XYZ.js";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import VectorImageLayer from "ol/layer/VectorImage";
import GeoJSON from "ol/format/GeoJSON";

const accessToken =
  "pk.eyJ1Ijoibmh2ci1wcm9kdWN0aW9uIiwiYSI6ImNsZWRpbHg1MzA0bTM0Mmxmb2V6M2dsaW4ifQ._0Dc9yxbFdL06WkpE6vm8g";

const qld =
  "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Transportation/HeavyVehicleRoutesAndRestrictions/MapServer";

const sa =
  "https://maps.sa.gov.au/arcgis/rest/services/DPTIExtTransport/RAVNet_Dynamic_Routes3/MapServer";

const mapboxBase = new MapboxVectorLayer({
  styleUrl: "mapbox://styles/mapbox/streets-v11",
  accessToken: accessToken,
  zoom: 1,
});

// Load a TileLayer from an ArcGIS wms service
const qldRasterTileLayer = new TileLayer({
  source: new TileArcGISRest({
    ratio: 1,
    params: {
      layers: "show:18",
    },
    url: qld,
  }),
  title: "National Heavy Vehicle Network",
});

const saRasterTileLayer = new TileLayer({
  source: new TileArcGISRest({
    ratio: 1,
    params: {
      layers: "show:21,22",
    },
    url: sa,
  }),
  title: "National Heavy Vehicle Network",
});

const mapboxXYZ = new TileLayer({
  source: new XYZ({
    url: `https://api.mapbox.com/styles/v1/nhvr-production/clef9mh1q000g01o8maojt6b4/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
  }),
});

const style = new Style({
  fill: new Fill(),
  stroke: new Stroke({
    color: [255, 0, 0, 1],
    width: 2,
  }),
});

// Individually setup source and vector layers

const qldVectorSource = new VectorSource({
  format: new EsriJSON(),
  url: function (extent, resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid = projection
      .getCode()
      .split(/:(?=\d+$)/)
      .pop();

    const url =
      qld +
      "/18" +
      "/query/?f=json&" +
      "returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=" +
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
          "}}"
      ) +
      "&geometryType=esriGeometryEnvelope&inSR=" +
      srid +
      "&outFields=*" +
      "&outSR=" +
      srid;

    return url;
  },
  strategy: tileStrategy(
    createXYZ({
      tileSize: 512,
    })
  ),
});

const qldESRIGeoJSONLayer = new VectorLayer({
  style: style,
  opacity: 0.7,
  source: qldVectorSource,
});

const saVectorSource = new VectorSource({
  format: new EsriJSON(),
  url: function (extent, resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid = projection
      .getCode()
      .split(/:(?=\d+$)/)
      .pop();

    const url =
      sa +
      "/22" +
      "/query/?f=json&" +
      "returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=" +
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
          "}}"
      ) +
      "&geometryType=esriGeometryEnvelope&inSR=" +
      srid +
      "&outFields=*" +
      "&outSR=" +
      srid;

    return url;
  },
  strategy: tileStrategy(
    createXYZ({
      tileSize: 256,
    })
  ),
});

const saESRIGeoJSONLayer = new VectorLayer({
  style: style,
  opacity: 0.7,
  source: saVectorSource,
});

// Carto (NSW) as a Vector Source

// Define the CartoDB source URL
const query =
  "SELECT * FROM \"rms-apps\".ds_hml_rav_routes WHERE scheme = 'GML' AND vehicle_type IN ('19m B-double', '23m B-double', '25m B-double', 'Road Train') AND is_approved = 'Y'";
const url = `https://rms-apps.carto.com/api/v1/sql?q=${encodeURIComponent(
  query
)}&format=geojson&api_key=default_public&rand=${Math.random()}`;

// Create a CartoDB source
const nswCartoGeoJSONSource = new VectorSource({
  format: new GeoJSON(),
  url: url,
});

// Create a vector layer with the CartoDB source
const nswVectorLayer = new VectorLayer({
  source: nswCartoGeoJSONSource,
  style: style,
});

// Carto (NSW) as a raster tile source

const account = "rms-apps";

// Create the CartoDB source
const nswCartoDBSource = new CartoDB({
  account: account,
  config: {
    layers: [
      {
        options: {
          sql: "SELECT * FROM \"rms-apps\".ds_hml_rav_routes WHERE scheme = 'GML' AND vehicle_type IN ('19m B-double', '23m B-double', '25m B-double', 'Road Train') AND is_approved = 'Y'",
          cartocss:
            `/** simple visualization */\n\n#ds_rt_routes{
              \n  line-opacity: 1.0;
              \n  line-smooth: 1.0;
              \n  line-cap: round;
              \n  line-join: round;
              \n  line-width: 2;
              \n  [scheme = 'GML'] {
                \n      line-color: #FF0000;
                \n      line-width:  1;
                \n    }
              \n  [scheme = 'HML'] {
                \n      line-color: #00FF00;
                \n      line-width: 1;
                \n  }
          \n}`,
          cartocss_version: "2.1.0",
          interactivity: [
            "gaz_citation",
            "gaz_date",
            "gaz_page_num",
            "gaz_valid_to",
            "guid",
            "is_approved",
            "is_condition",
            "is_exception",
            "is_gml",
            "is_hml",
            "publish_date",
            "road_name",
            "road_number",
            "road_section_id",
            "route_end",
            "route_locality",
            "route_start",
            "route_type",
            "scheme",
            "travel_restriction",
            "vehicle_type",
          ],
        },
        type: "cartodb",
      },
    ],
  },
});

// Create a vector layer with the CartoDB source
const nswCartoVectorLayer = new TileLayer({
  source: nswCartoDBSource,
});

// Map instance

const map = new Map({
  target: "map",
  layers: [
    mapboxBase,
    // qldLayer,

    // mapboxXYZ,
    qldESRIGeoJSONLayer,
    saESRIGeoJSONLayer,

    // saLayer,

    // carto or geojson
    nswCartoVectorLayer, // carto
    // nswVectorLayer // geojson
  ],
  view: new View({
    center: fromLonLat([138, -24]),
    zoom: 5,
  }),
});



let extentTimerId;
function completeTaskWithTimeout(callback, timeoutDuration) {
  // clear the previous timeout if it exists
  clearTimeout(extentTimerId);

  // start a new timeout to update the extent
  extentTimerId = setTimeout(() => callback(), timeoutDuration);
}

let currZoom = map.getView().getZoom();

function updateExtent() {
  const newZoom = map.getView().getZoom();
  if (currZoom != newZoom) {
    console.log("update extent");
    const extent = map.getView().calculateExtent(map.getSize());
    tileStrategy.extent = extent;
    saVectorSource.refresh();
    qldVectorSource.refresh();
    currZoom = newZoom;
  }
}

// Listen to the moveend and zoomend events of the map
map.on("moveend", () => {
  completeTaskWithTimeout(updateExtent, 500);
});

// example click
map.on("click", (event) => {
  console.log("event", event);
  map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
    console.log("feature/layer", feature, layer);
    if (
      layer === saESRIGeoJSONLayer &&
      feature.getGeometry().getType() === "LineString"
    ) {
      const properties = feature.getProperties();
      console.log(properties);
    }
  });
});

map.on("pointermove", (event) => {
  const pixel = event.pixel;
  const hit = map.hasFeatureAtPixel(pixel, {
    layerFilter: (layer) => [saESRIGeoJSONLayer, qldESRIGeoJSONLayer].includes(layer),
  });

  if (hit) {
    map
      .getFeaturesAtPixel(pixel, {
        layerFilter: (layer) => [saESRIGeoJSONLayer, qldESRIGeoJSONLayer].includes(layer),
      })
      .forEach((feature) => {
        if (feature.getGeometry().getType() === "LineString") {
          const properties = feature.getProperties();
          console.log(properties);
        }
      });
  }
});
