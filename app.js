const PlotDiv3d = document.getElementById('plot3d');
const PlotDivIntensity = document.getElementById('plotIntensity');
const BASE_URL = '';
const get3dFile = async (filename) => {
  try {
    const res = await axios.get(`${BASE_URL}${filename}`);
    const rawDataFile = res.data;
    return rawDataFile;
  } catch (e) {
    console.error(e);
  }
};

window.onload = async function () {
  const raw3dFile = await get3dFile('scan3d_0_1.3d');
  //console.log(raw3dFile);
  const dataReadFrom3dFile = read3dFile(raw3dFile);
  //console.log(dataReadFrom3dFile);
  const { max_x, max_y } = checkResolution(dataReadFrom3dFile);
  //console.log(max_x, max_y);
  const {
    dataInPlotlyFormatDepth,
    dataInPlotlyFormatIntensity,
  } = convert3dFileFormatToPlotlyFormat(dataReadFrom3dFile, max_x, max_y);
  console.log(dataInPlotlyFormatDepth, dataInPlotlyFormatIntensity);
  const dataInPlotlyFormatReversedDepth = reverseAxesForPlotly(
    dataInPlotlyFormatDepth,
    max_x,
    max_y
  );
  const dataInPlotlyFormatReversedIntensity = reverseAxesForPlotly(
    dataInPlotlyFormatIntensity,
    max_x,
    max_y
  );

  plotSurface(dataInPlotlyFormatReversedDepth, PlotDiv3d);
  plotHeatmap(dataInPlotlyFormatReversedIntensity, PlotDivIntensity);
};

function read3dFile(raw3dFile) {
  let dataReadFrom3dFile = [];
  for (let line of raw3dFile.trim().split('\n')) {
    let s = line.trim().split(/[#\s]+/g);
    dataReadFrom3dFile.push({
      depth: s[0],
      b: s[1],
      c: s[2],
      d: s[3],
      e: s[4],
      f: s[5],
      intensity: s[6],
    });
  }
  return dataReadFrom3dFile;
}

function checkResolution(dataReadFrom3dFile) {
  let max_x;
  let max_y;
  if (dataReadFrom3dFile.length < 300000) {
    console.log('Resolution is 176x144');
    max_x = 176;
    max_y = 144;
  } else {
    console.log('Resolution is 640x480');
    max_x = 640;
    max_y = 480;
  }
  return { max_x, max_y };
}

function convert3dFileFormatToPlotlyFormat(dataReadFrom3dFile, max_x, max_y) {
  let i = 0;
  let x = 0;
  let dataInPlotlyFormatDepth = [];
  let dataInPlotlyFormatIntensity = [];

  // depth
  while (i < max_x * max_y) {
    data_y = [];
    for (let y = 0; y < max_y; y++) {
      if (
        dataReadFrom3dFile[i].depth < 10 ||
        dataReadFrom3dFile[i].depth > 2800
      ) {
        data_y.push(3000);
      } else {
        data_y.push(dataReadFrom3dFile[i].depth);
      }
      i++;
    }
    x++;
    dataInPlotlyFormatDepth.push(data_y);
  }
  // intensity
  i = 0;
  x = 0;
  while (i < max_x * max_y) {
    data_y = [];
    for (let y = 0; y < max_y; y++) {
      /*
        if (dataReadFrom3dFile[i].intensity < 2000) {
          data_y.push(2000);
        } else if (dataReadFrom3dFile[i].intensity > 7000) {
          data_y.push(7000);
        } else {
        */
      data_y.push(dataReadFrom3dFile[i].intensity);
      //}
      i++;
    }
    x++;
    dataInPlotlyFormatIntensity.push(data_y);
  }
  return { dataInPlotlyFormatDepth, dataInPlotlyFormatIntensity };
}

function reverseAxesForPlotly(dataInPlotlyFormat, max_x, max_y) {
  let dataInPlotlyFormatReversed = [];
  console.log(
    'array size before reversal: ' +
      dataInPlotlyFormat.length +
      ' x ' +
      dataInPlotlyFormat[0].length
  );
  for (let y = 0; y < max_y; y++) {
    let data_x = [];
    for (let x = 0; x < max_x; x++) {
      data_x.push(dataInPlotlyFormat[x][y]);
    }
    dataInPlotlyFormatReversed.push(data_x);
  }
  console.log(
    'array size after reversal: ' +
      dataInPlotlyFormatReversed.length +
      ' x ' +
      dataInPlotlyFormatReversed[0].length
  );
  return dataInPlotlyFormatReversed;
}

function plotSurface(data, div) {
  const plotlyData = [
    {
      z: data,
      type: 'surface',
    },
  ];

  var layout = {
    title: 'Camera Surface Plot',
    autosize: false,
    width: 640,
    height: 480,
    margin: {
      l: 65,
      r: 50,
      b: 65,
      t: 90,
    },
  };
  Plotly.newPlot(div, plotlyData, layout);
}

function plotHeatmap(data, div) {
  var dataPlotly = [
    {
      z: data,
      type: 'heatmap',
    },
  ];
  var layout = {
    title: 'Camera Intensity Plot',
    autosize: false,
    width: 640,
    height: 480,
    margin: {
      l: 65,
      r: 50,
      b: 65,
      t: 90,
    },
  };

  Plotly.newPlot(div, dataPlotly, layout);
}
