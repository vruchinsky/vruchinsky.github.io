const largestNumberToDisplay = 4999;
const smallestNumberToDisplay = 0;

const arabicNumeralsElement = document.getElementById("DisplayArabic");
const romanToArabicConnectorCanvas = document.getElementById("ConnectRomanToArabic");
const romanNumeralsAdditiveCanvas = document.getElementById("DisplayRomanAdditive");
const romanNumeralsSubtractiveCanvas = document.getElementById("DisplayRomanSubtractive");
const romanAdditiveToSubtractiveConnectorCanvas = document.getElementById("ConnectRomanAdditiveToSubtractive");
const incrementButton = document.getElementById("incrementButton");
const decrementButton = document.getElementById("decrementButton");
const tallyCanvas = document.getElementById("tally");
const AnimationSpeedMetamorphosisInput = document.getElementById("AnimationSpeedMetamorphosis");
const AnimationSpeedMetamorphosisDisplay = document.getElementById("DisplayAnimationSpeedMetamorphosis");
const AnimationSpeedClosingTheGapsInput = document.getElementById("AnimationSpeedClosingTheGaps");
const AnimationSpeedClosingTheGapsDisplay = document.getElementById("DisplayAnimationSpeedClosingTheGaps");

let AnimationSpeedMetamorphosis = parseFloat(AnimationSpeedMetamorphosisInput.value);
AnimationSpeedMetamorphosisDisplay.textContent = AnimationSpeedMetamorphosis.toString();
let AnimationSpeedClosingTheGaps = parseFloat(AnimationSpeedClosingTheGapsInput.value);
AnimationSpeedClosingTheGapsDisplay.textContent = AnimationSpeedClosingTheGaps.toString();

AnimationSpeedMetamorphosisInput.addEventListener('input', function() {
    AnimationSpeedMetamorphosis = parseFloat(AnimationSpeedMetamorphosisInput.value);
    AnimationSpeedMetamorphosisDisplay.textContent = AnimationSpeedMetamorphosis.toString();
});
AnimationSpeedClosingTheGapsInput.addEventListener('input', function() {
    AnimationSpeedClosingTheGaps = parseFloat(AnimationSpeedClosingTheGapsInput.value);
    AnimationSpeedClosingTheGapsDisplay.textContent = AnimationSpeedClosingTheGaps.toString();
});

const foregroundWeightBoxBoundary = 0.3;
const foregroundWeightBoxBoundary2 = 0.2;
const foregroundWeightConnector = 0.2;
const tallyMarkHeight = 25;
const tallyMarkThickness = 1;
const hSpace = 2;
const vSpaceBetweenTallyMarks = 3;
const vSpaceBetween5s = 6;
const vSpaceBetween50s = 6;
const hOffset = 2;
const vOffset = 2;
const boundaryThickness = 1;
const boundaryPadding = 2;
const hSpaceBetween5s = 2;
const hSpaceBetween100s = 3.6;
const hSpaceBetween500s = 8;
const hOffsetBetween1000s = 1;
const vOffsetBetween1000s = 1;
const vOffsetBetween5s = Math.ceil(vSpaceBetweenTallyMarks / 2);
const connectingLineBeginningVerticalSectionLength = 3;
const connectingLineEndingVerticalSectionLength = 3;
const boxCornerRadius = 2;
const braceArcRadius = 4; // radius of each arc of a long brace
let box1000hPos = 0;
let box1000width = 0;
const buttonNormalColor = incrementButton.style.backgroundColor;
const buttonDisabledColor = "#707070";
const buttonPressedColor = "#A0A0A0";
const buttonHoverColor = "#C0C0C0";

let inputNumber = 0;
let romanNumeralsAdditive = "";
let romanNumeralsSubtractive = "";
let incrementOrDecrementExecuting = false;

function initializeCanvas(cv, flipHorizontalAxis)
{
	if (cv.getContext == null)
		return;
	if (typeof(flipHorizontalAxis) === "undefined") flipHorizontalAxis = false; // default value
	const ctx = cv.getContext("2d");
	const rect = cv.getBoundingClientRect();
	cv.width = rect.width; // otherwise canvas width&height can be some arbitrary (possibly wrong) values
	cv.height = rect.height; //...and supposedly thin vertical lines look thick & shorter than horizontal lines supposedly of the same length
	// the above problem&solution are discussed on https://stackoverflow.com/questions/35331128/incorrect-canvas-width-value
    const style = getComputedStyle(cv);
	ctx.font = style.fontSize + " " + style.fontFamily; // otherwise font is some arbitrary default
	// the above solution is from code posted in https://stackoverflow.com/questions/59666877/how-to-use-in-a-canvas-a-text-element-with-a-font-described-in-css
	// (fragment from function getFontStyle())
	if (flipHorizontalAxis)
	{ // put grid origin at top-right corner
		ctx.translate(cv.width, 0);
		ctx.scale(-1, 1);
	}
	ctx.translate(0.5, 0.5); // otherwise, for lineWidth=1, horizontal&vertical lines look a little thick and blurry
	const canvasStyle = getComputedStyle(cv);
	ctx.fillStyle = canvasStyle.color;
}

function clearCanvas(cv)
{
	if (cv.getContext == null)
		return;
	const ctx = cv.getContext("2d");
	ctx.clearRect(-0.5, -0.5, cv.width, cv.height);
}

function eraseDrawings()
{
	clearCanvas(tallyCanvas);
	clearCanvas(romanToArabicConnectorCanvas);
	clearCanvas(romanAdditiveToSubtractiveConnectorCanvas);
	clearCanvas(romanNumeralsSubtractiveCanvas);
	box1000hPos = 0;
	box1000width = 0;
}

function setNumber(n)
{
	if (typeof n !== "undefined")
	{
		eraseDrawings();
		inputNumber = n;
		const s = convertToRomanNumeralsAdditive(inputNumber);
		setRomanNumeralsAdditive(s);
	}
	arabicNumeralsElement.value = inputNumber.toString();
	writeTally(inputNumber);
	romanNumeralsSubtractive = convertRomanNumeralsAdditiveToSubtractive(romanNumeralsAdditive);
	setRomanNumeralsSubtractive(romanNumeralsSubtractive);
	connectRomanToArabic();
	connectRomanAdditiveToSubtractive();
	connectRomanToTally();
}

const fpTolerance = 0.0001;
function fpEqual(a, b, tol) {return (a < b + tol && b < a + tol);}
function fpLess(a, b, tol) {return (a + tol < b);}
function fpLessEq(a, b, tol) {return !fpLess(b, a, tol);}

function roundedRect(ctx, x, y, width, height, radius, widthOcclude, heightOcclude) // draw rectangle with rounded corners
{ // based on https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
	let occlude = typeof widthOcclude !== "undefined" && typeof heightOcclude !== "undefined";
	widthOcclude = typeof widthOcclude !== "undefined" ? widthOcclude : 0; // measuring from the corner closest to (0,0)
	heightOcclude = typeof heightOcclude !== "undefined" ? heightOcclude : 0; // measuring from the corner closest to (0,0)
	if (widthOcclude < 1 || heightOcclude < 1) occlude = false;
	ctx.beginPath();
	if (fpLess(height, 2*radius, fpTolerance)) radius = height/2; // avoid arcs protruding outside
	if (fpLess(width, 2*radius, fpTolerance)) radius = width/2; // avoid arcs protruding outside
	const x0 = x + radius;
	const x1 = x + width - radius;
	const y0 = y + radius;
	const y1 = y + height - radius;
	const heightVisible = height - heightOcclude;
	const widthVisible = width - widthOcclude;
	const ys = occlude ? (fpLessEq(radius, heightVisible, fpTolerance) ? y+heightOcclude : y1): y0;
	ctx.moveTo(x, y0);
	if (fpLess(y0, ys, fpTolerance)) ctx.moveTo(x, ys);
	if (fpLess(ys, y1, fpTolerance)) ctx.lineTo(x, y1); // 1st line
	else ctx.moveTo(x, y1);
	if (fpLess(0, radius, fpTolerance) && fpLess(0, heightVisible, fpTolerance))
	{ // 1st rounded corner
		let startAngle = Math.PI;
		if (heightVisible - fpTolerance <= radius)
		{
			const s = (radius - heightVisible) / radius;
			const c = Math.sqrt(1 - s*s);
			if (fpLess(widthOcclude, radius*(1-c), fpTolerance))
				startAngle = Math.acos((radius - widthOcclude) / radius);
			else startAngle = Math.asin(s);
		}
		ctx.arc(x0, y1, radius, startAngle, 0.5*Math.PI, true);
	} else ctx.moveTo(x0, y + height);
	if (occlude == false || fpLess(0, heightVisible, fpTolerance))
		ctx.lineTo(x1, y + height); // 2nd line
	else ctx.moveTo(x1, y + height);
	if (fpLess(0, radius, fpTolerance) && fpLess(0, widthVisible, fpTolerance) && fpLess(0, heightVisible, fpTolerance))
		ctx.arc(x1, y1, radius, 0.5*Math.PI, 0, true); // 2nd rounded corner
	else
		ctx.moveTo(x + width, y1);
	if (occlude == false || fpLess(0, widthVisible, fpTolerance))
		ctx.lineTo(x + width, y0); // 3rd line
	else ctx.moveTo(x + width, y0);
	if (fpLess(0, radius, fpTolerance) && fpLess(0, widthVisible, fpTolerance))
	{ // 3rd rounded corner
		let endAngle = 1.5*Math.PI;
		if (fpLessEq(widthVisible, radius, fpTolerance))
		{
			const c = (radius - widthVisible) / radius;
			const s = Math.sqrt(1 - c*c);
			if (fpLess(heightOcclude, radius*(1-s), fpTolerance))
				endAngle = Math.asin((radius - heightOcclude) / radius);
			else endAngle = Math.acos(c);
			endAngle = 2*Math.PI - endAngle;
		}
		ctx.arc(x1, y0, radius, 0, endAngle, true);
	} else ctx.moveTo(x1, y);
	const xf = occlude ? (fpLessEq(radius, widthVisible, fpTolerance) ? x+widthOcclude : x1): x0;
	if (fpLess(xf, x1, fpTolerance)) ctx.lineTo(xf, y); // 4th line
	else ctx.moveTo(xf, y);
	if (fpLess(x0, xf, fpTolerance)) ctx.moveTo(x0, y);
	if (occlude == false && fpLess(0, radius, fpTolerance))
		ctx.arc(x0, y0, radius, 1.5*Math.PI, Math.PI, true); // 4th rounded corner
	else ctx.moveTo(x, y0);
	ctx.stroke();
}

