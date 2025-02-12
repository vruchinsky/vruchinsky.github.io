const largestNumberToDisplay = 4999;
const smallestNumberToDisplay = 0;
const emptySetSymbol = "\u2205"; // hex code for empty-set symbol in unicode

const arabicNumeralsElement = document.getElementById("DisplayArabic");
const romanToArabicConnectorCanvas = document.getElementById("ConnectRomanToArabic");
const romanNumeralsElement = document.getElementById("DisplayRoman");
const incrementButton = document.getElementById("incrementButton");
const decrementButton = document.getElementById("decrementButton");
const tallyCanvas = document.getElementById("tally");

const foregroundWeightBoxBoundary = 0.3;
const foregroundWeightBoxBoundary2 = 0.2;
const foregroundWeightConnector = 0.3;
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
const buttonsPressedColor = "#A0A0A0";
const buttonHoverColor = "#C0C0C0";

let inputNumber = 0;
let romanNumeralsAdditive = "";
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
	if (cv.getContext == null) return;
	const ctx = cv.getContext("2d");
	const canvasStyle = getComputedStyle(cv);
	const backgroundColor = canvasStyle.backgroundColor;
	const oldFillStyle = ctx.fillStyle;
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(-0.5, -0.5, cv.width, cv.height); // clear the canvas
	ctx.fillStyle = oldFillStyle; // undo the change to the canvas context
}

function eraseDrawings()
{
	clearCanvas(tallyCanvas);
	clearCanvas(romanToArabicConnectorCanvas);
	box1000hPos = 0;
	box1000width = 0;
}

