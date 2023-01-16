/**
 * @type HTMLCanvasElement
 */
const canvas = document.getElementById("canvas");
const guide = document.getElementById("guide");
const colorInput = document.getElementById("colorInput");
const toggleGuide = document.getElementById("toggleGuide");
const clearButton = document.getElementById("clearButton");
const drawingContext = canvas.getContext("2d");
const cdata = document.getElementById("cdata");
const scalerange = document.getElementById("scalerange");
const setc = document.getElementById("setc");
const setr = document.getElementById("setr");
const CELL_SIDE_COUNT = 30;
const cellPixelLength = canvas.width / CELL_SIDE_COUNT;
const colorHistory = {};
colorInput.hidden = true;
scalerange.hidden = true;
setc.hidden = true;
setr.hidden = true;
const colorcode = [
  "#000000",
  "#080808",
  "#101010",
  "#181818",
  "#202020",
  "#282828",
  "#303030",
  "#383838",
  "#404040",
  "#484848",
  "#505050",
  "#585858",
  "#606060",
  "#686868",
  "#707070",
  "#787878",
  "#888888",
  "#909090",
  "#989898",
  "#A0A0A0",
  "#A8A8A8",
  "#B0B0B0",
  "#B8B8B8",
  "#BEBEBE",
  "#C0C0C0",
  "#C8C8C8",
  "#D0D0D0",
  "#D3D3D3",
  "#D8D8D8",
  "#DCDCDC",
  "#E0E0E0",
  "#E8E8E8",
  "#F0F0F0",
  "#F5F5F5",
  "#F8F8F8",
  "#FFFFFF",
];
// Set default color
colorInput.value = "#009578";

// Initialize the canvas background
// drawingContext.fillStyle = "#ffffff";
drawingContext.fillStyle = "#000000";
drawingContext.fillRect(0, 0, canvas.width, canvas.height);

// Setup the guide
{
  guide.style.width = `${canvas.width}px`;
  guide.style.height = `${canvas.height}px`;
  guide.style.gridTemplateColumns = `repeat(${CELL_SIDE_COUNT}, 1fr)`;
  guide.style.gridTemplateRows = `repeat(${CELL_SIDE_COUNT}, 1fr)`;

  [...Array(CELL_SIDE_COUNT ** 2)].forEach(() =>
    guide.insertAdjacentHTML("beforeend", "<div></div>")
  );
}

function handleCanvasMousedown(e) {
  // Ensure user is using their primary mouse button
  if (e.button !== 0) {
    return;
  }

  const canvasBoundingRect = canvas.getBoundingClientRect();
  const x = e.clientX - canvasBoundingRect.left;
  const y = e.clientY - canvasBoundingRect.top;
  const cellX = Math.floor(x / cellPixelLength);
  const cellY = Math.floor(y / cellPixelLength);
  const currentColor = colorHistory[`${cellX}_${cellY}`];

  if (e.ctrlKey) {
    if (currentColor) {
      colorInput.value = currentColor;
      console.log("king");
    }
  } else {
    console.log("hey");
    fillCell(cellX, cellY);
  }
}

function handleClearButtonClick() {
  const yes = confirm("Are you sure you wish to clear the canvas?");

  if (!yes) return;
  if (cdata.value === "1") {
    drawingContext.fillStyle = "#000000";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    drawingContext.fillStyle = "#ffffff";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function handleToggleGuideChange() {
  guide.style.display = toggleGuide.checked ? null : "none";
}

function fillCell(cellX, cellY) {
  const startX = cellX * cellPixelLength;
  const startY = cellY * cellPixelLength;
  if (cdata.value === "1") {
    drawingContext.fillStyle = "#ffffff";
    colorHistory[`${cellX}_${cellY}`] = "#ffffff";
  } else if (cdata.value === "2") {
    var RangeValue = Math.round((scalerange.value / 255) * 36);
    console.log(RangeValue);
    drawingContext.fillStyle = colorcode[RangeValue];
    colorHistory[`${cellX}_${cellY}`] = colorcode[RangeValue];
    var canvas = document.getElementById("canvas");
    var imgData = canvas.toDataURL();
    console.log(imgData);
  } else {
    drawingContext.fillStyle = colorInput.value;
    colorHistory[`${cellX}_${cellY}`] = colorInput.value;
  }

  drawingContext.fillRect(startX, startY, cellPixelLength, cellPixelLength);
}
function c_data_change() {
  if (cdata.value === "1") {
    colorInput.hidden = true;
    scalerange.hidden = true;
    drawingContext.fillStyle = "#000000";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
  } else if (cdata.value === "2") {
    setc.hidden = true;
    setr.hidden = false;
    colorInput.hidden = true;
    scalerange.hidden = false;
    drawingContext.fillStyle = "#ffffff";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
  } else if (cdata.value === "3") {
    setr.hidden = true;
    setc.hidden = false;
    scalerange.hidden = true;
    colorInput.hidden = false;
    scalerange.hidden = true;
    drawingContext.fillStyle = "#ffffff";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
  }
}

canvas.addEventListener("mousedown", handleCanvasMousedown);
clearButton.addEventListener("click", handleClearButtonClick);
toggleGuide.addEventListener("change", handleToggleGuideChange);
cdata.addEventListener("change", c_data_change);