function drawVline(ctx, x, y, l)
{
	x = Math.floor(x);
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x, y + l);
	ctx.stroke();
}

function drawHline(ctx, x, y, l)
{
	y = Math.floor(y);
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + l, y);
	ctx.stroke();
}

function extractRGBValues(rgbString) // code obtained from generative AI in Google Chrome
{ // (searching for "javascript function extract values from rgb string")
	const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
	if (match) // Use reg.expr. to match and extract RGB values (decimal)
	{
		const r = parseInt(match[1]);
		const g = parseInt(match[2]);
		const b = parseInt(match[3]);
		return { r, g, b };
	}
	match = rgbString.match(/#([0-9A-Fa-f][0-9A-Fa-f])([0-9A-Fa-f][0-9A-Fa-f])([0-9A-Fa-f][0-9A-Fa-f])/);
	if (match) // Use reg.expr. to match and extract RGB values (hex)
	{
		const r = parseInt(match[1],16);
		const g = parseInt(match[2],16);
		const b = parseInt(match[3],16);
		return { r, g, b };
	}
	return null; // Invalid rgb string
}

function drawHorizontalBrace(ctx, x, y, l, up)
{
	let r = braceArcRadius;
	if (2*r > l + fpTolerance) r = Math.floor(l/2);
	y = Math.floor(y);
	saveLineWidth = ctx.lineWidth;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.arc(x + r, y, r, Math.PI, (up ? 1.5 : 0.5) * Math.PI, !up);
	ctx.lineTo(x + l - r, up ? y - r : y + r);
	ctx.arc(x + l - r, y, r, (up ? 1.5 : 0.5) * Math.PI, 0, !up);
	ctx.stroke();
	ctx.lineWidth = saveLineWidth;
}

function drawConnectingLine(ctx, xi, yi, xf, yf, bvLen, evLen) // from (Xi,Yi) to (Xf,Yf)
{ // bvLen = length of vertical beginning section, evLen = length of vertical ending section
	if (fpEqual(yi, yf, fpTolerance))
	{//make vertical line look crisp
		yi = Math.floor(yi);
		yf = Math.floor(yf);
	}
	if (fpEqual(xi, xf, fpTolerance))
	{//make horizontal line look crisp
		xi = Math.floor(xi);
		xf = Math.floor(xf);
	}
	if (fpLess(bvLen, 0, fpTolerance)) bvLen = -bvLen;
	if (fpLess(evLen, 0, fpTolerance)) evLen = -evLen;
	const dy = yf - yi;
	const ady = Math.abs(dy);
	if (fpLess(ady, bvLen + evLen, fpTolerance)) bvLen = evLen = ady / 3;
	const YiLessThanYf = fpLess(yi,yf, fpTolerance);
	const y0 = YiLessThanYf ? yi+bvLen : yi-bvLen;
	const y1 = YiLessThanYf ? yf-evLen : yf+evLen;
	ctx.beginPath();
	ctx.moveTo(xi, yi);
	ctx.lineTo(xi, y0);
	ctx.lineTo(xf, y1);
	ctx.lineTo(xf, yf);
	ctx.stroke();
}

function testCanvas()
{
	if (tallyCanvas.getContext == null)
		return;
	let ctx = tallyCanvas.getContext("2d");
	ctx.lineWidth = 1;
	let hPos = 1;
	let vPos = 1;
	let sz = drawTallyMark(ctx, hPos, vPos);
	hPos = hPos + sz.w;
	sz = drawBox5(ctx, hPos, vPos);
	hPos = hPos + sz.w;
	sz = drawBox10(ctx, hPos, vPos);
	hPos = hPos + sz.w;
	sz = drawBox50(ctx, hPos, vPos);
	hPos = hPos + sz.w;
	sz = drawBox100(ctx, hPos, vPos);
	hPos = hPos + sz.w;
	sz = drawBox500(ctx, hPos, vPos);
	hPos = hPos + sz.w;
	sz = drawBox1000(ctx, hPos, vPos, 10);
	hPos = hPos + sz.w;
	if (romanToArabicConnectorCanvas.getContext == null)
		return;
	ctx = romanToArabicConnectorCanvas.getContext("2d");
	ctx.lineWidth = 1;
	hPos = 0;
	vPos = romanToArabicConnectorCanvas.height;
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = 1;
	let foregroundColor = setIntermediateColor(ctx, foregroundWeightConnector);
	drawHorizontalBrace(ctx, hPos, vPos, 60, true);
	drawHorizontalBrace(ctx, 70, 1, 60, false);
	ctx.lineWidth = oldlw;
	ctx.strokeStyle = foregroundColor; // restore foreground color
	if (romanNumeralsAdditiveCanvas.getContext == null)
		return;
	ctx = romanNumeralsAdditiveCanvas.getContext("2d");
	const metrics = ctx.measureText("V");
	ctx.fillText("V", 10, 20);
	const oldStrokeStyle = ctx.strokeStyle;
	ctx.strokeStyle = "red";
	ctx.setLineDash([1, 3]);
	ctx.beginPath();
	ctx.moveTo(10, 20);
	ctx.lineTo(10, 0);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(10 + metrics.width, 20);
	ctx.lineTo(10 + metrics.width, 0);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(10 + 0.5*metrics.width, 20);
	ctx.lineTo(10 + 0.5*metrics.width, 0);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(5, 20 - metrics.actualBoundingBoxAscent);
	ctx.lineTo(15 + metrics.width, 20 - metrics.actualBoundingBoxAscent);
	ctx.stroke();
	ctx.strokeStyle = oldStrokeStyle;
}

function stringWidthOnCanvas(ctx, s)
{
	const metrics = ctx.measureText(s);
	return metrics.width;
}

function drawTallyMark(ctx, x, y)
{
	const w = stringWidthOnCanvas(ctx, "I"); // width of the drawing
	ctx.lineWidth = tallyMarkThickness;
	drawVline(ctx, Math.floor(x + w/2), y, tallyMarkHeight);
	const h = tallyMarkHeight; // height of the drawing
	return {w, h};
}

function weightedAverageTruncated(a, b, w) {return Math.floor((1-w)*a + w*b);}

function setIntermediateColor(ctx, foregroundWeight)
{
	const canvasStyle = getComputedStyle(tallyCanvas);
	const backgroundColor = canvasStyle.backgroundColor;
	const foregroundColor = canvasStyle.color;
	const bgc = extractRGBValues(backgroundColor);
	const fgc = extractRGBValues(foregroundColor);
	if (bgc !== null && fgc !== null)
	{
		const mcr = weightedAverageTruncated(bgc.r, fgc.r, foregroundWeight);
		const mcg = weightedAverageTruncated(bgc.g, fgc.g, foregroundWeight);
		const mcb = weightedAverageTruncated(bgc.b, fgc.b, foregroundWeight);
		ctx.strokeStyle = `rgb(${mcr} ${mcg} ${mcb})`;
	}
	return foregroundColor;
}

function drawColumnHlines(ctx, x, y, len, n)
{
	for (let i=0; i<n; i++)
	{
		drawHline(ctx, x, y, len);
		y = y + vSpaceBetweenTallyMarks + tallyMarkThickness;
	}
	return (n*tallyMarkThickness + (n-1)*vSpaceBetweenTallyMarks); // column height
}

function drawBox5(ctx, x, y)
{
	const boxWidth = Math.floor(stringWidthOnCanvas(ctx, "V"));
	const boundingRectWidth = boxWidth - 2*boundaryThickness;
	const lineLength = boundingRectWidth - 2*boundaryPadding - 2*boundaryThickness;
	const lineHpos = x + boundaryPadding + boundaryThickness;
	const lineVpos = y + boundaryPadding + boundaryThickness;
	const columnHeight = drawColumnHlines(ctx, lineHpos, lineVpos, lineLength, 5);
	const boundingRectHeight = columnHeight + 2*boundaryPadding + boundaryThickness;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawBox10(ctx, x, y)
{
	const boxWidth = Math.floor(stringWidthOnCanvas(ctx, "X"));
	const boundingRectWidth = boxWidth - 2*boundaryThickness;
	const lineLength = boundingRectWidth - 2*boundaryPadding - 2*boundaryThickness;
	const lineHpos = x + boundaryPadding + boundaryThickness;
	let lineVpos = y + boundaryPadding + boundaryThickness;
	const columnHeight1 = drawColumnHlines(ctx, lineHpos, lineVpos, lineLength, 5); // column of five horizontal,
	lineVpos = lineVpos + columnHeight1 + vSpaceBetween5s; // then space underneath,
	const columnHeight2 = drawColumnHlines(ctx, lineHpos, lineVpos, lineLength, 5); // then another column of five horizontal
	const boundingRectHeight = columnHeight1 + columnHeight2 + vSpaceBetween5s + 2*boundaryPadding + boundaryThickness;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawColumn50Hlines(ctx, x, y, len)
{ // used in drawBox50(), drawBox100() and drawColumn100Hlines()
	const xr = x + len + hSpaceBetween5s; // offset right column horizontally
	let columnHeight = 0;
	for (let i=0; i<5; i++)
	{
		const dHeight = drawColumnHlines(ctx, x, y, len, 5); // left column of five horizontal,
		drawColumnHlines(ctx, xr, y + vOffsetBetween5s, len, 5); // right column (offset horizontally&vertically),
		y = y + dHeight + vSpaceBetween5s; // regular vertical spacing (for visual clarity)
		columnHeight = columnHeight + dHeight + vSpaceBetween5s;
	}
	const w = 2*len + hSpaceBetween5s;  // width of the drawing
	const h = columnHeight + vOffsetBetween5s - vSpaceBetween5s; // height of the drawing
	return {w, h};
}

function drawBox50(ctx, x, y) // column of 25 short horizontal tally marks on the left,...
{//...with extra vertical space between each group of 5 and similar column on the right, all enclosed in rectangular box
	const boxWidth = Math.floor(stringWidthOnCanvas(ctx, "L")); // make same width as Roman numeral
	const boundingRectWidth = boxWidth - 2*boundaryThickness;
	const lineLength = boundingRectWidth/2 - boundaryPadding - boundaryThickness - 1;
	const lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const columnSize = drawColumn50Hlines(ctx, lineHpos, lineVpos, lineLength);
	const boundingRectHeight = columnSize.h + 2*boundaryPadding + boundaryThickness;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawColumn100Hlines(ctx, x, y, len)
{ // used in drawBox100() and drawColumns500Hlines()
	const columnSize1 = drawColumn50Hlines(ctx, x, y, len); // column of 50 horizontal tally marks,
	y = y + columnSize1.h + vSpaceBetween50s; // extra space halfway down,
	const columnSize2 = drawColumn50Hlines(ctx, x, y, len); // another column of 50 horizontal tally marks underneath
	const w = columnSize1.w;  // width of the drawing
	const h = columnSize1.h + columnSize2.h + vSpaceBetween50s; // height of the drawing	
	return {w, h};
}

function drawBox100(ctx, x, y) // column of 50 short horizontal tally marks on the left, with extra vertical space between...
{//...each group of 5, and extra space halfway down, and similar column on the right, all enclosed in rectangular box
	const boxWidth = Math.floor(stringWidthOnCanvas(ctx, "C")); // make same width as Roman numeral
	const boundingRectWidth = boxWidth - 2*boundaryThickness;
	const lineLength = boundingRectWidth/2 - boundaryPadding - boundaryThickness - 1;
	const lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const columnSize = drawColumn100Hlines(ctx, lineHpos, lineVpos, lineLength);
	const boundingRectHeight = columnSize.h + 2*boundaryPadding;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawColumns500Hlines(ctx, x, y, w)
{// used in drawBox1000() and drawBox500()
	const nDblCols = 5;
	const dblColWidth = (w - (nDblCols-1)*hSpaceBetween100s)/nDblCols;
	const lineLength = Math.floor((dblColWidth - hSpaceBetween5s)/2);
	const dx = dblColWidth + hSpaceBetween100s;
	const columnSize = drawColumn100Hlines(ctx, Math.floor(x), y, lineLength);
	for (let i=1; i<nDblCols; i++)
	{
		x = x + dx; // move horizontal position
		drawColumn100Hlines(ctx, Math.floor(x), y, lineLength);
	}
	const h = columnSize.h; // height of the drawing
	return {w, h};
}

function drawBox500(ctx, x, y) // 5 double columns each of 100 short horizontal tally marks, with extra vertical...
{//...space between each group of 5 tally marks, and extra space halfway down, all enclosed in rectangular box
	const rnWidth = stringWidthOnCanvas(ctx, "D");
	const boxWidth = Math.floor(3.9 * rnWidth);
	const boundingRectWidth = Math.floor(boxWidth - 2*boundaryThickness);
	const columns500width = boundingRectWidth - 2*boundaryPadding;
	const lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const columnSize = drawColumns500Hlines(ctx, lineHpos, lineVpos, columns500width);
	const boundingRectHeight = columnSize.h + 2*boundaryPadding; // same as for 100
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawBox1000(ctx, x, y, n) // 10 double columns each of 100 short horizontal tally marks, with extra vertical...
{//...space between each group of 5 tally marks, and extra space halfway down, all enclosed in rectangular box
// display n 1000s of tally marks. If n>1, draw 1 box of 1000 and (n-1) partial rectangles...
//...to look like they occlude each other partially being stacked under each other with a small offset
	let w = 0;  // width of the drawing
	let h = 0; // height of the drawing
	n = typeof n !== "undefined" ? n : 1; // default value
	if (n < 1) return {w, h};
	const rnWidth = stringWidthOnCanvas(ctx, "M");
	const boxWidth = Math.floor(7.6 * rnWidth); // for 1 rectangular box of 1000 tally marks
	const boundingRectWidth = Math.floor(boxWidth - 2*boundaryThickness);
	const columns1000width = boundingRectWidth - 2*boundaryPadding;
	const columns500width = Math.floor((columns1000width - hSpaceBetween500s) / 2);
	let lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const columnSize1 = drawColumns500Hlines(ctx, lineHpos, lineVpos, columns500width);
	lineHpos = lineHpos + columns500width + hSpaceBetween500s;
	drawColumns500Hlines(ctx, lineHpos, lineVpos, columns500width);
	const boundingRectHeight = columnSize1.h + 2*boundaryPadding; // for 1 rectangular box of 1000 tally marks, same as for 100
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	// draw additional rectangular boxes looking like they are stacked under the one already drawn but a little offset
	const hShift = boundaryPadding + boundaryThickness;
	const vShift = boundaryPadding + boundaryThickness;
	const widthOcclude = boundingRectWidth - hShift;
	const heightOcclude = boundingRectHeight - vShift;
	for (let i=1, j=1; i<n; i++, j++)
	{
		if (i%5==0)
		{ // extra offset between groups of 5
			x = x + hShift + hOffsetBetween1000s;
			y = y + vShift + vOffsetBetween1000s;
			j = 0;
		}
		else
		{
			x = x + hShift;
			y = y + vShift;
		}
		setIntermediateColor(ctx, (j%2==0) ? foregroundWeightBoxBoundary : foregroundWeightBoxBoundary2);
		roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius, widthOcclude, heightOcclude);
		ctx.strokeStyle = foregroundColor; // restore foreground color
	}
	ctx.lineWidth = oldlw; // restore lineWidth
	w = boxWidth + n*hShift;  // width of the drawing
	h = boundingRectHeight + n*vShift; // height of the drawing
	return {w, h};
}

function writeTally(n)
{
	if (tallyCanvas.getContext == null)
	{ // fallback in case browser does not support canvas
		let tallyMark = "|"; // simplest: write out the tally marks
		tallyCanvas.textContent = tallyMark.repeat(n);
		return;
	}
	const ctx = tallyCanvas.getContext("2d");
	const canvasStyle = getComputedStyle(tallyCanvas);
	const foregroundColor = canvasStyle.color;
	let x = hOffset;
	let y = vOffset;
	if (n < smallestNumberToDisplay || n===0) return;
	ctx.strokeStyle = foregroundColor;
	ctx.lineWidth = tallyMarkThickness;
	let r = n % 5;
	let dx = stringWidthOnCanvas(ctx, "I");
	for (let i=0; i<r; i++)
	{
		drawTallyMark(ctx, x, y);
		x = x + dx;
	}
	n = Math.floor(n / 5);
	r = n % 2;
	dx = stringWidthOnCanvas(ctx, "V");
	if (r > 0)
	{
		drawBox5(ctx, x, y);
		x = x + dx;
	}
	n = Math.floor(n / 2);
	r = n % 5;
	dx = stringWidthOnCanvas(ctx, "X");
	for (let i=0; i<r; i++)
	{
		drawBox10(ctx, x, y);
		x = x + dx;
	}
	n = Math.floor(n / 5);
	r = n % 2;
	dx = stringWidthOnCanvas(ctx, "L");
	if (r > 0)
	{
		drawBox50(ctx, x, y);
		x = x + dx;
	}
	n = Math.floor(n / 2);
	r = n % 5;
	dx = stringWidthOnCanvas(ctx, "C");
	for (let i=0; i<r; i++)
	{
		drawBox100(ctx, x, y);
		x = x + dx;
	}
	n = Math.floor(n / 5);
	r = n % 2;
	dx = stringWidthOnCanvas(ctx, "D");
	let sz;
	if (r > 0)
	{
		sz = drawBox500(ctx, x, y);
		x = x + sz.w;
	}
	n = Math.floor(n / 2);
	r = n % 5;
	if (r > 0)
	{
		sz = drawBox1000(ctx, x, y, r);
		box1000hPos = x;
		box1000width = sz.w;
		x = x + sz.w;
	}
	n = Math.floor(n / 5);
	r = n % 2;
	if (r > 0)
	{
		sz = drawBox1000(ctx, x, y, 10);
		x = x + sz.w;
	}
}

const replacementPauseTime = 1000; // milliseconds
const intermediateReplacementPauseTime = 500; // milliseconds
const minimumPauseTime = 250; // milliseconds
const pause = ms => new Promise(resolve => setTimeout(resolve, ms)); // from https://dev.to/rajnishkatharotiya/pause-function-execution-for-a-certain-time-in-javascript-9lj

function replaceLastChars(s, a, b) // if string s ends with string a,
{ // then replace the ending with string b and return the result,
	if (s === null || a === null || b === null) // otherwise do nothing
		return null; // and return null
	if (s.length < a.length)
		return null;
	let iLast = s.length - a.length; // index of the 1st of last chars in s
	if (s.substring(iLast) === a)
		return (s.substring(0,iLast) + b);
	return null;
}

function orderOfMagnitude(c)
{
	if (c.length < 1) return 0;
	if (c[0] === "M") return 4;
	if (c[0] === "D") return 3;
	if (c[0] === "C") return 3;
	if (c[0] === "L") return 2;
	if (c[0] === "X") return 2;
	if (c[0] === "V") return 1;
	if (c[0] === "I") return 1;
	return -1; // value to signify error
}

function convertRomanNumeralsAdditiveToSubtractive(a)
{
	return a.replace(/VIIII/, 'IX').replace(/IIII/, 'IV').replace(/LXXXX/, 'XC').replace(/XXXX/, 'XL').replace(/DCCCC/, 'CM').replace(/CCCC/, 'CD');
}

function convertToRomanNumeralsAdditive(n)
{
	if (typeof n === "undefined") n = inputNumber;
	if (n === 0) return "";
	let a = [];
	let r = n % 5;
	for (let i=0; i<r; i++) a.push("I");
	n = Math.floor(n / 5);
	if (n % 2 > 0) a.push("V");
	n = Math.floor(n / 2);
	r = n % 5;
	for (let i=0; i<r; i++) a.push("X");
	n = Math.floor(n / 5);
	if (n % 2 > 0) a.push("L");
	n = Math.floor(n / 2);
	r = n % 5;
	for (let i=0; i<r; i++) a.push("C");
	n = Math.floor(n / 5);
	if (n % 2 > 0) a.push("D");
	n = Math.floor(n / 2);
	r = n % 5;
	for (let i=0; i<r; i++) a.push("M");
	return a.reverse().join('');
}

function connectOrderOfMagnitudeRomanToArabic(ctx, cvHeight, sr, rn, an)
{ // draw connecting line and, if needed, horizontal braces
	if (sr.start < 0) return;
	if (sr.start > sr.end) return;
	if (sr.end >= rn.length) return;
	if (sr.o < 1) return;
	if (sr.o > an.length) return;
	const toY = 0;
	let fromX;
	const toX1 = (sr.o>1) ? stringWidthOnCanvas(ctx, an.substring(an.length-sr.o+1)) : 0;
	const toX2 = stringWidthOnCanvas(ctx, an.substring(an.length-sr.o));
	const toXm = 0.5 * (toX1 + toX2);
	const nPastEnd = rn.length - 1 - sr.end;
	const fromX1 = (0<nPastEnd) ? stringWidthOnCanvas(ctx, rn.substring(sr.end+1)) : 0;
	const fromX2 = stringWidthOnCanvas(ctx, rn.substring(sr.start));
	let fromY = cvHeight;
	let bLen = connectingLineBeginningVerticalSectionLength;
	const eLen = connectingLineEndingVerticalSectionLength;
	if (sr.start < sr.end)
	{
		fromY = cvHeight - braceArcRadius;
		bLen = 0;
		drawHorizontalBrace(ctx, fromX1+1, cvHeight, fromX2-fromX1-2, true); // shorten by 1px from each end
		fromX = (sr.o<nPastEnd+1) ? fromX1+braceArcRadius : ((rn.length-sr.start<sr.o) ? fromX2-braceArcRadius : toXm);
	} else fromX = 0.5 * (fromX1 + fromX2);
	drawConnectingLine(ctx, fromX, fromY, toXm, toY, bLen, eLen);
}

function scanOneOrderOfMagnitude(rn, i)
{
	const end = i; // index of the first numeral (from end of string) in the order of magnitude to be scanned now
	let start = i; // index of the last numeral (from end of string) in the order of magnitude to be scanned now
	let o = 0; // order of magnitude of currently scanned Roman numeral (rn[i])
	let n = 0; // order of magnitude of the next Roman numeral (rn[i-1])
	let oi, nn;
	if (i < 0)
		return {i, o, n, start, end};
	while (i >= 0)
	{
		oi = orderOfMagnitude(rn[i]);
		if (i > 0) // check for IX, XC, CM:
		{// treat both numerals as the same order of magnitude
			n = orderOfMagnitude(rn[i-1]);
			if (oi > n)
				oi = n;
		}
		if (i == end)
			o = oi;
		else if (oi > o)
			break;
		i--;
	}
	if (i < rn.length - 1) 
		start = i + 1;
	if (start < 1)
		n = 0;
	else
	{
		n = orderOfMagnitude(rn[start-1]);
		if (start > 1) // check for XC, CM:
		{// treat both numerals as the same order of magnitude
			nn = orderOfMagnitude(rn[start-2]);
			if (n > nn)
				n = nn;
		}
	}
	return {i, o, n, start, end};
}

function connectRomanToArabic() // draw connecting lines (and horizontal braces) where needed
{
	if (romanToArabicConnectorCanvas.getContext == null)
	{ // fallback in case browser does not support canvas
		return;
	}
	const ctx = romanToArabicConnectorCanvas.getContext("2d");
	const canvasStyle = getComputedStyle(romanToArabicConnectorCanvas);
	ctx.lineWidth = 1;
	const an = arabicNumeralsElement.value;
	const rn = romanNumeralsSubtractive; // romanNumeralsAdditive;
	if (rn.length < 1) return "";
	let lastOoMcnctd = 0; // last order of magnitude for which connection was drawn
	const h = romanToArabicConnectorCanvas.height;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightConnector);
	const oldLineWidth = ctx.lineWidth;
	const oldLineDash = ctx.getLineDash();
	const oldLineDashOffset = ctx.lineDashOffset;
	ctx.lineWidth = 1;
	ctx.lineDashOffset = 0;
	let i = rn.length-1;
	let sr;
	while (i >= 0)
	{
		sr = scanOneOrderOfMagnitude(rn, i);
		if (lastOoMcnctd + 1 < sr.o || sr.n > sr.o + 1)
		{
			lastOoMcnctd = sr.o;
			connectOrderOfMagnitudeRomanToArabic(ctx, h, sr, rn, an);
		}
		i = sr.i;
	}
	ctx.strokeStyle = foregroundColor; // restore foreground color etc.
	ctx.lineWidth = oldLineWidth;
	ctx.lineDashOffset = oldLineDashOffset;
}

function connectOrderOfMagnitudeRomanAdditiveToSubtractive(ctx, cvHeight, srs, sra, a, s)
{ // draw connecting line and, if needed, horizontal braces
	if (srs.start < 0) return;
	if (srs.start > srs.end) return;
	if (srs.end >= s.length) return;
	if (sra.start < 0) return;
	if (sra.start > sra.end) return;
	if (sra.end >= a.length) return;
	let toY = 0;
	let fromY = cvHeight;
	let fromX, toX;
	const nPastEndS = s.length - 1 - srs.end;
	const toX1 = (0<nPastEndS) ? stringWidthOnCanvas(ctx, s.substring(srs.end+1)) : 0;
	const toX2 = stringWidthOnCanvas(ctx, s.substring(srs.start));
	const nPastEndA = a.length - 1 - sra.end;
	const fromX1 = (0<nPastEndA) ? stringWidthOnCanvas(ctx, a.substring(sra.end+1)) : 0;
	const fromX2 = stringWidthOnCanvas(ctx, a.substring(sra.start));
	if (sra.start < sra.end)
	{
		drawHorizontalBrace(ctx, fromX1+1, fromY, fromX2-fromX1-2, true); // shorten by 1px from each end
		fromY = fromY - braceArcRadius;
	}
	if (srs.start < srs.end)
	{
		drawHorizontalBrace(ctx, toX1+1, toY, toX2-toX1-2, false); // shorten by 1px from each end
		toY = toY + braceArcRadius;
	}
	if (fpLess(toX2-braceArcRadius, fromX1+braceArcRadius, fpTolerance))
	{ // no overlap: [fromX2,fromX1] > [toX2,toX1]
		fromX = (sra.start < sra.end) ? fromX1+braceArcRadius : 0.5*(fromX1+fromX2);
		toX = (srs.start < srs.end) ? toX2-braceArcRadius : 0.5*(toX1+toX2);
	} else fromX = toX = 0.5 * (toX2 + fromX1); // middle of overlap
	drawConnectingLine(ctx, fromX, fromY, toX, toY, 0, 0);
}

function findSubstringPairs(s1, ss1, s2, ss2) // used in connectRomanAdditiveToSubtractive()
{
	let i1 = s1.indexOf(ss1);
	let i2 = s2.indexOf(ss2);
	if (i1 < 0 || i2 < 0)
		return null;
	i1 = i1 + ss1.length - 1;
	i2 = i2 + ss2.length - 1;
	return {i1, i2};
}

function connectRomanAdditiveToSubtractive() // draw connecting lines (and horizontal braces) where needed
{
	if (romanAdditiveToSubtractiveConnectorCanvas.getContext == null)
	{ // in case browser does not support canvas
		return;
	}
	const ctx = romanAdditiveToSubtractiveConnectorCanvas.getContext("2d");
	const canvasStyle = getComputedStyle(romanAdditiveToSubtractiveConnectorCanvas);
	const a = romanNumeralsAdditive;
	const s = romanNumeralsSubtractive;
	let r = findSubstringPairs(s, "CM", a, "DCCCC"); // scan hundreds than tens then units
	if (r == null) // in each order of magnitude treat longer patterns first, e.g. DCCCC before CCCC, LXXXX before XXXX
		r = findSubstringPairs(s, "CD", a, "CCCC");
	let r1 = findSubstringPairs(s, "XC", a, "LXXXX");
	if (r1 == null)
		r1 = findSubstringPairs(s, "XL", a, "XXXX");
	if (r1)
		r = r1;
	r1 = findSubstringPairs(s, "IX", a, "VIIII");
	if (r1 == null)
		r1 = findSubstringPairs(s, "IV", a, "IIII");
	if (r1)
		r = r1;
	if (r == null) return; // no instances of CM, CD, XC, XL, IX, IV
	let lastStart = 0; // starting position of the last order of magnitude for which connection was drawn
	const h = romanAdditiveToSubtractiveConnectorCanvas.height;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightConnector);
	const oldLineWidth = ctx.lineWidth;
	const oldLineDash = ctx.getLineDash();
	const oldLineDashOffset = ctx.lineDashOffset;
	const oldLineCap = ctx.lineCap;
	ctx.lineWidth = 1;
	ctx.lineDashOffset = 0;
	let srs, sra;
	let si = r.i1;
	let ai = r.i2;
	while (si >= 0 && ai >= 0)
	{
		srs = scanOneOrderOfMagnitude(s, si);
		sra = scanOneOrderOfMagnitude(a, ai);
		if ((lastStart + 1 < srs.end) || (srs.end - srs.start < sra.end - sra.start))
		{
			lastStart = srs.start;
			connectOrderOfMagnitudeRomanAdditiveToSubtractive(ctx, h, srs, sra, a, s);
		}
		si = srs.i;
		ai = sra.i;
	}
	ctx.strokeStyle = foregroundColor; // restore foreground color etc.
	ctx.lineWidth = oldLineWidth;
	ctx.lineDashOffset = oldLineDashOffset;
}

function connectRomanToTally() // draw connecting lines (and horizontal braces) where needed
{
	if (romanNumeralsAdditiveCanvas.getContext == null)
	{ // fallback in case browser does not support canvas
		romanNumeralsAdditiveCanvas.textContent = s;
		return;
	}
	const rn = romanNumeralsAdditive;
	if (rn.length < 1) return;
	let start = -1;
	let end = -1;
	let c;
	for (let i=0; i<rn.length && end<0; i++)
	{
		if (rn[i] === 'M')
		{
			if (start < 0)
				start = i;
		}
		else if (start >= 0)
			end = i-1;
	}
	if (start < 0) return; // no Ms so connections to draw here
	const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
	const nPastEnd = rn.length - 1 - end;
	const fromX1 = (0<nPastEnd) ? stringWidthOnCanvas(ctx, rn.substring(end+1)) : 0;
	const lessOrEqX1 = fpLessEq(box1000hPos-hOffset, fromX1, fpTolerance);
	if (lessOrEqX1) return; // box1000 is directly under the Ms
	const metrics = ctx.measureText(rn);
	let fromY = metrics.actualBoundingBoxAscent + 2;
	const fromX2 = stringWidthOnCanvas(ctx, rn.substring(start));
	const fromXm = 0.5 * (fromX1 + fromX2);
	const rFromXm = romanNumeralsAdditiveCanvas.width - fromXm - hOffset;
	const rFromX2 = romanNumeralsAdditiveCanvas.width - fromX2 - hOffset;
	const toY = romanNumeralsAdditiveCanvas.height;
	const rToX = romanNumeralsAdditiveCanvas.width - box1000hPos - hOffset;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightConnector);
	const oldLineWidth = ctx.lineWidth;
	const oldLineDash = ctx.getLineDash();
	const oldLineDashOffset = ctx.lineDashOffset;
	ctx.lineWidth = 1;
	ctx.lineDashOffset = 0;
	let bLen = connectingLineBeginningVerticalSectionLength;
	const eLen = connectingLineEndingVerticalSectionLength;
	let rFromX;
	if (start < end)
	{
		bLen = 0;
		drawHorizontalBrace(ctx, rFromX2, fromY, fromX2-fromX1, false);
		fromY = fromY + braceArcRadius;
		const lessOrEqX2 = fpLessEq(box1000hPos+boxCornerRadius, fromX2-braceArcRadius, fpTolerance);
		rFromX = lessOrEqX2 ? (rToX - boxCornerRadius) : (rFromX2 + braceArcRadius);
	} else rFromX = rFromXm;
	drawConnectingLine(ctx, rFromX, fromY, rToX - boxCornerRadius, toY, bLen, eLen);
	ctx.strokeStyle = foregroundColor; // restore foreground color etc.
	ctx.lineWidth = oldLineWidth;
	ctx.lineDashOffset = oldLineDashOffset;
}

function displayTextOnCanvas(s, cv)
{
	if (cv.getContext == null)
	{ // fallback in case browser does not support canvas
		cv.textContent = s;
		return;
	}
	clearCanvas(cv);
	const ctx = cv.getContext("2d");
	if (s.length < 1) return;
	const metrics = ctx.measureText(s);
	const hPos = cv.width - metrics.width - hOffset;
	const vPos = metrics.actualBoundingBoxAscent;
	ctx.fillText(s, hPos, vPos);
}

function incrementButtonMouseoverListener() {incrementButton.style.backgroundColor = buttonHoverColor;}
function decrementButtonMouseoverListener() {decrementButton.style.backgroundColor = buttonHoverColor;}
function incrementButtonMouseoutListener() {incrementButton.style.backgroundColor = buttonNormalColor;}
function decrementButtonMouseoutListener() {decrementButton.style.backgroundColor = buttonNormalColor;}

function disableButtons(incrementButtonPressed)
{
	incrementOrDecrementExecuting = true;
	incrementButton.disabled = true;
	decrementButton.disabled = true;
	incrementButton.style.backgroundColor = incrementButtonPressed ? buttonDisabledColor : buttonPressedColor;
	decrementButton.style.backgroundColor = incrementButtonPressed ? buttonPressedColor : buttonDisabledColor;
	if (incrementButtonPressed)
		incrementButton.style.fontWeight = "bold";
	else
		decrementButton.style.fontWeight = "bold";
	incrementButton.removeEventListener('mouseover', incrementButtonMouseoverListener);
	decrementButton.removeEventListener('mouseover', decrementButtonMouseoverListener);
	incrementButton.removeEventListener('mouseout', incrementButtonMouseoutListener);
	decrementButton.removeEventListener('mouseout', decrementButtonMouseoutListener);
	document.body.style.cursor = 'progress';
	incrementButton.style.cursor = 'progress';
	decrementButton.style.cursor = 'progress';
	arabicNumeralsElement.style.cursor = 'progress';
	romanToArabicConnectorCanvas.style.cursor = 'progress';
	romanNumeralsAdditiveCanvas.style.cursor = 'progress';
}

function reenableButtons()
{
	incrementButton.disabled = false;
	decrementButton.disabled = false;
	incrementButton.style.backgroundColor = buttonNormalColor;
	decrementButton.style.backgroundColor = buttonNormalColor;
	incrementButton.style.fontWeight = "normal";
	decrementButton.style.fontWeight = "normal";
	incrementOrDecrementExecuting = false;
	incrementButton.addEventListener('mouseover', incrementButtonMouseoverListener);
	decrementButton.addEventListener('mouseover', decrementButtonMouseoverListener);
	incrementButton.addEventListener('mouseout', incrementButtonMouseoutListener);
	decrementButton.addEventListener('mouseout', decrementButtonMouseoutListener);
	document.body.style.cursor = 'default';
	incrementButton.style.cursor = 'default';
	decrementButton.style.cursor = 'default';
	arabicNumeralsElement.style.cursor = 'default';
	romanToArabicConnectorCanvas.style.cursor = 'default';
	romanNumeralsAdditiveCanvas.style.cursor = 'default';
}

function setRomanNumeralsSubtractive(s)
{
	romanNumeralsSubtractive = s;
	displayTextOnCanvas(s, romanNumeralsSubtractiveCanvas);
}

function setRomanNumeralsAdditive(s)
{
	romanNumeralsAdditive = s;
	displayTextOnCanvas(s, romanNumeralsAdditiveCanvas);
}

class SlideTextHorizontally // the last stage of animations of metamorphoses of some numerals into others, e.g. IIIII->V, VV->X
{ // b/c such a metamorphosis leaves gaps in the entire numerical expression, e.g. XXIIIII -> XX  V
	leftText = null; // constant
	rightText = null; // constant
	xr = 0; // updated horizontal position (in pixels) of this.rightText
	xRi = 0; // initial horizontal position (in pixels) of this.rightText
	xRf = 0; // final horizontal position (in pixels) of this.rightText
	xLi = 0; // initial horizontal position (in pixels) of the leftmost symbol of this.leftText
	xLf = 0; // final horizontal position (in pixels) of the leftmost symbol of this.leftText
	xl = 0; // updated horizontal position (in pixels) of this.leftText
	wLeftText = 0; // width (in pixels) of this.leftText
	vxl = 0; // (px/msec) how fast to move xl towards xLf
	vxr = 0; // (px/msec) how fast to move xr towards xRf
	lStationary = true; // iff vxl != 0
	rStationary = true; // iff vxr != 0
	vlNeg = false; // iff vxl < 0
	vlPos = false; // iff vxl > 0
	vrNeg = false; // iff vxr < 0
	vrPos = false; // iff vxr > 0
	xClear = 0; // horizontal position (in pixels) of the leftmost corner of the part of canvas to be cleared before redrawing
	wClear = 0; // width (in pixels) of the part of canvas to be cleared before redrawing
	t = 0; // (msec) time of last update
	vPos = 0; // vertical position of all the text treated by this class
	finished = true; // used to implement this.done()
	justFinished = false; // used to implement this.recent()
	constructor(s) {this.rightText = s;}
	reset(lText, xLtext, xAnotherArg) // use and meaning of xAnotherArg depends whether this.rightText===null
	{ // if this.rightText===null, then xAnotherArg is the final position of this.leftText
		this.finished = true; // if this.rightText!==null, then xAnotherArg is the initial position of this.leftText
		this.justFinished = false;
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		this.finished = false;
		this.leftText = lText;
		this.xl = this.xLi = xLtext;
		if (this.rightText === null)
			this.xLf = xAnotherArg; // this instance is used to move only this.leftText
		else
			this.xr = this.xRi = xAnotherArg; // move both this.leftText and this.rightText
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		const cvw = romanNumeralsAdditiveCanvas.width - hOffset;
		this.vPos = romanNumeralsAdditiveCanvas.height; // default value, in case cannot obtain valid text metrics
		let metrics = null;
		if (this.rightText !== null)
		{
			this.xRf = cvw; // default value, in case cannot obtain valid text metrics
			metrics = ctx.measureText(this.rightText);
			if (metrics !== null && fpLess(0, metrics.width, fpTolerance))
			{
				this.xRf = cvw - metrics.width;
				this.vPos = metrics.actualBoundingBoxAscent;
			}
		}
		this.wLeftText = 0; // default value, in case cannot obtain valid text metrics
		if (this.rightText !== null)
			this.xLf = this.xRf; // default value, in case cannot obtain valid text metrics
		metrics = ctx.measureText(this.leftText);
		if (metrics !== null && fpLess(0, metrics.width, fpTolerance))
		{
			this.wLeftText = metrics.width;
			if (this.rightText !== null)
				this.xLf = this.xRf - this.wLeftText;
			this.vPos = metrics.actualBoundingBoxAscent;
		}
		this.vxl = AnimationSpeedClosingTheGaps*(this.xLf - this.xLi);
		this.lStationary = (this.leftText===null) ||
			(this.leftText==="") || fpEqual(this.vxl, 0, fpTolerance);
		this.vlPos = fpLess(0, this.vxl, fpTolerance);
		this.vlNeg = fpLess(this.vxl, 0, fpTolerance);
		this.vxr = (this.rightText===null) ? 0 : AnimationSpeedClosingTheGaps*(this.xRf - this.xRi);
		this.rStationary = (this.rightText===null) ||
			(this.rightText==="") || fpEqual(this.vxr, 0, fpTolerance);
		this.vrPos = fpLess(0, this.vxr, fpTolerance);
		this.vrNeg = fpLess(this.vxr, 0, fpTolerance);
		this.xClear = fpLess(this.xLi, this.xLf, fpTolerance) ? this.xLi : this.xLf;
		if (this.rightText === null)
		{
			const xClearR = fpLess(this.xLi, this.xLf, fpTolerance) ? this.xLf : this.xLi;
			this.wClear = xClearR + this.wLeftText - this.xClear;
		}
		else
			this.wClear = cvw - this.xClear;
		this.t = Date.now();
	}
	done() // true iff finished this particular stage of the animation
	{
		if (this.finished) return true;
		this.finished =
			((this.lStationary || fpEqual(this.xl, this.xLf, fpTolerance)) &&
			(this.rStationary || fpEqual(this.xr, this.xRf, fpTolerance)));
		if (this.finished)
			this.justFinished = true;
		return this.finished;
	}
	recent() // returns true iff the most recent call to this.done() has returned true but...
	{ //...the call to this.done immediately prior to the most recent call to this.done()...
		if (this.justFinished==false) return false; //...has returned false
		this.justFinished = false;
		return true;
	}
	proceed()
	{
		if (this.finished) return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u;
		if (this.rStationary == false)
		{
			u = this.xr  + (this.vxr)*dt;
			if (this.vrPos)
			{
				this.xr = fpLessEq(u, this.xRf, fpTolerance) ? u : this.xRf; // prevent xr from surpassing xRf (i.e. moving off canvas)
			} else if (this.vrNeg) {
				this.xr = fpLess(this.xRf, u, fpTolerance) ? u : this.xRf // prevent xr from surpassing xRf
			}
		}
		if (this.lStationary == false)
		{
			u = this.xl + (this.vxl)*dt;
			if (this.vlPos)
			{
				const xlLim = this.xr - this.wLeftText;
				if (fpLessEq(u, xlLim, fpTolerance)) // prevent xl+wLeftText from surpassing xr (i.e. this.leftText running onto this.rightText)
					this.xl = u;
				else if (fpLess(this.xl, xlLim, fpTolerance)) // prevent this.xl from being set back
					this.xl = xlLim;
			} else if (this.vlNeg) {
					this.xl = fpLess(this.xLf, u, fpTolerance) ? u : this.xLf // prevent xl from surpassing xLf
			}
		}
		this.t = t1;
	}
	draw()
	{
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		ctx.clearRect(this.xClear, -0.5, this.wClear, romanNumeralsAdditiveCanvas.height);
		if (this.leftText !== null)
			ctx.fillText(this.leftText, this.xl, this.vPos);
		if (this.rightText !== null)
			ctx.fillText(this.rightText, this.xr, this.vPos);
	}
}

class MetamorphoseIIIIItoV
{ // the first stage of animations of metamorphosis of IIIII->V
	initialText = "IIIII"; // (constant) to metamorphose into finalText
	finalText = "V"; // constant
	x0i = 0; // initial horizontal position of the leftmost end of initialText, where to start clearing the canvas in each call to draw()
	x0 = 0; // updated horizontal position of the leftmost I
	x1 = 0; // updated horizontal position of the next to the leftmost I
	x2 = 0; // updated horizontal position of the middle I
	x3 = 0; // updated horizontal position of the next to the rightmost I
	x4 = 0; // updated horizontal position of the rightmost I
	xf = 0;  // final horizontal position of characters of initialText (as they finish metamorphosing into finalText)
	skewI = 0; // constant (initial (usual) skew of the Is)
	skewF = 0.4; // constant (final (at their convergence) skew of the Is)
	vSkew = 0; // how fast to move skew towards skewF (calculated from skewF, skewI and AnimationSpeedMetamorphosis)
	skew = 0; // current value (starts = skewI and increases to skewF)
	vx0 = 0; // (px/msec) how fast to move x0 towards xf
	vx1 = 0; // (px/msec) how fast to move x1 towards xf
	vx2 = 0; // (px/msec) how fast to move x2 towards xf
	vx3 = 0; // (px/msec) how fast to move x3 towards xf
	vx4 = 0; // (px/msec) how fast to move x4 towards xf
	t = 0; // (msec) time of last update
	vPos = 0; // vertical position of all the text treated by this class
	finished = true; // iff finished the metamorphosis of intialText into finalText
	justFinished = false; // used to implement this.recent()
	xInitialText() {return this.x0i;}
	xFinalText() {return this.xf;}
	reset()
	{
		this.finished = true;
		this.justFinished = false;
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		this.finished = false;
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		const w = romanNumeralsAdditiveCanvas.width - hOffset;
		let metrics = ctx.measureText(this.initialText);
		this.vPos = metrics.actualBoundingBoxAscent;
		this.x0i = this.x0 = w - metrics.width;
		metrics = ctx.measureText(this.initialText.substring(1));
		this.x1 = w - metrics.width;
		metrics = ctx.measureText(this.initialText.substring(2));
		this.x2 = w - metrics.width;
		metrics = ctx.measureText(this.initialText.substring(3));
		this.x3 = w - metrics.width;
		metrics = ctx.measureText(this.initialText.substring(4));
		this.x4 = w - metrics.width;
		this.xf = this.x2; // converge to the middle
		this.skew = this.skewI;
		this.vx0 = AnimationSpeedMetamorphosis*(this.xf - this.x0);
		this.vx1 = AnimationSpeedMetamorphosis*(this.xf - this.x1);
		this.vx2 = AnimationSpeedMetamorphosis*(this.xf - this.x2);
		this.vx3 = AnimationSpeedMetamorphosis*(this.xf - this.x3);
		this.vx4 = AnimationSpeedMetamorphosis*(this.xf - this.x4);
		this.vSkew = AnimationSpeedMetamorphosis*(this.skewF - this.skewI);
		this.t = Date.now();
	}
	done()
	{
		if (this.finished) return true;
		this.finished =
			(fpEqual(this.skew, this.skewF, fpTolerance) &&
			fpEqual(this.x0, this.xf, fpTolerance) &&
			fpEqual(this.x1, this.xf, fpTolerance) &&
			//fpEqual(this.x2, this.xf, fpTolerance) && // here x2 stays still
			fpEqual(this.x3, this.xf, fpTolerance) &&
			fpEqual(this.x4, this.xf, fpTolerance));
		if (this.finished)
			this.justFinished = true;
		return this.finished;
	}
	recent() // returns true iff the most recent call to this.done() has returned true but...
	{ //...the call to this.done immediately prior to the most recent call to this.done()...
		if (this.justFinished==false) return false; //...has returned false
		this.justFinished = false;
		return true;
	}
	proceed()
	{
		if (this.finished) return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u = this.x1 + (this.vx1)*dt;
		this.x1 = fpLessEq(u, this.xf, fpTolerance) ? u : this.xf; // prevent x1 from surpassing xf
		//u = this.x2 + (this.vx2)*dt; // here x2 stays still
		//this.x2 = fpLessEq(this.x1, u, fpTolerance) ? u : this.x1;
 		u = this.x3 + (this.vx3)*dt;
		this.x3 = fpLessEq(this.xf, u, fpTolerance) ? u : this.xf; // prevent x3 from surpassing xf
		u = this.x0 + (this.vx0)*dt;
		this.x0 = fpLessEq(u, this.x1, fpTolerance) ? u : this.x1; // prevent x0 from surpassing x1
		u = this.x4 + (this.vx4)*dt;
		this.x4 = fpLessEq(this.x3, u, fpTolerance) ? u : this.x3; // prevent x4 from surpassing x3
		u = this.skew + (this.vSkew)*dt;
		this.skew = fpLessEq(u, this.skewF, fpTolerance) ? u : this.skewF; // prevent skew from surpassing skewF
		this.t = t1;
	}
	draw()
	{
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		const w = romanNumeralsAdditiveCanvas.width - this.x0i;
		ctx.clearRect(this.xInitialText(), -0.5, w, romanNumeralsAdditiveCanvas.height);
		ctx.save(); // to reverse the transform(), using restore(), after drawing at (x0,vPos), before doing the same for the next position
		ctx.transform(1, 0, this.skew, 1, this.x0, this.vPos); // translate the axes to (x0,vPos) and skew leftwards
		ctx.fillText(this.initialText[0], 0, 0);
		ctx.restore();
		ctx.save(); // use transform()n rather than setTransform() b/c setTransform() discards useful transforms applied earlier often causing letters drawn by this method to be not perfectly aligned with each other vertically
		ctx.transform(1, 0, -this.skew, 1, this.x1, this.vPos); // translate the axes to (x1,vPos) and skew rightwards
		ctx.fillText(this.initialText[1], 0, 0);
		ctx.restore();
		ctx.save(); // set the position of drawing, together with the skew, via the call to transform() to ensure correct horizontal positioning of all the letters drawn by this method
		ctx.transform(1, 0, -this.skew, 1, this.x2, this.vPos); // translate the axes to (x2,vPos) and skew rightwards
		ctx.fillText(this.initialText[2], 0, 0);
		ctx.restore();
		ctx.save();
		ctx.transform(1, 0, -this.skew, 1, this.x3, this.vPos); // translate the axes to (x3,vPos) and skew rightwards
		ctx.fillText(this.initialText[3], 0, 0);
		ctx.restore();
		ctx.save();
		ctx.transform(1, 0, -this.skew, 1, this.x4, this.vPos); // translate the axes to (x4,vPos) and skew rightwards
		ctx.fillText(this.initialText[4], 0, 0);
		ctx.restore();
	}
}

class MetamorphoseVVtoX
{ // the first stage of animations of metamorphosis of VV->X
	initialText = "VV"; // (constant) to metamorphose into finalText
	finalText = "X"; // constant
	halfWidthInitialText = 0; // half of the width, in pixels, of initialText[0] (used in transforming the coordinate system in this.draw())
	halfHeightInitialText = 0; // half of the height, in pixels, of initialText[0] (used in transforming the coordinate system in this.draw())
	x1i = 0; // initial horizontal position of the leftmost end of initialText, where to start clearing the canvas in each call to draw()
	x1 = 0; // updated horizontal position of the left V
	x2 = 0; // updated horizontal position of the right V
	xf = 0;  // final horizontal position of characters of initialText (as they finish metamorphosing into finalText)
	y1 = 0; // updated vertical position of the left V
	y2 = 0; // updated vertical position of the right V
	y1f = 0;  // final vertical position of the left V
	y2f = 0;  // final vertical position of the right V
	scaleI = 1.0; // constant (initial (usual) scale of the Vs)
	scaleF = 0.5; // constant (final (at their convergence) scale of the Vs)
	vScale = 0; // how fast to move scale towards scaleF (calculated from scaleF, scaleI and AnimationSpeedMetamorphosis)
	scale = 0; // current value (starts = scaleI and decreases to scaleF)
	angleI = 0; // constant (initial (usual) angle of the left V)
	angleF = Math.PI; // constant (final (at their convergence) angle of the left V)
	vAngle = 0; // how fast to move angle towards angleF (calculated from angleF, angleI and AnimationSpeedMetamorphosis)
	angle = 0; // (of the left V) current value (starts = angleI and decreases to angleF)
	vx1 = 0; // (px/msec) how fast to move x1 towards xf
	vx2 = 0; // (px/msec) how fast to move x2 towards xf
	vy1 = 0; // (px/msec) how fast to move y2 towards y2f
	vy2 = 0; // (px/msec) how fast to move y2 towards y2f
	t = 0; // (msec) time of last update
	vPos = 0; // vertical position of all the text treated by this class
	finished = true; // iff finished the metamorphosis of intialText into finalText
	justFinished = false; // used to implement this.recent()
	xInitialText() {return this.x1i;} // initial horizontal position of initialText
	xFinalText() {return this.xf;} // horizontal position of finalText at the end of this metamorphosis
	reset()
	{
		this.finished = true;
		this.justFinished = false;
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		this.finished = false;
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		const w = romanNumeralsAdditiveCanvas.width - hOffset;
		let metrics = ctx.measureText(this.initialText);
		this.y2 = this.y1f = this.y1 = this.vPos = metrics.actualBoundingBoxAscent;
		this.y2f = 0.5 * (this.vPos);
		this.x1i = this.x1 = w - metrics.width;
		metrics = ctx.measureText(this.initialText.substring(1));
		this.x2 = w - metrics.width;
		this.xf = 0.25 * (this.x1) + 0.75 * (this.x2); // put convergence point closer to right V in order to help avoid drawing small parts of extremities of the left V on the part of the canvas which must remain unchanged during this metamorphosis
		metrics = ctx.measureText(this.initialText[0]);
		this.halfHeightInitialText = 0.5 * (metrics.actualBoundingBoxAscent);
		this.halfWidthInitialText = 0.5 * (metrics.width);
		this.scale = this.scaleI;
		this.angle = this.angleI;
		this.vx1 = 2*AnimationSpeedMetamorphosis*(this.xf - this.x1); // move left V to its destination faster in order to help avoid drawing small parts of extremities of the left V on the part of the canvas which must remain unchanged during this metamorphosis
		this.vx2 = AnimationSpeedMetamorphosis*(this.xf - this.x2);
		this.vy1 = AnimationSpeedMetamorphosis*(this.y1f - this.y1);
		this.vy2 = AnimationSpeedMetamorphosis*(this.y2f - this.y2);
		this.vScale = 2*AnimationSpeedMetamorphosis*(this.scaleF - this.scaleI); // scale both Vs down faster in order to help avoid putting small parts of their extremities outside the part of the canvas initially displaying initialText
		this.vAngle = AnimationSpeedMetamorphosis*(this.angleF - this.angleI);
		this.t = Date.now();
	}
	done()
	{
		if (this.finished) return true;
		this.finished =
			(fpEqual(this.scale, this.scaleF, fpTolerance) &&
			fpEqual(this.angle, this.angleF, fpTolerance) &&
			fpEqual(this.x1, this.xf, fpTolerance) &&
			fpEqual(this.x2, this.xf, fpTolerance) &&
			fpEqual(this.y1, this.y1f, fpTolerance) &&
			fpEqual(this.y2, this.y2f, fpTolerance));
		if (this.finished)
			this.justFinished = true;
		return this.finished;
	}
	recent() // returns true iff the most recent call to this.done() has returned true but...
	{ //...the call to this.done immediately prior to the most recent call to this.done()...
		if (this.justFinished==false) return false; //...has returned false
		this.justFinished = false;
		return true;
	}
	proceed()
	{
		if (this.finished) return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u = this.x1 + (this.vx1)*dt;
		this.x1 = fpLessEq(u, this.xf, fpTolerance) ? u : this.xf; // prevent x1 from surpassing xf
		u = this.x2 + (this.vx2)*dt;
		this.x2 = fpLessEq(this.xf, u, fpTolerance) ? u : this.xf; // prevent x2 from surpassing xf
 		u = this.y1 + (this.vy1)*dt;
		this.y1 = fpLessEq(this.y1f, u, fpTolerance) ? u : this.y1f; // prevent y1 from surpassing y1f
 		u = this.y2 + (this.vy2)*dt;
		this.y2 = fpLessEq(this.y2f, u, fpTolerance) ? u : this.y2f; // prevent y2 from surpassing y2f
		u = this.scale + (this.vScale)*dt;
		this.scale = fpLessEq(this.scaleF, u, fpTolerance) ? u : this.scaleF; // prevent scale from surpassing scaleF
		u = this.angle + (this.vAngle)*dt;
		this.angle = fpLessEq(u, this.angleF, fpTolerance) ? u : this.angleF; // prevent angle from surpassing angleF
		this.t = t1;
	}
	draw()
	{
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		const w = romanNumeralsAdditiveCanvas.width - this.xInitialText();
		ctx.clearRect(this.xInitialText(), -0.5, w, romanNumeralsAdditiveCanvas.height);
		ctx.save(); // to reverse, using restore(), the following transformations after drawing at (x1,y1), before doing the same for (x2,y2)
		ctx.translate(this.x1 + this.halfWidthInitialText,
					this.y1 - (this.scale) * (this.halfHeightInitialText));
		ctx.rotate(-this.angle);
		ctx.scale(1, this.scale);
		ctx.translate(-this.halfWidthInitialText, this.halfHeightInitialText);
		ctx.fillText(this.initialText[0], 0, 0);
		ctx.restore();
		ctx.save();
		ctx.translate(this.x2 + this.halfWidthInitialText, this.y2);
		ctx.scale(1, this.scale);
		ctx.translate(-this.halfWidthInitialText, 0);
		ctx.fillText(this.initialText[1], 0, 0);
		ctx.restore();
	}
}

class Fade // used to fade text in, to fade text out
{ //  and to cross-fade one text into another
	initialText = null; // (constant) text to fade out
	finalText = null; // (constant) text to fade in
	xi = 0; // initial horizontal position of the leftmost end of initialText, where to start clearing the canvas in each call to draw()
	xf = 0;  // final horizontal position of finalText
	aOutI = 1.0; // constant (initial alpha of initialText)
	aOutF = 0.0; // constant (final alpha of initialText)
	vaOut = 0; // how fast to change aOut to aOutF (calculated from aOutF, aOutI and AnimationSpeedMetamorphosis)
	aOutM = 0.0; // for adjusting rate of change of aOut in this.proceed()
	vaOutAdjFast = 2.0; // speed-up factor for rate of change of aOut (during the first half of this metamorphosis)
	vaOutAdjSlow = 0.0; // slow-down factor for rate of change of aOut (during the second half of this metamorphosis)
	aOut = 0; // current alpha value for initialText (starts = aOutI and decreases to aOutF)
	aInI = 0.0; // constant (initial alpha of finalText)
	aInF = 1.0; // constant (final (at their convergence) angle of the left V)
	vaIn = 0; // how fast to change aIn to aInF (calculated from aInF, aInI and AnimationSpeedMetamorphosis)
	aIn = 0; // current alpha value for finalText (starts = aInI and increases to aInF)
	xClear = 0; // horizontal position (in pixels) of the leftmost corner of the part of canvas to be cleared before redrawing
	wClear = 0; // width (in pixels) of the part of canvas to be cleared before redrawing
	t = 0; // (msec) time of last update
	vPos = 0; // vertical position of all the text treated by this class
	finished = true; // iff finished the metamorphosis of intialText into finalText
	justFinished = false; // used to implement this.recent()
	xInitialText() {return this.xi;} // initial horizontal position of initialText
	xFinalText() {return this.xf;} // horizontal position of finalText at the end of this metamorphosis
	constructor(oText, iText)
	{
		this.initialText = oText;
		this.finalText = iText;
	}
	reset()
	{
		this.finished = true;
		this.justFinished = false;
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		this.finished = false;
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		const cvw = romanNumeralsAdditiveCanvas.width - hOffset;
		this.vPos = romanNumeralsAdditiveCanvas.height;
		this.xi = cvw;
		this.xf = cvw;
		let metrics = null;
		if (this.initialText !== null)
		{
			metrics = ctx.measureText(this.initialText);
			this.vPos = metrics.actualBoundingBoxAscent;
			this.xi = cvw - metrics.width;
			const wChar = Math.floor(metrics.width / this.initialText.length);
			this.xf = cvw - 0.5 * (metrics.width + wChar);
		} else if (this.finalText !== null) {
			metrics = ctx.measureText(this.finalText);
			this.vPos = metrics.actualBoundingBoxAscent;
			const wChar = Math.floor(metrics.width / this.finalText.length);
			this.xf = cvw - 0.5 * (metrics.width + wChar);
		}
		this.aOutM = 0.5 * (this.aOutI + this.aOutF);
		this.vaOutAdjSlow = this.vaOutAdjFast / (2 * (this.vaOutAdjFast) - 1.0); // assumes that this.aOutM=0.5*(this.aOutI+this.aOutF)
		this.aOut = this.aOutI;
		this.aIn = this.aInI;
		this.vaOut = AnimationSpeedMetamorphosis*(this.aOutF - this.aOutI);
		this.vaIn = AnimationSpeedMetamorphosis*(this.aInF - this.aInI);
		this.xClear = fpLess(this.xi, this.xf, fpTolerance) ? this.xi : this.xf;
		this.wClear = cvw - this.xClear;
		this.t = Date.now();
	}
	done()
	{
		if (this.finished) return true;
		this.finished = (((this.initialText===null) || fpEqual(this.aOut, this.aOutF, fpTolerance)) &&
						((this.finalText===null) || fpEqual(this.aIn, this.aInF, fpTolerance)));
		if (this.finished)
			this.justFinished = true;
		return this.finished;
	}
	recent() // returns true iff the most recent call to this.done() has returned true but...
	{ //...the call to this.done immediately prior to the most recent call to this.done()...
		if (this.justFinished==false) return false; //...has returned false
		this.justFinished = false;
		return true;
	}
	proceed()
	{
		if (this.finished) return;
		if ((this.initialText===null) && (this.finalText===null))
			return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u;
		if (this.initialText !== null)
		{
			const vaOutAdj = fpLess(this.aOutM, this.aOut, fpTolerance) ? this.vaOutAdjFast : this.vaOutAdjSlow;
			u = this.aOut + vaOutAdj * (this.vaOut) * dt;
			this.aOut = fpLessEq(this.aOutF, u, fpTolerance) ? u : this.aOutF; // prevent aOut from surpassing aOutF
		}
		if (this.finalText !== null)
		{
			u = this.aIn + (this.vaIn)*dt;
			this.aIn = fpLessEq(u, this.aInF, fpTolerance) ? u : this.aInF; // prevent aIn from surpassing aInF
		}
		this.t = t1;
	}
	draw()
	{
		if ((this.initialText===null) && (this.finalText===null))
			return;
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		ctx.clearRect(this.xClear, -0.5, this.wClear, romanNumeralsAdditiveCanvas.height);
		const oldFillStyle = ctx.fillStyle;
		const canvasStyle = getComputedStyle(romanNumeralsAdditiveCanvas);
		const foregroundColor = canvasStyle.color;
		const fgc = extractRGBValues(foregroundColor);
		if (this.initialText !== null)
		{
			ctx.fillStyle = `rgb(${fgc.r} ${fgc.g} ${fgc.b} / ${this.aOut})`; // with alpha for initialText
			ctx.fillText(this.initialText, this.xInitialText(), this.vPos);
		}
		if (this.finalText !== null)
		{
			ctx.fillStyle = `rgb(${fgc.r} ${fgc.g} ${fgc.b} / ${this.aIn})`; // with alpha for finalText
			ctx.fillText(this.finalText, this.xFinalText(), this.vPos);
		}
		ctx.fillStyle = oldFillStyle; // restore original value
	}
}

class AnimateNumeralSubstitutionManyToOne
{
	morph = null; // to store MetamorphoseIIIIItoV (or MetamorphoseVVtoX or Fade) object
	closeTheGaps = null; // to store SlideTextHorizontally object
	sameText = null; // set to romanNumeralsAdditive.substring(0, nCsame) in this.reset()
	nCsame = 0; // how many numerals in sameText
	xiSameText = 0;
	started = false; // true iff initialText was found in romanNumeralsAdditive
	finished = true; // iff finished all the stages of this animation
	constructor(m)
	{
		if (m === null)
			return;
		this.morph = m;
		this.closeTheGaps = new SlideTextHorizontally(this.morph.finalText);
	}
	reset()
	{
		this.started = false;
		this.finished = true;
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		this.nCsame = romanNumeralsAdditive.length - this.morph.initialText.length; // how many numerals in sameText
		if (this.nCsame < 0)
			return; // romanNumeralsAdditive shorter than initialText, so nothing to do here
		if (romanNumeralsAdditive.substring(this.nCsame) !== this.morph.initialText)
			return; // romanNumeralsAdditive does not end with initialText, so nothing to do here
		this.started = true;
		this.finished = false;
		this.morph.reset();
		this.xiSameText = romanNumeralsAdditiveCanvas.width - hOffset;
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		let metrics = ctx.measureText(romanNumeralsAdditive);
		if (metrics !== null &&
			fpLess(0, metrics.width, fpTolerance) &&
			fpLess(metrics.width, this.xiSameText, fpTolerance))
			this.xiSameText -= metrics.width;
		this.sameText = romanNumeralsAdditive.substring(0, this.nCsame);
	}
	more()
	{
		if (this.started == false || this.finished == true)
			return false;
		if (this.morph.done() == false)
		{
			this.morph.proceed();
			this.morph.draw();
		}
		else
		{
			if (this.morph.recent())
				this.closeTheGaps.reset(this.sameText,
					this.xiSameText, this.morph.xFinalText());
			this.finished = this.closeTheGaps.done();
			if (this.finished == false)
			{
				this.closeTheGaps.proceed();
				this.closeTheGaps.draw();
			}
		}
		if (this.finished)
		{
			let s = replaceLastChars(romanNumeralsAdditive, this.morph.initialText, this.morph.finalText);
			setRomanNumeralsAdditive(s);
		}
		return !this.finished;
	}
}

class AnimateNumeralInsertion
{
	morph = null; // to store Fade object (for fading-in)
	makeSpace = null; // to store SlideTextHorizontally object
	started = false; // true iff initialText was found in romanNumeralsAdditive
	finished = true; // iff finished all the stages of this animation
	constructor(m)
	{
		if (m === null)
			return;
		this.morph = m;
		this.makeSpace = new SlideTextHorizontally(null);
	}
	reset()
	{
		this.started = false;
		this.finished = true;
		if (this.morph.finalText == null)
			return; // this.morph not properly initialized
		if (romanNumeralsAdditiveCanvas.getContext == null)
			return; // browser does not support canvas
		this.started = true;
		this.finished = false;
		let xi = romanNumeralsAdditiveCanvas.width - hOffset;
		let xf = xi;
		const ctx = romanNumeralsAdditiveCanvas.getContext("2d");
		let metrics = ctx.measureText(romanNumeralsAdditive);
		if (metrics !== null &&
			fpLess(0, metrics.width, fpTolerance) &&
			fpLess(metrics.width, xi, fpTolerance))
			xi -= metrics.width;
		metrics = ctx.measureText(this.morph.finalText);
		if (metrics !== null &&
			fpLess(0, metrics.width, fpTolerance) &&
			fpLess(metrics.width, xi, fpTolerance))
			xf = xi - metrics.width;
		this.makeSpace.reset(romanNumeralsAdditive,	xi, xf);
	}
	more()
	{
		if (this.started == false || this.finished == true)
			return false;
		if (this.makeSpace.done() == false)
		{
			this.makeSpace.proceed();
			this.makeSpace.draw();
		}
		else
		{
			if (this.makeSpace.recent())
				this.morph.reset();
			this.finished = this.morph.done();
			if (this.finished == false)
			{
				this.morph.proceed();
				this.morph.draw();
			}
		}
		if (this.finished)
			setRomanNumeralsAdditive(romanNumeralsAdditive + this.morph.finalText);
		return !this.finished;
	}
}

let mInI = new Fade(null, "I");
let aInsertI = new AnimateNumeralInsertion(mInI);
let mIIIIItoV = new MetamorphoseIIIIItoV();
let aIIIIItoV = new AnimateNumeralSubstitutionManyToOne(mIIIIItoV);
let mVVtoX = new MetamorphoseVVtoX();
let aVVtoX = new AnimateNumeralSubstitutionManyToOne(mVVtoX);
let mXXXXXtoL = new Fade("XXXXX", "L");
let aXXXXXtoL = new AnimateNumeralSubstitutionManyToOne(mXXXXXtoL);
let mLLtoC = new Fade("LL", "C");
let aLLtoC = new AnimateNumeralSubstitutionManyToOne(mLLtoC);
let mCCCCCtoD = new Fade("CCCCC", "D");
let aCCCCCtoD = new AnimateNumeralSubstitutionManyToOne(mCCCCCtoD);
let mDDtoM = new Fade("DD", "M");
let aDDtoM = new AnimateNumeralSubstitutionManyToOne(mDDtoM);

let incrementNumberHandlerState = 0;

async function incrementNumber()
{
	if (incrementNumberHandlerState == 0)
	{
		if (inputNumber >= largestNumberToDisplay) return;
		if (incrementOrDecrementExecuting) return;
		disableButtons(true);
		arabicNumeralsElement.value = "";
		eraseDrawings();
		await pause(minimumPauseTime);
		inputNumber++;
		aInsertI.reset();
		incrementNumberHandlerState++;
	}
	if (incrementNumberHandlerState == 1)
	{
		if (aInsertI.more())
			window.requestAnimationFrame(incrementNumber);
		else
		{
			aIIIIItoV.reset();
			incrementNumberHandlerState++;
		}
	}
	if (incrementNumberHandlerState == 2)
	{
		if (aIIIIItoV.more())
			window.requestAnimationFrame(incrementNumber);
		else
		{
			aVVtoX.reset();
			incrementNumberHandlerState++;
		}
	}
	if (incrementNumberHandlerState == 3)
	{
		if (aVVtoX.more())
			window.requestAnimationFrame(incrementNumber);
		else
		{
			aXXXXXtoL.reset();
			incrementNumberHandlerState++;
		}
	}
	if (incrementNumberHandlerState == 4)
	{
		if (aXXXXXtoL.more())
			window.requestAnimationFrame(incrementNumber);
		else
		{
			aLLtoC.reset();
			incrementNumberHandlerState++;
		}
	}
	if (incrementNumberHandlerState == 5)
	{
		if (aLLtoC.more())
			window.requestAnimationFrame(incrementNumber);
		else
		{
			aCCCCCtoD.reset();
			incrementNumberHandlerState++;
		}
	}
	if (incrementNumberHandlerState == 6)
	{
		if (aCCCCCtoD.more())
			window.requestAnimationFrame(incrementNumber);
		else
		{
			aDDtoM.reset();
			incrementNumberHandlerState++;
		}
	}
	if (incrementNumberHandlerState == 7)
	{
		if (aDDtoM.more())
			window.requestAnimationFrame(incrementNumber);
		else
			incrementNumberHandlerState++;
	}
	if (incrementNumberHandlerState == 8)
	{
		setNumber();
		reenableButtons();
		incrementNumberHandlerState = 0;
	}
}

async function decrementNumber()
{
	if (inputNumber <= smallestNumberToDisplay) return;
	if (incrementOrDecrementExecuting) return;
	disableButtons(false);
	arabicNumeralsElement.value = "";
	eraseDrawings();
	await pause(minimumPauseTime);
	inputNumber--;
	if (inputNumber == 0)
	{
		setRomanNumeralsAdditive("");
		arabicNumeralsElement.value = inputNumber.toString();
		reenableButtons();
		return;
	}
	let s = replaceLastChars(romanNumeralsAdditive, "M", "DD");
	if (s != null) {setRomanNumeralsAdditive(s); await pause(replacementPauseTime);}
	s = replaceLastChars(romanNumeralsAdditive, "D", "CCCCC");
	if (s != null) {setRomanNumeralsAdditive(s); await pause(replacementPauseTime);}
	s = replaceLastChars(romanNumeralsAdditive, "C", "\u228f"); // \u228f = square subset symbol
	if (s != null)
	{ // C -> LL multistep text-character-based animation
		setRomanNumeralsAdditive(s);
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanNumeralsAdditive, "\u228f", "\u0393L"); // \u0393 = capital letter gamma
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\u0393L", "LL");
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
	}
	s = replaceLastChars(romanNumeralsAdditive, "L", "XXXXX");
	if (s != null) {setRomanNumeralsAdditive(s); await pause(replacementPauseTime);}
	s = replaceLastChars(romanNumeralsAdditive, "X", "\u1D27\u2C7D"); // \u1D27 = small capital letter lambda
	if (s != null)
	{ // X -> VV multistep text-character-based animation
		setRomanNumeralsAdditive(s);
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanNumeralsAdditive, "\u1D27\u2C7D", "\u039bV"); // \u2C7D = superscript letter v
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\u039bV", "VV"); // \u039b = capital letter lambda
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
	}
	s = replaceLastChars(romanNumeralsAdditive, "V", "\\/");
	if (s != null)
	{ // V -> IIIII multistep text-character-based animation
		setRomanNumeralsAdditive(s);
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanNumeralsAdditive, "\\/", "\\ ////");
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\\ ////", "IIIII");
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
	}
	s = romanNumeralsAdditive;
	setRomanNumeralsAdditive(s.substring(0,s.length-1));
	setNumber();
	reenableButtons();
}