function setNumber(n)
{
	let newNumber = false;
	if (typeof n !== "undefined")
	{
		newNumber = true;
		inputNumber = n;
		const s = convertToRomanNumeralsAdditive(inputNumber);
		setRomanNumeralsAdditive(s);
	}
	arabicNumeralsElement.value = inputNumber.toString();
	if (newNumber)
		eraseDrawings();
	writeTally(inputNumber);
	connectRomanToArabic();
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
	if (romanNumeralsElement.getContext == null)
		return;
	ctx = romanNumeralsElement.getContext("2d");
	ctx.fillText(emptySetSymbol, 10, 20);
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
	if (s.length < a.length) return null; // otherwise do nothing and return null
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

function convertToRomanNumeralsAdditive(n)
{
	if (typeof n === "undefined") n = inputNumber;
	if (n === 0) return emptySetSymbol;
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

function drawConnectorForOrderOfMagnitude(ctx, cvHeight, OoM, start, end, rn, an)
{
	if (start < 0) return;
	if (start > end) return;
	if (end >= rn.length) return;
	if (OoM < 1) return;
	if (OoM > an.length) return;
	const toY = 1;
	let fromX;
	const toX1 = (OoM>1) ? stringWidthOnCanvas(ctx, an.substring(an.length-OoM+1)) : 0;
	const toX2 = stringWidthOnCanvas(ctx, an.substring(an.length-OoM));
	const toXm = 0.5 * (toX1 + toX2);
	const nPastEnd = rn.length - 1 - end;
	const fromX1 = (0<nPastEnd) ? stringWidthOnCanvas(ctx, rn.substring(end+1)) : 0;
	const fromX2 = stringWidthOnCanvas(ctx, rn.substring(start));
	let fromY = cvHeight;
	let bLen = connectingLineBeginningVerticalSectionLength;
	const eLen = connectingLineEndingVerticalSectionLength;
	if (start < end)
	{
		fromY = cvHeight - braceArcRadius;
		bLen = 0;
		drawHorizontalBrace(ctx, fromX1, cvHeight, fromX2-fromX1, true);
		fromX = (OoM<nPastEnd+1) ? fromX1+braceArcRadius : ((rn.length-start<OoM) ? fromX2-braceArcRadius : toXm);
	} else fromX = 0.5 * (fromX1 + fromX2);
	drawConnectingLine(ctx, fromX, fromY, toXm, toY, bLen, eLen);
}

function connectRomanToArabic()
{
	if (romanToArabicConnectorCanvas.getContext == null)
	{ // fallback in case browser does not support canvas
		return;
	}
	const ctx = romanToArabicConnectorCanvas.getContext("2d");
	const canvasStyle = getComputedStyle(romanToArabicConnectorCanvas);
	ctx.lineWidth = 1;
	const an = arabicNumeralsElement.value;
	const rn = romanNumeralsAdditive;
	if (rn.length < 1) return "";
	if (rn === emptySetSymbol) return "";
	let lastOoMcnctd = 0; // last order of magnitude for which connection was drawn
	let curOoM = 0; // order of magnitude of currently scanned Roman numeral (rn[i])
	let lastOoM = 0; // order of magnitude of previously scanned Roman numeral (rn[i+1])
	let start = rn.length; // index of the first numeral in most recently scanned order of magnitude
	let end = rn.length; // index of the last numeral in most recently scanned order of magnitude
	let i, c;
	const h = romanToArabicConnectorCanvas.height;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightConnector);
	for (i=rn.length-1; i>=0; i--)
	{
		c = rn[i];
		curOoM = orderOfMagnitude(c);
		if (curOoM > lastOoM && i < rn.length-1)
		{
			end = start - 1;
			start = i + 1;
			if (lastOoMcnctd + 1 < lastOoM || curOoM > lastOoM + 1)
			{
				lastOoMcnctd = lastOoM;
				drawConnectorForOrderOfMagnitude(ctx, h, lastOoM, start, end, rn, an);
			}
		}
		lastOoM = curOoM;
	}
	if (lastOoMcnctd + 1 < lastOoM)
	{
		end = start - 1;
		drawConnectorForOrderOfMagnitude(ctx, h, lastOoM, 0, end, rn, an);
	}
	ctx.strokeStyle = foregroundColor; // restore foreground color
	return;
}

function connectRomanToTally()
{
	if (romanNumeralsElement.getContext == null)
	{ // fallback in case browser does not support canvas
		romanNumeralsElement.textContent = s;
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
	const ctx = romanNumeralsElement.getContext("2d");
	const nPastEnd = rn.length - 1 - end;
	const fromX1 = (0<nPastEnd) ? stringWidthOnCanvas(ctx, rn.substring(end+1)) : 0;
	const lessOrEqX1 = fpLessEq(box1000hPos-hOffset, fromX1, fpTolerance);
	if (lessOrEqX1) return; // box1000 is directly under the Ms
	const metrics = ctx.measureText(rn);
	let fromY = metrics.actualBoundingBoxAscent + 2;
	const fromX2 = stringWidthOnCanvas(ctx, rn.substring(start));
	const fromXm = 0.5 * (fromX1 + fromX2);
	const rFromXm = romanNumeralsElement.width - fromXm - hOffset;
	const rFromX2 = romanNumeralsElement.width - fromX2 - hOffset;
	const toY = romanNumeralsElement.height;
	const rToX = romanNumeralsElement.width - box1000hPos - hOffset;
	ctx.lineWidth = 1;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightConnector);
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
}

function displayRomanNumeralsAdditive(s)
{
	if (romanNumeralsElement.getContext == null)
	{ // fallback in case browser does not support canvas
		romanNumeralsElement.textContent = s;
		return;
	}
	clearCanvas(romanNumeralsElement);
	const ctx = romanNumeralsElement.getContext("2d");
	if (s.length < 1) return;
	const metrics = ctx.measureText(s);
	const hPos = romanNumeralsElement.width - metrics.width - hOffset;
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
	incrementButton.style.backgroundColor = incrementButtonPressed ? buttonDisabledColor : buttonsPressedColor;
	decrementButton.style.backgroundColor = incrementButtonPressed ? buttonsPressedColor : buttonDisabledColor;
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
	romanNumeralsElement.style.cursor = 'progress';
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
	romanNumeralsElement.style.cursor = 'default';
}

function setRomanNumeralsAdditive(s)
{
	romanNumeralsAdditive = s;
	displayRomanNumeralsAdditive(s);
}

async function incrementNumber()
{
	if (inputNumber >= largestNumberToDisplay) return;
	if (incrementOrDecrementExecuting) return;
	disableButtons(true);
	arabicNumeralsElement.value = "";
	eraseDrawings();
	await pause(minimumPauseTime);
	if (inputNumber == 0)
		setRomanNumeralsAdditive("");
	inputNumber++;
	setRomanNumeralsAdditive(romanNumeralsAdditive + "I");
	let s = replaceLastChars(romanNumeralsAdditive, "IIIII", "\\ ////");
	if (s != null)
	{ // IIIII -> V multistep text-character-based animation
		await pause(intermediateReplacementPauseTime);
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\\ ////", "\\/");
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\\/", "V");
		setRomanNumeralsAdditive(s);
	}
 	s = replaceLastChars(romanNumeralsAdditive, "VV", "\u039bV"); // \u039b = capital letter lambda
	if (s != null)
	{ // VV -> X multistep text-character-based animation
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\u039bV", "\u1D27\u2C7D"); // \u1D27 = small capital letter lambda
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\u1D27\u2C7D", "X"); // \u2C7D = superscript letter v
		setRomanNumeralsAdditive(s);
	}
	s = replaceLastChars(romanNumeralsAdditive, "XXXXX", "L");
	if (s != null) {await pause(replacementPauseTime); setRomanNumeralsAdditive(s);}
 	s = replaceLastChars(romanNumeralsAdditive, "LL", "\u0393L"); // \u0393 = capital letter gamma
 	if (s != null)
	{ // LL -> C multistep text-character-based animation
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\u0393L", "\u228f"); // \u228f = square subset symbol
		setRomanNumeralsAdditive(s);
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsAdditive, "\u228f", "C");
		setRomanNumeralsAdditive(s);
	}
	s = replaceLastChars(romanNumeralsAdditive, "CCCCC", "D");
	if (s != null) {await pause(replacementPauseTime); setRomanNumeralsAdditive(s);}
 	s = replaceLastChars(romanNumeralsAdditive, "DD", "M");
	if (s != null) {await pause(replacementPauseTime); setRomanNumeralsAdditive(s);}
	setNumber();
	reenableButtons();
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
		setRomanNumeralsAdditive(emptySetSymbol);
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
initializeCanvas(romanNumeralsElement, false);
//testCanvas();
setNumber(0);
//the code to bind keyup listener to input text element is based on example from
//https://blog.devgenius.io/how-to-detect-the-pressing-of-the-enter-key-in-a-text-input-field-with-javascript-380fb2be2b9e
arabicNumeralsElement.addEventListener("keyup",
	(event) => {if (event.keyCode === 13) processNumberArabic();});
