// Script by Amanda Weaver, UNG IESA
// Calculate NBR change of Anak Krakatau leading to the 2018 eruption

// Pull Landsat 8 image and needed bands
var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .select(
        ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'],
        ['blue', 'green', 'red', 'nir', 'swir1', 'swir2']
    );
    
var point = ee.Geometry.Point([105.42, -6.100]);
Map.centerObject(point, 11);

var preImage = landsat8
    .filterBounds(point)
    .filterDate('2018-12-01', '2019-01-01')
    .sort('CLOUD_COVER', true)
    .first();
    
var postImage = landsat8
    .filterBounds(point)
    .filterDate('2019-12-01', '2021-01-01')
    .sort('CLOUD_COVER', true)
    .first();

var visParam = {
    'bands': ['swir2', 'nir', 'red'],
    'min': 7750,
    'max': 22200
};
Map.addLayer(preImage, visParam, 'pre');
Map.addLayer(postImage, visParam, 'post');

// Calculate NBR.
var ndviPre = preImage.normalizedDifference(['nir', 'red'])
    .rename('ndvi_pre');
var ndviPost = postImage.normalizedDifference(['nir', 'red'])
    .rename('ndvi_post');

// 2-date change.
var diff = ndviPost.subtract(ndviPre).rename('change');

var palette = [
    '011959', '0E365E', '1D5561', '3E6C55', '687B3E',
    '9B882E', 'D59448', 'F9A380', 'FDB7BD', 'FACCFA'
];
var visParams = {
    palette: palette,
    min: -0.2,
    max: 0.2
};
Map.addLayer(diff, visParams, 'change');

// Classify change 
var thresholdGain = 0.03;
var thresholdLoss = -0.03;

var diffClassified = ee.Image(0);

diffClassified = diffClassified.where(diff.lte(thresholdLoss), 2);
diffClassified = diffClassified.where(diff.gte(thresholdGain), 1);

var changeVis = {
    palette: 'fcffc8,2659eb,fa1373',
    min: 0,
    max: 2
};

Map.addLayer(diffClassified.selfMask(),
    changeVis,
    'change classified by threshold');