function processNumberArabic()
{
	const s = arabicNumeralsElement.value;
	const s0 = s.replace(/\s+/g, ''); // remove all whitespace
	const m = s0.match(/[^0-9]/); // check for invalid input
	if (m) inputNumber = smallestNumberToDisplay;
	else
	{
		const m0 = s0.match(/\d+/);
		if (m0) // use reg.expr. to match and extract the value
		{
			const r = parseInt(m0[0]);
			if (r < smallestNumberToDisplay)
				inputNumber = smallestNumberToDisplay;
			else if (largestNumberToDisplay < r)
				inputNumber = largestNumberToDisplay;
			else inputNumber = r;
		} else inputNumber = smallestNumberToDisplay;
	}
	setNumber(inputNumber);
}

initializeCanvas(tallyCanvas, true);
initializeCanvas(romanToArabicConnectorCanvas, true);
initializeCanvas(romanAdditiveToSubtractiveConnectorCanvas, true);
initializeCanvas(romanNumeralsAdditiveCanvas, false);
initializeCanvas(romanNumeralsSubtractiveCanvas, false);
//testCanvas();
setNumber(0);
//the code to bind keyup listener to input text element is based on example from
//https://blog.devgenius.io/how-to-detect-the-pressing-of-the-enter-key-in-a-text-input-field-with-javascript-380fb2be2b9e
arabicNumeralsElement.addEventListener("keyup",
	(event) => {if (event.keyCode === 13) processNumberArabic();});
