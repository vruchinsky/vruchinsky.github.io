const largestNumberToDisplay = 4999;
const smallestNumberToDisplay = 0;

const arabicNumeralsElement = document.getElementById("DisplayArabic");
const ANinstructionsElement = document.getElementById("labelANinstructions");
const romanToArabicConnectorCanvas = document.getElementById("ConnectRomanToArabic");
const romanNumeralsAdditiveCanvas = document.getElementById("DisplayRomanAdditive");
const romanNumeralsSubtractiveCanvas = document.getElementById("DisplayRomanSubtractive");
const romanAdditiveToSubtractiveConnectorCanvas = document.getElementById("ConnectRomanAdditiveToSubtractive");
const romanToTallyConnectorCanvas = document.getElementById("ConnectRomanToTally");
const incrementButton = document.getElementById("incrementButton");
const decrementButton = document.getElementById("decrementButton");
const tallyCanvas = document.getElementById("tally");
const showHideSettingsButton = document.getElementById("ShowHideSettingsButton");
const showHideArabicNumeralsButton = document.getElementById("ShowHideArabicNumeralsButton");
const AnimationSpeedMetamorphosisInput = document.getElementById("AnimationSpeedMetamorphosis");
const AnimationSpeedMetamorphosisDisplay = document.getElementById("DisplayAnimationSpeedMetamorphosis");
const AnimationSpeedClosingTheGapsInput = document.getElementById("AnimationSpeedClosingTheGaps");
const AnimationSpeedClosingTheGapsDisplay = document.getElementById("DisplayAnimationSpeedClosingTheGaps");

const foregroundWeightBoxBoundary = 0.3;
const foregroundWeightBoxBoundary2 = 0.3;
const foregroundWeightConnector = 0.2;
const foregroundWeightConnector2 = 0.3;
const tallyMarkHeight = 25;
const tallyMarkThickness = 1;
const hSpace = 2;
const verticalSpaceBetweenTallyMarks = 3;
const verticalSpaceBetween5s = 6;
const verticalSpaceBetween50s = 7;
const horizontalOffset = 2;
const verticalOffset = 2;
const boundaryMargin = 1;
const boundaryThickness = 1;
const boundaryPadding = 1;
const hSpaceBetween5s = 0;
const hSpaceBetween100s = 2;
const hSpaceBetween500s = 5;
const horizontalOffsetBetween1000s = 1;
const verticalOffsetBetween1000s = 1;
const verticalOffsetBetween5s = Math.ceil(verticalSpaceBetweenTallyMarks / 2);
const connectingLineBeginningVerticalSectionLength = 3;
const connectingLineEndingVerticalSectionLength = 3;
const boxCornerRadius = 2;
const braceArcRadius = 4; // radius of each arc of a long brace
const buttonNormalBgColor = incrementButton.style.backgroundColor;
const buttonHoverBgColor = "#707070";
const buttonNormalColor = incrementButton.style.color;
const buttonDisabledColor = "#505050";

class DrawingOnCanvas
{
// this.text and this.numberOfTallyMarks are used in function drawTally()
// when sliding tally rightwards after one tally mark is faded out
// but before inputNumber and romanNumeralsAdditive
// are updated (which is done at the end of decrementNumer())
// otherwise, if inputNumber and romanNumeralsAdditive are used directly,
// the faded out tally mark mistakenly reappears when the tally is slid rightwards
	text = null;
	numberOfTallyMarks = null;
	canvas = null;
	ctx = null;
	calculateOnly = false;
	flipHorizontalAxis = false;
	verticalPosition = 0;
	horizontalPosition = 0;
	drawingWidth = 0;
	drawingHeight = 0;
	constructor(cv, flipHA)
	{
		this.canvas = cv;
		this.flipHorizontalAxis = flipHA;
		if (this.canvas.getContext == null)
			return; // browser does not support canvas
		this.ctx = this.canvas.getContext("2d");
	}
	displayText()
	{
		if (this.ctx == null)
		{ // fallback in case browser does not support canvas
			this.canvas.textContent = this.text;
			return;
		}
		this.clearCanvas();
		if (this.text == null || this.text.length < 1)
			return;
		const metrics = this.ctx.measureText(this.text);
		this.drawingWidth = metrics.width;
		this.verticalPosition = this.drawingHeight = metrics.actualBoundingBoxAscent;
		this.horizontalPosition = this.drawingWidth + horizontalOffset;
		if (this.flipHorizontalAxis == false)
			this.horizontalPosition = this.canvas.width - this.horizontalPosition;
		this.ctx.fillText(this.text, this.horizontalPosition, this.verticalPosition);
	}
	draw(f, x, y, width)
	{
		this.horizontalPosition = x;
		this.verticalPosition = y;
		let sz;
		if (typeof width === 'undefined')
			sz = f(this, x, y);
		else
			sz = f(this, x, y, width);
		this.drawingWidth = sz.w;
		this.drawingHeight = sz.h;
	}
	set(t)
	{
		this.text = t;
		this.displayText();
	}
	get() {return this.text;}
	initializeCanvas()
	{
		this.ctx = initializeCanvas(this.canvas, this.flipHorizontalAxis);
	}
	clearCanvas() {clearCanvas(this.canvas);}
}

let romanNumeralsAdditive = new DrawingOnCanvas(romanNumeralsAdditiveCanvas, false);
let romanNumeralsSubtractive = new DrawingOnCanvas(romanNumeralsSubtractiveCanvas, false);
let tally = new DrawingOnCanvas(tallyCanvas, true);

let ArabicNumeralsVisible = true; //false;
let settingsVisible = true; //false;
let inputNumber = 0;
let incrementOrDecrementExecuting = false;
let box1000horizontalPosition = 0;

ANinstructionsElement.innerText = "type in a number (at least " +
	String(smallestNumberToDisplay) + " but less than " +
	String(1+largestNumberToDisplay) +
	") and press [Enter] or use the buttons below";
setArabicNumeralsVisibility(ArabicNumeralsVisible);
showHideArabicNumeralsButton.addEventListener('mouseover', () => {showHideArabicNumeralsButton.style.backgroundColor = buttonHoverBgColor;});
showHideArabicNumeralsButton.addEventListener('mouseout', () => {showHideArabicNumeralsButton.style.backgroundColor = buttonNormalBgColor;});
function ShowHideArabicNumerals()
{
	ArabicNumeralsVisible = !ArabicNumeralsVisible;
	setArabicNumeralsVisibility(ArabicNumeralsVisible);
}

function setArabicNumeralsVisibility(v)
{
	showHideArabicNumeralsButton.textContent = v ? "hide" : "show";
	showHideArabicNumeralsButton.setAttribute("title", v ? "click to hide Arabic numerals" : "click to show Arabic numerals");
	const s = v ? "visible" : "hidden";
	const els = document.getElementsByClassName("ArabicNumeralsDisplay");
	for (let i=0; i<els.length; i++)
		els[i].style.visibility = s;
}

setSettingsVisibility(settingsVisible);
function ShowHideSettings()
{
	settingsVisible = !settingsVisible;
	setSettingsVisibility(settingsVisible);
}

showHideSettingsButton.addEventListener('mouseover', () => {showHideSettingsButton.style.backgroundColor = buttonHoverBgColor;});
showHideSettingsButton.addEventListener('mouseout', () => {showHideSettingsButton.style.backgroundColor = buttonNormalBgColor;});
function setSettingsVisibility(v)
{
	const s = v ? "visible" : "hidden";
	const els = document.getElementsByClassName("settings");
	for (let i=0; i<els.length; i++)
		els[i].style.visibility = s;
	showHideSettingsButton.setAttribute("title", v ? "click to hide settings" : "click to show settings");
}

let AnimationSpeedMetamorphosis = 0;
function updateAnimationSpeedMetamorphosis()
{
	AnimationSpeedMetamorphosis = parseFloat(AnimationSpeedMetamorphosisInput.value);
	AnimationSpeedMetamorphosisDisplay.textContent = AnimationSpeedMetamorphosis.toString();
}
let AnimationSpeedClosingTheGaps = 0;
function updateAnimationSpeedClosingTheGaps()
{
    AnimationSpeedClosingTheGaps = parseFloat(AnimationSpeedClosingTheGapsInput.value);
    AnimationSpeedClosingTheGapsDisplay.textContent = AnimationSpeedClosingTheGaps.toString();
}

updateAnimationSpeedMetamorphosis();
updateAnimationSpeedClosingTheGaps();
AnimationSpeedMetamorphosisInput.addEventListener('input', updateAnimationSpeedMetamorphosis);
AnimationSpeedClosingTheGapsInput.addEventListener('input', updateAnimationSpeedClosingTheGaps);

function initializeCanvas(cv, flipHorizontalAxis)
{
	if (cv.getContext == null)
		return null;
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
	return ctx;
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
	arabicNumeralsElement.value = "";
	clearCanvas(romanToTallyConnectorCanvas);
	clearCanvas(romanToArabicConnectorCanvas);
	clearCanvas(romanAdditiveToSubtractiveConnectorCanvas);
}

function setNumber(n)
{
	if (typeof n !== "undefined")
	{
		eraseDrawings();
		inputNumber = n;
		const s = convertToRomanNumeralsAdditive(inputNumber);
		romanNumeralsAdditive.set(s);
	}
	arabicNumeralsElement.value = inputNumber.toString();
	tally.clearCanvas(); // otherwise tally box not erased when decrementing >>> TEMPORARY <<<
	tally.numberOfTallyMarks = inputNumber; // used in drawTally()
	tally.text = romanNumeralsAdditive.get(); // used in drawTally()
	tally.draw(drawTally, horizontalOffset, verticalOffset);
	const s = convertRomanNumeralsAdditiveToSubtractive(romanNumeralsAdditive.get());
	romanNumeralsSubtractive.set(s);
	connectRomanToArabic();
	connectRomanAdditiveToSubtractive();
	connectRomanToTally();
	enableButtons();
}

const fpTolerance = 0.0001;
function fpEqual(a, b, tol) {return (a < b + tol && b < a + tol);}
function fpLess(a, b, tol) {return (a + tol < b);}
function fpLessEq(a, b, tol) {return !fpLess(b, a, tol);}
function fpMax(a, b, tol) {return fpLess(a, b, tol) ? b : a;}
function fpMin(a, b, tol) {return fpLess(a, b, tol) ? a : b;}
function fpLimitToInterval(n, a, b, tol) {return fpMax(fpMin(n, b, tol), a, tol);} // return a if n < a, b if n > b, n if a<=n<=b

function roundedRect(ctx, x, y, width, height, radius, widthOcclude, heightOcclude) // draw rectangle with rounded corners
{ // based on https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
	let occlude = typeof widthOcclude !== "undefined" && typeof heightOcclude !== "undefined";
	widthOcclude = typeof widthOcclude !== "undefined" ? widthOcclude : 0; // measuring from the corner closest to (0,0)
	heightOcclude = typeof heightOcclude !== "undefined" ? heightOcclude : 0; // measuring from the corner closest to (0,0)
	if (widthOcclude < 1 || heightOcclude < 1)
		occlude = false;
	if (fpLess(width, 2*radius, fpTolerance))
		radius = width/2; // avoid arcs protruding outside
	if (fpLess(height, 2*radius, fpTolerance))
		radius = height/2; // avoid arcs protruding outside
	if (fpLess(width, ctx.lineWidth, fpTolerance))
		return; // rectangle too thin to be drawn
	if (fpLess(height, ctx.lineWidth, fpTolerance))
		return; // rectangle too thin to be drawn
	let dx = width - ctx.lineWidth; // the horizontal distance between the opposite sides is smaller than the rectangle width by the line thickness
	let dy = height - ctx.lineWidth; // the vertical distance between the opposite sides is smaller than the rectangle height by the line thickness
	const x0 = x + radius;
	const x1 = x + dx - radius;
	const y0 = y + radius;
	const y1 = y + dy - radius;
	const heightVisible = dy - heightOcclude;
	const widthVisible = dx - widthOcclude;
	const ys = occlude ? (fpLessEq(radius, heightVisible, fpTolerance) ? y+heightOcclude : y1): y0;
	ctx.beginPath();
	ctx.moveTo(x, y0);
	if (fpLess(y0, ys, fpTolerance))
		ctx.moveTo(x, ys);
	if (fpLess(ys, y1, fpTolerance))
		ctx.lineTo(x, y1); // 1st line
	else
		ctx.moveTo(x, y1);
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
	} else
		ctx.moveTo(x0, y + dy);
	if (occlude == false || fpLess(0, heightVisible, fpTolerance))
		ctx.lineTo(x1, y + dy); // 2nd line
	else
		ctx.moveTo(x1, y + dy);
	if (fpLess(0, radius, fpTolerance) && fpLess(0, widthVisible, fpTolerance) && fpLess(0, heightVisible, fpTolerance))
		ctx.arc(x1, y1, radius, 0.5*Math.PI, 0, true); // 2nd rounded corner
	else
		ctx.moveTo(x + dx, y1);
	if (occlude == false || fpLess(0, widthVisible, fpTolerance))
		ctx.lineTo(x + dx, y0); // 3rd line
	else
		ctx.moveTo(x + dx, y0);
	if (fpLess(0, radius, fpTolerance) && fpLess(0, widthVisible, fpTolerance))
	{ // 3rd rounded corner
		let endAngle = 1.5*Math.PI;
		if (fpLessEq(widthVisible, radius, fpTolerance))
		{
			const c = (radius - widthVisible) / radius;
			const s = Math.sqrt(1 - c*c);
			if (fpLess(heightOcclude, radius*(1-s), fpTolerance))
				endAngle = Math.asin((radius - heightOcclude) / radius);
			else
				endAngle = Math.acos(c);
			endAngle = 2*Math.PI - endAngle;
		}
		ctx.arc(x1, y0, radius, 0, endAngle, true);
	} else
		ctx.moveTo(x1, y);
	const xf = occlude ? (fpLessEq(radius, widthVisible, fpTolerance) ? x+widthOcclude : x1): x0;
	if (fpLess(xf, x1, fpTolerance))
		ctx.lineTo(xf, y); // 4th line
	else
		ctx.moveTo(xf, y);
	if (fpLess(x0, xf, fpTolerance))
		ctx.moveTo(x0, y);
	if (occlude == false && fpLess(0, radius, fpTolerance))
		ctx.arc(x0, y0, radius, 1.5*Math.PI, Math.PI, true); // 4th rounded corner
	else
		ctx.moveTo(x, y0);
	ctx.stroke();
}

function drawVline(ctx, x, y, l)
{
	if (fpLess(l, ctx.lineWidth, fpTolerance))
		return; // line too short to be drawn
	const dy = l - ctx.lineWidth; // the distance between the two endpoints is smaller than the line length by the line thickness
	x = Math.floor(x);
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x, y + dy);
	ctx.stroke();
}

function drawHline(ctx, x, y, l)
{
	if (fpLess(l, ctx.lineWidth, fpTolerance))
		return; // line too short to be drawn
	const dx = l - ctx.lineWidth; // the distance between the two endpoints is smaller than the line length by the line thickness
	y = Math.floor(y);
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + dx, y);
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
	if (tally.canvas.getContext == null)
		return;
	let ctx = tally.canvas.getContext("2d");
	ctx.lineWidth = 1;
	let horizontalPosition = 1;
	let verticalPosition = 1;
	let sz = drawTallyMark(tally, horizontalPosition, verticalPosition);
	horizontalPosition += sz.w;
	sz = drawBox5(tally, horizontalPosition, verticalPosition);
	horizontalPosition += sz.w;
	sz = drawBox10(tally, horizontalPosition, verticalPosition);
	horizontalPosition += sz.w;
	sz = drawBox50(tally, horizontalPosition, verticalPosition);
	horizontalPosition += sz.w;
	sz = drawBox100(tally, horizontalPosition, verticalPosition);
	horizontalPosition += sz.w;
	sz = drawBox500(tally, horizontalPosition, verticalPosition);
	horizontalPosition += sz.w;
	sz = drawBox1000(tally, horizontalPosition, verticalPosition, 10);
	horizontalPosition += sz.w;
	if (romanToArabicConnectorCanvas.getContext == null)
		return;
	ctx = romanToArabicConnectorCanvas.getContext("2d");
	ctx.lineWidth = 1;
	horizontalPosition = 0;
	verticalPosition = romanToArabicConnectorCanvas.height;
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = 1;
	let foregroundColor = setIntermediateColor(ctx, foregroundWeightConnector);
	drawHorizontalBrace(ctx, horizontalPosition, verticalPosition, 60, true);
	drawHorizontalBrace(ctx, 70, 1, 60, false);
	ctx.lineWidth = oldlw;
	ctx.strokeStyle = foregroundColor; // restore foreground color
	if (romanNumeralsAdditive.canvas.getContext == null)
		return;
	ctx = romanNumeralsAdditive.canvas.getContext("2d");
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

function drawTallyMark(d, x, y, w)
{
	if (typeof w === "undefined" || fpLess(w, 1, fpTolerance))
		w = Math.floor(stringWidthOnCanvas(d.ctx, "I")); // width of the drawing
	const oldLineWidth = d.ctx.lineWidth;
	d.ctx.lineWidth = tallyMarkThickness;
	const h = tallyMarkHeight; // height of the drawing
	if (d.calculateOnly == false)
		drawVline(d.ctx, Math.floor(x + w/2), y, h);
	d.ctx.lineWidth = oldLineWidth; // restore the original value
	return {w, h};
}

function weightedAverageTruncated(a, b, w) {return Math.floor((1-w)*a + w*b);}

function setIntermediateColor(ctx, foregroundWeight)
{
	const canvasStyle = getComputedStyle(ctx.canvas);
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

function drawColumnHlines(d, x, y, len, n) // d is ref. to object of class DrawingOnCanvas (tally)
{
	const y0 = y; // save the initial vertical position to use it at the end to calculate the height of this drawing
	const dy = d.ctx.lineWidth + verticalSpaceBetweenTallyMarks;
	if (d.calculateOnly == false)
		drawHline(d.ctx, x, y, len);
	for (let i=1; i<n; i++)
	{
		y += dy;
		if (d.calculateOnly == false)
			drawHline(d.ctx, x, y, len);
	}
	return (y - y0 + d.ctx.lineWidth); // column height
}

function drawBox5(d, x, y, boxWidth) // d is ref. to object of class DrawingOnCanvas (tally)
{ // no need for vertical margin b/c boxes stacked horizontally
	if (typeof boxWidth === "undefined")
		boxWidth = Math.floor(stringWidthOnCanvas(d.ctx, "V"));
	const boundingRectWidth = boxWidth - boundaryMargin;
	const lineLength = boundingRectWidth - 2*boundaryThickness - 2*boundaryPadding;
	const lineHpos = x + boundaryThickness + boundaryPadding;
	const lineVpos = y + boundaryThickness + boundaryPadding;
	const oldlw = d.ctx.lineWidth;
	d.ctx.lineWidth = tallyMarkThickness;
	const columnHeight = drawColumnHlines(d, lineHpos, lineVpos, lineLength, 5);
	const boundingRectHeight = columnHeight + 2*boundaryPadding + 2*boundaryThickness;
	const foregroundColor = setIntermediateColor(d.ctx, foregroundWeightBoxBoundary);
	d.ctx.lineWidth = boundaryThickness;
	if (d.calculateOnly == false)
		roundedRect(d.ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	d.ctx.lineWidth = oldlw; // restore lineWidth
	d.ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	const iw = lineLength;  // width of the column of lines
	const ih = columnHeight; // height of the column of lines
	return {w, h, iw, ih};
}

function drawBox10(d, x, y, boxWidth) // d is ref. to object of class DrawingOnCanvas (tally)
{
	if (typeof boxWidth === "undefined")
		boxWidth = Math.floor(stringWidthOnCanvas(d.ctx, "X"));
	const boundingRectWidth = boxWidth - boundaryMargin;
	const lineLength = boundingRectWidth - 2*boundaryPadding - 2*boundaryThickness;
	const lineHpos = x + boundaryPadding + boundaryThickness;
	let lineVpos = y + boundaryPadding + boundaryThickness;
	const oldlw = d.ctx.lineWidth;
	d.ctx.lineWidth = tallyMarkThickness;
	const columnHeight1 = drawColumnHlines(d, lineHpos, lineVpos, lineLength, 5); // column of five horizontal,
	lineVpos = lineVpos + columnHeight1 + verticalSpaceBetween5s; // then space underneath,
	const columnHeight2 = drawColumnHlines(d, lineHpos, lineVpos, lineLength, 5); // then another column of five horizontal
	const boundingRectHeight = columnHeight1 + columnHeight2 + verticalSpaceBetween5s + 2*boundaryPadding + 2*boundaryThickness;
	const foregroundColor = setIntermediateColor(d.ctx, foregroundWeightBoxBoundary);
	d.ctx.lineWidth = boundaryThickness;
	if (d.calculateOnly == false)
		roundedRect(d.ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	d.ctx.lineWidth = oldlw; // restore lineWidth
	d.ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawColumn50Hlines(d, x, y, len) // d is ref. to object of class DrawingOnCanvas (tally)
{ // used in drawBox50(), drawBox100() and drawColumn100Hlines()
	const y0 = y; // save the initial vertical position to use it at the end to calculate the height of this drawing
	const xr = x + len + hSpaceBetween5s; // offset the 2nd column horizontally
	let dHeight;
	for (let i=0; i<5; i++)
	{
		dHeight = drawColumnHlines(d, x, y, len, 5); // 1st column of five horizontal,
		drawColumnHlines(d, xr, y + verticalOffsetBetween5s, len, 5); // 2nd column (offset horizontally&vertically),
		y += dHeight;
		y += verticalSpaceBetween5s; // regular vertical spacing (for visual clarity)
	}
	const w = 2*len + hSpaceBetween5s;  // width of the drawing
	const h = y - y0 + verticalOffsetBetween5s - verticalSpaceBetween5s; // height of the drawing
	return {w, h};
}

function drawBox50(d, x, y, boxWidth) // column of 25 short horizontal tally marks on the left,...
{//...with extra vertical space between each group of 5 and similar column on the right, all enclosed in rectangular box
	if (typeof boxWidth === "undefined") // d is ref. to object of class DrawingOnCanvas (tally)
		boxWidth = Math.floor(stringWidthOnCanvas(d.ctx, "L")); // make same width as Roman numeral
	const boundingRectWidth = boxWidth - boundaryMargin;
	const lineLength = Math.floor((boundingRectWidth - 2*boundaryThickness - 2*boundaryPadding - hSpaceBetween5s)/2);
	const lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const oldlw = d.ctx.lineWidth;
	d.ctx.lineWidth = tallyMarkThickness;
	const columnSize = drawColumn50Hlines(d, lineHpos, lineVpos, lineLength);
	const boundingRectHeight = columnSize.h + 2*boundaryPadding + 2*boundaryThickness;
	const foregroundColor = setIntermediateColor(d.ctx, foregroundWeightBoxBoundary);
	d.ctx.lineWidth = boundaryThickness;
	if (d.calculateOnly == false)
		roundedRect(d.ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	d.ctx.lineWidth = oldlw; // restore lineWidth
	d.ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawColumn100Hlines(d, x, y, len) // d is ref. to object of class DrawingOnCanvas (tally)
{ // used in drawBox100() and drawColumns500Hlines()
	const columnSize1 = drawColumn50Hlines(d, x, y, len); // column of 50 horizontal tally marks,
	y += columnSize1.h;
	y += verticalSpaceBetween50s; // extra space halfway down,
	const columnSize2 = drawColumn50Hlines(d, x, y, len); // another column of 50 horizontal tally marks underneath
	const w = columnSize1.w; // width of the drawing
	const h = columnSize1.h + columnSize2.h + verticalSpaceBetween50s; // height of the drawing	
	return {w, h};
}

function drawBox100(d, x, y, boxWidth) // column of 50 short horizontal tally marks on the left, with extra vertical space between...
{//...each group of 5, and extra space halfway down, and similar column on the right, all enclosed in rectangular box
	if (typeof boxWidth === "undefined") // d is ref. to object of class DrawingOnCanvas (tally)
		boxWidth = Math.floor(stringWidthOnCanvas(d.ctx, "C")); // make same width as Roman numeral
	const boundingRectWidth = boxWidth - boundaryMargin;
	const lineLength = Math.floor((boundingRectWidth - 2*boundaryThickness - 2*boundaryPadding - hSpaceBetween5s)/2);
	//const lineLength = boundingRectWidth/2 - boundaryPadding - boundaryThickness - 1;
	const lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const columnSize = drawColumn100Hlines(d, lineHpos, lineVpos, lineLength);
	const boundingRectHeight = columnSize.h + 2*boundaryPadding + 2*boundaryThickness;
	const foregroundColor = setIntermediateColor(d.ctx, foregroundWeightBoxBoundary);
	const oldlw = d.ctx.lineWidth;
	d.ctx.lineWidth = boundaryThickness;
	if (d.calculateOnly == false)
		roundedRect(d.ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	d.ctx.lineWidth = oldlw; // restore lineWidth
	d.ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawColumns500Hlines(d, x, y, w) // d is ref. to object of class DrawingOnCanvas (tally)
{// used in drawBox1000() and drawBox500()
	const nDblCols = 5;
	const dblColWidth = (w - (nDblCols-1)*hSpaceBetween100s)/nDblCols;
	const lineLength = Math.floor((dblColWidth - hSpaceBetween5s)/2);
	const dx = dblColWidth + hSpaceBetween100s;
	const columnSize = drawColumn100Hlines(d, Math.floor(x), y, lineLength);
	for (let i=1; i<nDblCols; i++)
	{
		x += dx; // move horizontal position
		drawColumn100Hlines(d, Math.floor(x), y, lineLength);
	}
	const h = columnSize.h; // height of the drawing
	return {w, h};
}

function drawBox500(d, x, y, rnWidth) // 5 double columns each of 100 short horizontal tally marks, with extra vertical...
{//...space between each group of 5 tally marks, and extra space halfway down, all enclosed in rectangular box
	if (typeof rnWidth === "undefined") // d is ref. to object of class DrawingOnCanvas (tally)
		rnWidth = stringWidthOnCanvas(d.ctx, "D");
	const boxWidth = Math.floor(4.2 * rnWidth);
	const boundingRectWidth = Math.floor(boxWidth - boundaryMargin);
	const columns500width = boundingRectWidth - 2*boundaryThickness - 2*boundaryPadding;
	const lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const oldlw = d.ctx.lineWidth;
	d.ctx.lineWidth = tallyMarkThickness;
	const columnSize = drawColumns500Hlines(d, lineHpos, lineVpos, columns500width);
	const boundingRectHeight = columnSize.h + 2*boundaryPadding + 2*boundaryThickness; // same as for 100
	const foregroundColor = setIntermediateColor(d.ctx, foregroundWeightBoxBoundary);
	d.ctx.lineWidth = boundaryThickness;
	if (d.calculateOnly == false)
		roundedRect(d.ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	d.ctx.lineWidth = oldlw; // restore lineWidth
	d.ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

// d is ref. to object of class DrawingOnCanvas (tally)
function drawBox1000(d, x, y, n) // 10 double columns each of 100 short horizontal tally marks, with extra vertical...
{//...space between each group of 5 tally marks, and extra space halfway down, all enclosed in rectangular box
// display n 1000s of tally marks. If n>1, draw 1 box of 1000 and (n-1) partial rectangles...
//...to look like they occlude each other partially being stacked under each other with a small offset
	let w = 0; // width of the drawing
	let h = 0; // height of the drawing
	n = typeof n !== "undefined" ? n : 1; // default value
	if (n < 1) return {w, h};
	const rnWidth = stringWidthOnCanvas(d.ctx, "M");
	const boxWidth = Math.floor(8.1 * rnWidth); // for 1 rectangular box of 1000 tally marks
	const boundingRectWidth = Math.floor(boxWidth - boundaryMargin);
	const columns1000width = boundingRectWidth - 2*boundaryThickness - 2*boundaryPadding;
	const columns500width = Math.floor((columns1000width - hSpaceBetween500s) / 2);
	let lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const oldlw = d.ctx.lineWidth;
	d.ctx.lineWidth = tallyMarkThickness;
	const columnSize1 = drawColumns500Hlines(d, lineHpos, lineVpos, columns500width);
	lineHpos = lineHpos + columns500width + hSpaceBetween500s;
	drawColumns500Hlines(d, lineHpos, lineVpos, columns500width);
	const boundingRectHeight = columnSize1.h + 2*boundaryPadding + 2*boundaryThickness; // for 1 rectangular box of 1000 tally marks, same as for 100
	const foregroundColor = setIntermediateColor(d.ctx, foregroundWeightBoxBoundary);
	d.ctx.lineWidth = boundaryThickness;
	if (d.calculateOnly == false)
		roundedRect(d.ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius);
	// draw additional rectangular boxes looking like they are stacked under the one already drawn but a little offset
	const hShift = boundaryPadding + boundaryThickness;
	const vShift = boundaryPadding + boundaryThickness;
	const widthOcclude = boundingRectWidth - hShift;
	const heightOcclude = boundingRectHeight - vShift;
	const dx = hShift + horizontalOffsetBetween1000s;
	const dy = vShift + verticalOffsetBetween1000s;
	for (let i=1, j=1; i<n; i++, j++)
	{
		if (i%5==0)
		{ // extra offset between groups of 5
			x += dx;
			y += dy;
			j = 0;
		}
		else
		{
			x += hShift;
			y += vShift;
		}
		setIntermediateColor(d.ctx, (j%2==0) ? foregroundWeightBoxBoundary : foregroundWeightBoxBoundary2);
		if (d.calculateOnly == false)
			roundedRect(d.ctx, x, y, boundingRectWidth, boundingRectHeight, boxCornerRadius, widthOcclude, heightOcclude);
		d.ctx.strokeStyle = foregroundColor; // restore foreground color
	}
	d.ctx.lineWidth = oldlw; // restore lineWidth
	w = boxWidth + n*hShift;  // width of the drawing
	h = boundingRectHeight + n*vShift; // height of the drawing
	return {w, h};
}

// For that part of romanNumeralsAdditive.text, which contains only
// Roman numerals I, V, X, L, C, align the corresponding tally boxes
// each with its corresponding numeral by calling TextMetrics() on the
// substring which contains all the numerals, for which boxes already
// are drawn in this call to drawTally(), and then by rounding down
// (Math.floor()) the returned width (in pixels) of the substring,
// as opposed to adding up the rounded down width (in pixels) of each
// of these boxes.
// The latter (inferior) method allows the rounding errors to accumulate
// causing each box's position to be a little off (towards the right)
// relative to the position of its corresponding Roman numeral and
// this deviation increases slowly but steadily towards the left
// -- from smaller numerals (on the right) to larger numerals (on the left)
// -- because the rounded down number is never larger, but often smaller,
// than the original.
function drawTally(drwngOnCnv, x0, y) // drwngOnCnv is ref. to object of class DrawingOnCanvas (tally)
{
	let h = 0;
	let w = 0;
	const inputNumberUsed = drwngOnCnv.numberOfTallyMarks;
	if (inputNumberUsed === null)
		inputNumberUsed = inputNumber;
	if (inputNumberUsed < smallestNumberToDisplay || inputNumberUsed === 0)
		return {w, h};
	if (drwngOnCnv.ctx == null)
	{ // fallback in case browser does not support canvas
		if (drwngOnCnv.calculateOnly == false)
			drwngOnCnv.canvas.textContent = "|".repeat(inputNumberUsed); // simplest: write out the tally marks
		return {w, h}; // !!! calculation of w and h NOT programmed yet for this case !!!
	}
	const rna = drwngOnCnv.text;
	if (rna === null)
		rna = romanNumeralsAdditive.get();
	const oldStrokeStyle = drwngOnCnv.ctx.strokeStyle;
	const oldLineWidth = drwngOnCnv.ctx.lineWidth;
	const canvasStyle = getComputedStyle(drwngOnCnv.canvas);
	const foregroundColor = canvasStyle.color;
	drwngOnCnv.ctx.strokeStyle = foregroundColor;
	drwngOnCnv.ctx.lineWidth = tallyMarkThickness;
	let dx, i, c, x;
	let sz = {w, h};
	let pc = null;
	let nDs = 0; // used to calculate the horizontal position x of each component of this drawing
	let nMs = 0; // used to calculate the horizontal position x of each component of this drawing
	let wBox500 = 0; // used to calculate the horizontal position x of each component of this drawing
	let wBox1K = 0; // used to calculate the horizontal position x of each component of this drawing
	let wBox10K = 0; // used to calculate the horizontal position x of each component of this drawing
	let j = rna.length - 1; // used to calculate the horizontal position x of each component of this drawing
	for (i = rna.length - 1; i >= 0; i--)
	{
		c = rna[i];
		if (c != pc)
			dx = Math.floor(stringWidthOnCanvas(drwngOnCnv.ctx, c));
		if (nDs < 1 && nMs < 1)
			j = i;
		x = Math.floor(x0 + stringWidthOnCanvas(drwngOnCnv.ctx, rna.substring(j + 1)) + (nDs * wBox500));
		switch (c)
		{
			case "I": sz = drawTallyMark(drwngOnCnv, x, y, dx); break;
			case "V": sz = drawBox5(drwngOnCnv, x, y, dx); break;
			case "X": sz = drawBox10(drwngOnCnv, x, y, dx); break;
			case "L": sz = drawBox50(drwngOnCnv, x, y, dx); break;
			case "C": sz = drawBox100(drwngOnCnv, x, y, dx); break;
			case "D": sz = drawBox500(drwngOnCnv, x, y, dx); nDs++; /* dx = */ wBox500 = sz.w; break;
			case "M": nMs++; dx = 0; break;
		}
		if (h < sz.h)
			h = sz.h;
		pc = c;
	}
	let r = nMs % 5;
	if (r > 0)
	{
		x = Math.floor(x0 + stringWidthOnCanvas(drwngOnCnv.ctx, rna.substring(j + 1))
			+ (nDs * wBox500));
		sz = drawBox1000(drwngOnCnv, x, y, r);
		box1000horizontalPosition = x;
		wBox1K = sz.w;
	}
	nMs = Math.floor(nMs / 5);
	r = nMs % 2;
	if (r > 0)
	{
		x = Math.floor(x0 + stringWidthOnCanvas(drwngOnCnv.ctx, rna.substring(j + 1))
			+ (nDs * wBox500) + wBox1K);
		sz = drawBox1000(drwngOnCnv, x, y, 10);
		wBox10K = sz.w;
	}
	if (nDs > 0 || nMs > 0)
		j++;
	w = Math.floor(stringWidthOnCanvas(drwngOnCnv.ctx, rna.substring(j))
		+ (nDs * wBox500) + wBox1K + wBox10K);
	drwngOnCnv.ctx.strokeStyle = oldStrokeStyle;
	drwngOnCnv.ctx.lineWidth = oldLineWidth;
	return {w, h};
}

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

function convertRomanNumeralsAdditiveToNumber(rna)
{
	let n = 0;
	let i, c;
	for (i=0; i<rna.length; i++)
	{
		c = rna[i];
		switch (c)
		{
			case "I": n++; break;
			case "V": n += 5; break;
			case "X": n += 10; break;
			case "L": n += 50; break;
			case "C": n += 100; break;
			case "D": n += 500; break;
			case "M": n += 1000; break;
		}
	}
	return n;
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
	const rn = romanNumeralsSubtractive.get(); // romanNumeralsAdditive.get();
	if (rn.length < 1) return "";
	let lastOoMcnctd = 0; // last order of magnitude for which connection was drawn
	let lastOoMcnctdDashed = true; //false;
	let lastOoMcnctdLength = 0;
	let OoMlength = 0;
	let lastStart = 0; // starting position of the last order of magnitude for which connection was drawn
	const h = romanToArabicConnectorCanvas.height;
	const foregroundColor = setIntermediateColor(ctx, foregroundWeightConnector);
	const oldLineWidth = ctx.lineWidth;
	const oldLineDash = ctx.getLineDash();
	const oldLineDashOffset = ctx.lineDashOffset;
	ctx.lineWidth = 1;
	ctx.lineDashOffset = 0;
	let i = rn.length - 1;
	let sr;
	while (i >= 0)
	{
		sr = scanOneOrderOfMagnitude(rn, i);
		if (lastOoMcnctd + 1 < sr.o || sr.n > sr.o + 1)
		{
			OoMlength = sr.end - sr.start + 1;
			if ((lastStart == sr.end + 1) && (OoMlength > 1) && (lastOoMcnctdLength > 1) && (lastOoMcnctdDashed == false))
			{ // if drawing this connector immediately next to one drawn with solid lines,
				ctx.setLineDash([2,2]); // then use dashed lines for this connector 
				setIntermediateColor(ctx, foregroundWeightConnector2); // and increase the contrast slightly
				lastOoMcnctdDashed = true;
			}
			else // otherwise, drawing this connector immediately next to one drawn with dashed lines
			{
				ctx.setLineDash([]); // then use solid lines for this connector
				setIntermediateColor(ctx, foregroundWeightConnector); // and use smaller contrast
				lastOoMcnctdDashed = false;
			}
			connectOrderOfMagnitudeRomanToArabic(ctx, h, sr, rn, an);
			lastOoMcnctd = sr.o;
			lastOoMcnctdLength = OoMlength;
			lastStart = sr.start;
		}
		i = sr.i;
	}
	ctx.strokeStyle = foregroundColor; // restore foreground color etc.
	ctx.lineWidth = oldLineWidth;
	ctx.setLineDash(oldLineDash);
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
	const a = romanNumeralsAdditive.get();
	const s = romanNumeralsSubtractive.get();
	let r = findSubstringPairs(s, "CM", a, "DCCCC"); // scan hundreds than tens then ones
	if (r == null) // in each order of magnitude, treat longer patterns first, e.g. DCCCC before CCCC, LXXXX before XXXX
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
	ctx.lineWidth = 1;
	ctx.lineDashOffset = 0;
	let srs, sra;
	let si = r.i1;
	let ai = r.i2;
	let lastOoMcnctdDashed = false;
	while (si >= 0 && ai >= 0)
	{
		srs = scanOneOrderOfMagnitude(s, si);
		sra = scanOneOrderOfMagnitude(a, ai);
		if (srs.end - srs.start < sra.end - sra.start)
		{
			if ((lastStart == srs.end + 1) && (lastOoMcnctdDashed == false))
			{ // if drawing this connector immediately next to one drawn with solid lines,
				ctx.setLineDash([2,2]); // then use dashed lines for this connector 
				setIntermediateColor(ctx, foregroundWeightConnector2); // and increase the contrast slightly
				lastOoMcnctdDashed = true;
			}
			else // otherwise, drawing this connector immediately next to one drawn with dashed lines
			{
				ctx.setLineDash([]); // then use solid lines for this connector
				setIntermediateColor(ctx, foregroundWeightConnector); // and use smaller contrast
				lastOoMcnctdDashed = false;
			}
			connectOrderOfMagnitudeRomanAdditiveToSubtractive(ctx, h, srs, sra, a, s);
			lastStart = srs.start;
		}
		si = srs.i;
		ai = sra.i;
	}
	ctx.strokeStyle = foregroundColor; // restore foreground color etc.
	ctx.lineWidth = oldLineWidth;
	ctx.setLineDash(oldLineDash);
	ctx.lineDashOffset = oldLineDashOffset;
}

function connectRomanToTally() // draw connecting lines (and horizontal braces) where needed
{
	if (romanToTallyConnectorCanvas.getContext == null)
		return;
	const rn = romanNumeralsAdditive.get();
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
	if (start < 0) return; // no Ms so no connections to draw here
	const ctx = romanToTallyConnectorCanvas.getContext("2d");
	const nPastEnd = rn.length - 1 - end;
	const fromX1 = (0<nPastEnd) ? stringWidthOnCanvas(ctx, rn.substring(end+1)) : 0;
	const lessOrEqX1 = fpLessEq(box1000horizontalPosition-horizontalOffset, fromX1, fpTolerance);
	if (lessOrEqX1) return; // box1000 is directly under the Ms so no connections to draw here
	let fromY = verticalOffset;
	const fromX2 = stringWidthOnCanvas(ctx, rn.substring(start));
	const fromXm = 0.5 * (fromX1 + fromX2);
	const rFromXm = romanToTallyConnectorCanvas.width - fromXm - horizontalOffset;
	const rFromX2 = romanToTallyConnectorCanvas.width - fromX2 - horizontalOffset;
	const toY = romanToTallyConnectorCanvas.height;
	const rToX = romanToTallyConnectorCanvas.width - box1000horizontalPosition - horizontalOffset;
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
		fromY += braceArcRadius;
		const lessOrEqX2 = fpLessEq(box1000horizontalPosition+boxCornerRadius, fromX2-braceArcRadius, fpTolerance);
		rFromX = lessOrEqX2 ? (rToX - boxCornerRadius) : (rFromX2 + braceArcRadius);
	} else rFromX = rFromXm;
	drawConnectingLine(ctx, rFromX, fromY, rToX - boxCornerRadius, toY, bLen, eLen);
	ctx.strokeStyle = foregroundColor; // restore foreground color etc.
	ctx.lineWidth = oldLineWidth;
	ctx.lineDashOffset = oldLineDashOffset;
}

function incrementButtonMouseoverListener() {incrementButton.style.backgroundColor = buttonHoverBgColor;}
function decrementButtonMouseoverListener() {decrementButton.style.backgroundColor = buttonHoverBgColor;}
function incrementButtonMouseoutListener() {incrementButton.style.backgroundColor = buttonNormalBgColor;}
function decrementButtonMouseoutListener() {decrementButton.style.backgroundColor = buttonNormalBgColor;}

function disableButtons(incrementButtonPressed)
{
	incrementOrDecrementExecuting = true;
	const incBtnAlrdyDsbld = incrementButton.disabled;
	const decBtnAlrdyDsbld = decrementButton.disabled;
	incrementButton.disabled = true;
	decrementButton.disabled = true;
	if (!incBtnAlrdyDsbld)
	{
		incrementButton.style.backgroundColor = buttonNormalBgColor; // needed to reverse the effect of incrementButtonMouseoverListener()
		incrementButton.style.color = incrementButton.style.borderColor = buttonDisabledColor;
		if (incrementButtonPressed)
			incrementButton.style.fontWeight = "bold";
	}
	if (!decBtnAlrdyDsbld)
	{
		decrementButton.style.backgroundColor = buttonNormalBgColor; // needed to reverse the effect of decrementButtonMouseoverListener()
		decrementButton.style.color = decrementButton.style.borderColor = buttonDisabledColor;
		if (!incrementButtonPressed)
			decrementButton.style.fontWeight = "bold";
	}
	incrementButton.removeEventListener('mouseover', incrementButtonMouseoverListener);
	incrementButton.removeEventListener('mouseout', incrementButtonMouseoutListener);
	decrementButton.removeEventListener('mouseover', decrementButtonMouseoverListener);
	decrementButton.removeEventListener('mouseout', decrementButtonMouseoutListener);
	document.body.style.cursor = 'progress';
	incrementButton.style.cursor = 'progress';
	decrementButton.style.cursor = 'progress';
	arabicNumeralsElement.style.cursor = 'progress';
	romanToArabicConnectorCanvas.style.cursor = 'progress';
	romanNumeralsAdditive.canvas.style.cursor = 'progress';
	romanNumeralsSubtractive.canvas.style.cursor = 'progress';
	romanAdditiveToSubtractiveConnectorCanvas.style.cursor = 'progress';
	romanToTallyConnectorCanvas.style.cursor = 'progress';
	tally.canvas.style.cursor = 'progress';
	incrementButton.removeAttribute("title");
	decrementButton.removeAttribute("title");
}

function enableButtons()
{
	const notTooLarge = (inputNumber < largestNumberToDisplay);
	incrementButton.disabled = !notTooLarge;
	incrementButton.style.backgroundColor = buttonNormalBgColor; // needed to reverse the effect of incrementButtonMouseoverListener()
	incrementButton.style.color = incrementButton.style.borderColor = notTooLarge ? buttonNormalColor : buttonDisabledColor;
	incrementButton.style.fontWeight = "normal";
	incrementButton.style.cursor = 'default';
	incrementButton.setAttribute("title", notTooLarge ? "click to increment number" : "");
	if (notTooLarge)
	{
		incrementButton.addEventListener('mouseover', incrementButtonMouseoverListener);
		incrementButton.addEventListener('mouseout', incrementButtonMouseoutListener);
	}
	else
	{
		incrementButton.removeEventListener('mouseover', incrementButtonMouseoverListener);
		incrementButton.removeEventListener('mouseout', incrementButtonMouseoutListener);
	}
	const notTooSmall = (inputNumber > smallestNumberToDisplay);
	decrementButton.disabled = !notTooSmall;
	decrementButton.style.backgroundColor = buttonNormalBgColor; // needed to reverse the effect of decrementButtonMouseoverListener()
	decrementButton.style.color = decrementButton.style.borderColor = notTooSmall ? buttonNormalColor : buttonDisabledColor;
	decrementButton.style.fontWeight = "normal";
	decrementButton.style.cursor = 'default';
	decrementButton.setAttribute("title", notTooSmall ? "click to decrement number" : "");
	if (notTooSmall)
	{
		decrementButton.addEventListener('mouseover', decrementButtonMouseoverListener);
		decrementButton.addEventListener('mouseout', decrementButtonMouseoutListener);
	}
	else
	{
		decrementButton.removeEventListener('mouseover', decrementButtonMouseoverListener);
		decrementButton.removeEventListener('mouseout', decrementButtonMouseoutListener);
	}
	document.body.style.cursor = 'default';
	arabicNumeralsElement.style.cursor = 'default';
	romanToArabicConnectorCanvas.style.cursor = 'default';
	romanNumeralsAdditive.canvas.style.cursor = 'default';
	romanNumeralsSubtractive.canvas.style.cursor = 'default';
	romanAdditiveToSubtractiveConnectorCanvas.style.cursor = 'default';
	romanToTallyConnectorCanvas.style.cursor = 'default';
	tally.canvas.style.cursor = 'default';
	incrementOrDecrementExecuting = false;
}

class SlideGraphics //used to make space before inserting (fading in) a tally mark or, alternatively, as the last stage of animations of metamorphoses of some numerals (and tallies) into others, e.g. IIIII->V, VV->X
{// b/c such a metamorphosis leaves gaps in the entire numerical expression, e.g. XXIIIII -> XX  V
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	leftText = null; // constant
	rightText = null; // constant
	textOnly = true; // true iff fcnLeftDrawing===null
	fcnLeftDrawing = null; // ref. to function used to draw the left graphic
	fcnRightDrawing = null; // ref. to function used to draw the right graphic
	xr = 0; // updated horizontal position (in pixels) of right graphic
	wr = 0; // width (in pixels) of the right graphic
	xRi = 0; // initial horizontal position (in pixels) of right graphic
	xRf = 0; // final horizontal position (in pixels) of right graphic
	xLi = 0; // initial horizontal position (in pixels) of left graphic
	xLf = 0; // final horizontal position (in pixels) of left graphic
	xl = 0; // updated horizontal position (in pixels) of left graphic
	wl = 0; // width (in pixels) of the left graphic
	vxl = 0; // (px/msec) how fast to move xl towards xLf
	vxr = 0; // (px/msec) how fast to move xr towards xRf
	lStationary = true; // iff vxl == 0
	rStationary = true; // iff vxr == 0
	vlNeg = false; // iff vxl < 0
	vlPos = false; // iff vxl > 0
	vrNeg = false; // iff vxr < 0
	vrPos = false; // iff vxr > 0
	xlClear = 0; // horizontal position (in pixels) of the part of canvas to be cleared before redrawing the left graphic
	wlClear = 0; // width (in pixels) of the part of canvas to be cleared before redrawing the left graphic
	xrClear = 0; // horizontal position (in pixels) of the part of canvas to be cleared before redrawing the right graphic
	wrClear = 0; // width (in pixels) of the part of canvas to be cleared before redrawing the right graphic
	t = 0; // (msec) time of last update
	verticalPosition = 0; // vertical position of all the text treated by this class
	finished = true; // used to implement this.done()
	justFinished = false; // used to implement this.recent()
	constructor(m, s)
	{
		this.cnv = m.cnv;
		this.ctx = m.ctx;
		this.rightText = s;
		this.drawingOnCanvas = m.drawingOnCanvas;
	}
	setDrawings(lf, rf)
	{
		this.fcnLeftDrawing = lf;
		if (typeof rf !== 'undefined')
			this.fcnRightDrawing = rf;
		this.textOnly = false;
	}
	start(lText, lData, rData)
	{
		this.finished = true;
		this.justFinished = false;
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.finished = false;
		this.leftText = lText;
		this.xl = this.xLi = lData.xi; // xi is already adjusted according to this.drawingOnCanvas.flipHorizontalAxis
		this.xLf = lData.xf; // this instance is used to move only this.leftText
		this.verticalPosition = lData.y;
		this.wl = lData.w;
		if (rData != null)
		{ // move both this.leftText and this.rightText
			this.xr = this.xRi = rData.xi;
			this.xRf = rData.xf;
			this.wr = rData.w;
		}
		this.vxl = AnimationSpeedClosingTheGaps * (this.xLf - this.xLi);
		this.lStationary = (this.leftText===null) ||
			(this.leftText==="") || fpEqual(this.vxl, 0, fpTolerance);
		this.vlPos = fpLess(0, this.vxl, fpTolerance);
		this.vlNeg = fpLess(this.vxl, 0, fpTolerance);
		this.vxr = (this.rightText===null) ? 0 : (AnimationSpeedClosingTheGaps * (this.xRf - this.xRi));
		this.rStationary = (this.rightText===null) ||
			(this.rightText==="") || fpEqual(this.vxr, 0, fpTolerance);
		this.vrPos = fpLess(0, this.vxr, fpTolerance);
		this.vrNeg = fpLess(this.vxr, 0, fpTolerance);
		this.xlClear = lData.xi; // fpMin(this.xLi, this.xLf, fpTolerance);
		this.xlClear = fpLimitToInterval(this.xlClear, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
		this.wlClear = this.wl + 2; // add 2 otherwise upper-right corner of V is not erased (thus leaves a streak) when sliding
		this.wlClear = fpLimitToInterval(this.wlClear, 0, this.cnv.width - this.xlClear, fpTolerance); // prevent from exceeding available canvas width and from being negative
		if (rData != null)
		{
			this.xrClear = rData.xi; //fpMin(this.xRi, this.xRf, fpTolerance);
			this.xrClear = fpLimitToInterval(this.xrClear, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
			this.wrClear = this.wr + 2; // add 2 otherwise upper-right corner of V is not erased (thus leaves a streak) when sliding
			this.wrClear = fpLimitToInterval(this.wrClear, 0, this.cnv.width - this.xrClear, fpTolerance); // prevent from exceeding available canvas width and from being negative
		}
		this.t = Date.now();
	}
	done() // true iff finished this particular stage of the animation
	{
		if (this.finished)
			return true;
		this.finished =
			((this.lStationary || fpEqual(this.xl, this.xLf, fpTolerance)) &&
			(this.rStationary || fpEqual(this.xr, this.xRf, fpTolerance)));
		if (this.finished)
			this.justFinished = true;
		return this.finished;
	}
	recent() // returns true iff the most recent call to this.done() has returned true but...
	{ //...the call to this.done immediately prior to the most recent call to this.done()...
		if (this.justFinished==false) //...has returned false
			return false;
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
				this.xr = fpMin(u, this.xRf, fpTolerance); // prevent xr from surpassing xRf (i.e. moving off canvas)
			} else if (this.vrNeg) {
				this.xr = fpMax(this.xRf, u, fpTolerance); // prevent xr from surpassing xRf
			}
		}
		if (this.lStationary == false)
		{
			u = this.xl + (this.vxl)*dt;
			if (this.vlPos)
			{
				const xlLim = (this.xr > this.wl) ? this.xr - this.wl : this.xLf;
				if (fpLessEq(u, xlLim, fpTolerance)) // prevent xl+wl from surpassing xr (i.e. this.leftText running onto this.rightText)
					this.xl = u;
				else if (fpLess(this.xl, xlLim, fpTolerance)) // prevent this.xl from being set back
					this.xl = xlLim;
			} else if (this.vlNeg) {
					this.xl = fpMax(this.xLf, u, fpTolerance); // prevent xl from surpassing xLf
			}
		}
		this.t = t1;
	}
	draw()
	{
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		if (this.leftText !== null)
			this.ctx.clearRect(this.xlClear, -0.5, this.wlClear, this.cnv.height);
		if (this.rightText !== null)
			this.ctx.clearRect(this.xrClear, -0.5, this.wrClear, this.cnv.height);
		const oldNumberOfTallyMarks = this.drawingOnCanvas.numberOfTallyMarks;
		const oldText = this.drawingOnCanvas.text;
		if (this.leftText !== null)
		{
			if (this.fcnLeftDrawing !== null)
			{
				this.drawingOnCanvas.numberOfTallyMarks = convertRomanNumeralsAdditiveToNumber(this.leftText);
				this.drawingOnCanvas.text = this.leftText;
				this.drawingOnCanvas.draw(this.fcnLeftDrawing, this.xl, this.verticalPosition);
			}
			else
			{
				this.drawingOnCanvas.horizontalPosition = this.xl;
				this.ctx.fillText(this.leftText, this.xl, this.verticalPosition);
			}
			this.xlClear = this.xl - 1; // subtracting 1 remedies failure to erase rightmost edge while sliding
		}
		if (this.rightText !== null)
		{
			if (this.fcnRightDrawing !== null)
			{
				this.drawingOnCanvas.numberOfTallyMarks = convertRomanNumeralsAdditiveToNumber(this.rightText);
				this.drawingOnCanvas.text = this.rightText;
				this.drawingOnCanvas.draw(this.fcnRightDrawing, this.xr, this.verticalPosition);
			}
			else
				this.ctx.fillText(this.rightText, this.xr, this.verticalPosition);
			this.xrClear = this.xr - 2; // subtracting 2 remedies failure to erase top-left corner of V while sliding to the right
		}
		this.drawingOnCanvas.numberOfTallyMarks = oldNumberOfTallyMarks;
		this.drawingOnCanvas.text = oldText;
		this.xlClear = fpLimitToInterval(this.xlClear, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
		this.xrClear = fpLimitToInterval(this.xrClear, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
	}
}

class MergeVerticallyTwoHorizontallyAdjacentBoxes //i.e. stack 2 boxes of...
{//...5 and merge them into 1 box of 10, analogous to class MetamorphoseVVtoX
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	initialText = "VV"; // Roman-numeral equivalent of the 2 initial graphics
	finalText = "X"; // Roman-numeral equivalent of the final graphic
	initialNumber = 0; // numerical equivalent of initialText[0]
	finalNumber = 0; // numerical equivalent of finalText
	fcnDrawing = null; // ref. to function used to draw each of the 2 part of the initial graphic
	w1 = 0; // width (in pixels) of each of the 2 parts of the initial graphic
	wi = 0; // width (in pixels) of entire initial graphic (both parts together)
	wf = 0; // width (in pixels) of the final graphic
	hi = 0; // height (in pixels) of the initial graphic
	hf = 0; // height (in pixels) of the final graphic
	xr = 0; // horizontal position (in pixels) of the right part of the initial graphic
	yr = 0; // vertical position of the right part of the initial graphic
	xLi = 0; // initial horizontal position (in pixels) of the left part of the initial graphic
	xLf = 0; // final horizontal position (in pixels) of the left part of the initial graphic
	xl = 0; // updated horizontal position (in pixels) of the left part of the initial graphic
	yLi = 0; // initial vertical position (in pixels) of the left part of the initial graphic
	yLf = 0; // final vertical position (in pixels) of the left part of the initial graphic
	yl = 0; // updated vertical position (in pixels) of the left part of the initial graphic
	moveDown = true; // true iff updating yl, false iff updating xl
	v = 0; // (px/msec) how fast to move yl from yLi towards yLf and then xl from xLi towards xLf
	xClear = 0; // horizontal position (in pixels) of the part of the canvas to be cleared before redrawing the left graphic
	yClear = 0; // vertical position (in pixels) of the part of the canvas to be cleared in each call to this.draw()
	wClear = 0; // width (in pixels) of the part of the canvas to be cleared before redrawing the left graphic
	hClear = 0; // height (in pixels) of the part of the canvas to be cleared in each call to this.draw()
	t = 0; // (msec) time of last update
	finished = true; // used to implement this.done()
	justFinished = false; // used to implement this.recent()
	xInitial() {return this.xr;}
	wInitial() {return this.wi;}
	wFinal() {return this.wf;}
	xFinal() {return this.xr;}
	constructor(d, iTxt, fTxt, f)
	{
		if (d === null)
			return;
		this.drawingOnCanvas = d;
		this.cnv = this.drawingOnCanvas.canvas;
		if (this.cnv.getContext !== null) // otherwise, browser does not support canvas
			this.ctx = this.cnv.getContext("2d");
		this.initialText = iTxt;
		this.finalText = fTxt;
		this.fcnDrawing = f;
		if (this.initialText !== null)
			this.initialNumber = convertRomanNumeralsAdditiveToNumber(this.initialText[0]);
		if (this.finalText !== null)
			this.finalNumber = convertRomanNumeralsAdditiveToNumber(this.finalText);
	}
	computeGraphicsSizes()
	{
		const oldText = this.drawingOnCanvas.text;
		const oldNumberOfTallyMarks = this.drawingOnCanvas.numberOfTallyMarks;
		this.drawingOnCanvas.calculateOnly = true;
		this.drawingOnCanvas.text = this.initialText[0];
		this.drawingOnCanvas.numberOfTallyMarks = this.initialNumber;
		let sz = this.fcnDrawing(this.drawingOnCanvas, horizontalOffset, verticalOffset);
		this.w1 = sz.w;
		this.hi = sz.h;
		this.drawingOnCanvas.text = this.initialText; // calculate width of entire initial graphic (both parts together)
		this.drawingOnCanvas.numberOfTallyMarks = this.finalNumber;
		sz = this.fcnDrawing(this.drawingOnCanvas, horizontalOffset, verticalOffset);
		this.wi = sz.w;
		this.hi = sz.h;
		this.drawingOnCanvas.text = this.finalText; // calculate width of the final graphic
		this.drawingOnCanvas.numberOfTallyMarks = this.finalNumber;
		sz = this.fcnDrawing(this.drawingOnCanvas, horizontalOffset, verticalOffset);
		this.wf = sz.w;
		this.hf = sz.h;
		this.drawingOnCanvas.text = oldText;
		this.drawingOnCanvas.numberOfTallyMarks = oldNumberOfTallyMarks;
		this.drawingOnCanvas.calculateOnly = false;
	}
	start()
	{
		this.finished = true;
		this.justFinished = false;
		this.moveDown = true;
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.finished = false;
		this.computeGraphicsSizes();
		this.xr = horizontalOffset;
		this.yr = verticalOffset;
		this.xLi = horizontalOffset + this.w1;
		this.xLf = horizontalOffset;
		this.yLi = verticalOffset;
		this.yLf = verticalOffset + this.hf - this.hi;
		this.xl = this.xLi;
		this.yl = this.yLi;
		const d = this.xLi - this.xLf + this.yLf - this.yLi; // total distance to travel
		this.v = AnimationSpeedMetamorphosis * d;
		this.xClear = this.xl - 1; // subtracting 1 remedies failure to erase right edge of box while sliding it down
		this.xClear = fpLimitToInterval(this.xClear, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
		this.yClear = this.yl - 1; // subtracting 1 remedies failure to erase top edge of box while sliding it down
		this.yClear = fpLimitToInterval(this.yClear, 0, this.cnv.height, fpTolerance); // prevent from exceeding canvas width and from being negative
		this.wClear = this.w1;
		this.wClear = fpLimitToInterval(this.wClear, 0, this.cnv.width - this.xClear, fpTolerance); // prevent from exceeding available canvas width and from being negative
		this.hClear = this.hi + 1; // adding 1 offsets subtraction of 1 from yClear, otherwise bottom edge of box is not erased while sliding it to the right
		this.hClear = fpLimitToInterval(this.hClear, 0, this.cnv.height - this.yClear, fpTolerance); // prevent from exceeding available canvas height and from being negative
		this.t = Date.now();
	}
	done() // true iff finished this particular stage of the animation
	{
		if (this.finished)
			return true;
		if (this.moveDown)
		{
			if (fpEqual(this.yl, this.yLf, fpTolerance))
				this.moveDown = false;
			return false;
		}
		this.finished = fpEqual(this.xl, this.xLf, fpTolerance);
		if (this.finished)
			this.justFinished = true;
		return this.finished;
	}
	recent() // returns true iff the most recent call to this.done() has returned true but...
	{//...the call to this.done immediately prior to the most recent call to this.done()...
		if (this.justFinished==false) //...has returned false
			return false;
		this.justFinished = false;
		return true;
	}
	proceed()
	{
		if (this.finished) return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u;
		if (this.moveDown)
		{
			u = this.yl  + (this.v)*dt;
			this.yl = fpMin(u, this.yLf, fpTolerance); // prevent yl from surpassing yLf
		}
		else
		{
			u = this.xl - (this.v)*dt;
			this.xl = fpMax(u, this.xLf, fpTolerance); // prevent xl from surpassing xLf
		}
		this.t = t1;
	}
	draw()
	{
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		if (this.fcnDrawing === null)
			return;
		this.ctx.clearRect(this.xClear, this.yClear, this.wClear, this.hClear);
		const oldNumberOfTallyMarks = this.drawingOnCanvas.numberOfTallyMarks;
		const oldText = this.drawingOnCanvas.text;
		this.drawingOnCanvas.text = this.initialText[0];
		this.drawingOnCanvas.numberOfTallyMarks = this.initialNumber;
		this.drawingOnCanvas.draw(this.fcnDrawing, this.xl, this.yl);
		this.xClear = this.xl - 1; // subtracting 1 remedies failure to erase right edge of box while sliding it down
		this.yClear = this.yl - 1; // subtracting 1 remedies failure to erase top edge of box while sliding it down
		this.drawingOnCanvas.numberOfTallyMarks = oldNumberOfTallyMarks;
		this.drawingOnCanvas.text = oldText;
		this.xClear = fpLimitToInterval(this.xClear, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
		this.yClear = fpLimitToInterval(this.yClear, 0, this.cnv.height, fpTolerance); // prevent from exceeding canvas height and from being negative
	}
}

class ShrinkAndRotateIIIII // the 1st stage of animations of metamorphosis of ||||| -> [box of 5]
{// (the 2nd stage is sliding all the drawings to the right in order to have no empty spaces on the right or in the middle)
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	initialText = "IIIII"; // (constant) to help identify this class in other code
	finalText = "V"; // (constant) to help identify this class in other code
	initialNumber = 0; // numerical equivalent of initialText
	finalNumber = 0; // numerical equivalent of finalText
	fcnInitialDrawing = null; // ref. to function used to draw the graphic corresponding to initialText
	fcnFinalDrawing = null; // ref. to function used to draw the graphic corresponding to finalText
	wi = 0; // width (in pixels) on canvas of initial drawing
	wf = 0; // width (in pixels) on canvas of shrunk (if not rotated) drawing (without any border)
	wff = 0; // width (in pixels) on canvas of final drawing (including the border)
	hi = 0; // height (in pixels) on canvas of initial drawing
	hf = 0; // height (in pixels) on canvas of shrunk (if not rotated) drawing (without any border)
	hff = 0; // height (in pixels) on canvas of final drawing (including the border)
	hwi = 0; // half of width (in pixels) on canvas of initial drawing
	hhi = 0; // half of height (in pixels) on canvas of final drawing
	xi = 0; // initial horizontal position of the right side of initial drawing
	yi = 0; // initial vertical position of the top side of initial drawing
	xf = 0; // final horizontal position of the right side of final drawing
	yf = 0; // final vertical position of the top side of final drawing
	xc = 0; // horizontal position of center of initial drawing (same for final drawing)
	yc = 0; // vertical position of center of initial drawing (same for final drawing)
	scaleXi = 1.0; // (constant) horizontal scale of the initial drawing
	scaleXf = 0; // scale of the final drawing = (final width) / (initial width)
	vScaleX = 0; // how fast to move scaleX towards scaleXf (calculated from scaleXf, scaleXi and AnimationSpeedMetamorphosis)
	scaleX = 0; // current value (starts = scaleXi and decreases to scaleXf)
	scaleYi = 1.0; // (constant) vertical scale of the initial drawing
	scaleYf = 0; // scale of the final drawing = (final height) / (initial height)
	vScaleY = 0; // how fast to move scaleX towards scaleXf (calculated from scaleXf, scaleXi and AnimationSpeedMetamorphosis)
	scaleY = 0; // current value (starts = scaleYi and decreases to scaleYf)
	angleI = 0; // (constant) orientation of the initial drawing
	angleF = 0.5*Math.PI; // (constant) orientation of the final drawing
	vAngle = 0; // how fast to move angle towards angleF (calculated from angleF, angleI and AnimationSpeedMetamorphosis)
	angle = 0; // (of the left V) current value (starts = angleI and decreases to angleF)
	xClear = 0; // horizontal position (in pixels) of the part of the canvas to be cleared in each call to this.draw()
	yClear = 0; // vertical position (in pixels) of the part of the canvas to be cleared in each call to this.draw()
	wClear = 0; // width (in pixels) of the part of the canvas to be cleared in each call to this.draw()
	hClear = 0; // height (in pixels) of the part of the canvas to be cleared in each call to this.draw()
	t = 0; // (msec) time of last update
	finished = true; // iff finished the metamorphosis of intialText into finalText
	justFinished = false; // used to implement this.recent()
	xInitial() {return this.xi;}
	xFinal() {return this.xf;}
	wInitial() {return this.wi;}
	wFinal() {return this.wff;}
	yFinal() {return this.yf;}
	constructor(d, fdi, fdf) // d must be ref. to DrawingOnCanvas object: tally
	{// fdi and fdf must be ref-s to functions (drawTally() and drawBox5()) to draw on the canvas
		if (d === null)
			return;
		this.drawingOnCanvas = d;
		this.fcnInitialDrawing = fdi;
		this.fcnFinalDrawing = fdf;
		this.cnv = this.drawingOnCanvas.canvas;
		if (this.cnv.getContext !== null) // otherwise, browser does not support canvas
			this.ctx = this.cnv.getContext("2d");
		this.initialNumber = convertRomanNumeralsAdditiveToNumber(this.initialText);
		this.finalNumber = convertRomanNumeralsAdditiveToNumber(this.finalText);
	}
	computeGraphicsSizes()
	{
		const oldText = this.drawingOnCanvas.text;
		const oldNumberOfTallyMarks = this.drawingOnCanvas.numberOfTallyMarks;
		this.drawingOnCanvas.calculateOnly = true;
		this.drawingOnCanvas.text = this.initialText;
		this.drawingOnCanvas.numberOfTallyMarks = this.initialNumber
		let sz = this.fcnInitialDrawing(this.drawingOnCanvas, horizontalOffset, verticalOffset);
		this.wi = sz.w;
		this.hi = sz.h;
		this.drawingOnCanvas.text = this.finalText;
		this.drawingOnCanvas.numberOfTallyMarks = this.finalNumber
		sz = this.fcnFinalDrawing(this.drawingOnCanvas, horizontalOffset, verticalOffset);
		this.wff = sz.w;
		this.hff = sz.h;
		this.wf = sz.ih; // width of shrunk (if not rotated) IIIII == height of column of 5 horizontal lines
		this.hf = sz.iw; // height of shrunk (if not rotated) IIIII == width of column of 5 horizontal lines
		this.drawingOnCanvas.text = oldText;
		this.drawingOnCanvas.numberOfTallyMarks = oldNumberOfTallyMarks;
		this.drawingOnCanvas.calculateOnly = false;
	}
	start()
	{
		this.finished = true;
		this.justFinished = false;
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.finished = false;
		this.xi = horizontalOffset;
		this.yi = verticalOffset;
		if (this.drawingOnCanvas.flipHorizontalAxis == false)
			this.xi = this.cnv.width - this.xi;
		this.computeGraphicsSizes();
		this.hhi = 0.5 * this.hi;
		this.hwi = 0.5 * this.wi;
		this.xc = this.xi + this.hwi;
		this.yc = this.yi + this.hhi;
		this.xf = this.xc - (0.5 * this.wff);
		this.yf = this.yc - (0.5 * this.hff);
		if (fpLess(0, this.wi, fpTolerance))
			this.scaleXf = 1.23*(this.wf / this.wi); // the increase factor, determined by trial and error, is a hack to remedy excessive shrinking of the drawing
		if (fpLess(0, this.hi, fpTolerance))
			this.scaleYf = 1.1*(this.hf / this.hi); // the increase factor, determined by trial and error, is a hack to remedy excessive shrinking of the drawing
		this.scaleX = this.scaleXi;
		this.vScaleX = 1.5*AnimationSpeedMetamorphosis*(this.scaleXf - this.scaleXi); // speed up the shrinking in order to avoid drawing parts of the five tally marks outside the part of the canvas which initially displays them
		this.scaleY = this.scaleYi;
		this.vScaleY = 1.5*AnimationSpeedMetamorphosis*(this.scaleYf - this.scaleYi); // speed up the shrinking in order to avoid drawing parts of the five tally marks outside the part of the canvas which initially displays them
		this.angle = this.angleI;
		this.vAngle = AnimationSpeedMetamorphosis*(this.angleF - this.angleI);
		this.xClear = this.xi - 1; // subtracting 1 remedies (hack) failure to erase the rightmost tally mark on each redrawing towards the end of this animation, thus leaving the rightmost tallymark larger than the rest
		this.yClear = this.yi - 2; // subtracting 2 remedies (hack) failure to erase the upper ends of tally marks on each redrawing which leaves a streak
		this.wClear = this.wi;
		this.hClear = this.wi; // using wi instead of hi is a hack which remedies the failure to erase the lower ends of tally marks on each redrawing which leaves a streak
		this.t = Date.now();
	}
	done()
	{
		if (this.finished)
			return true;
		this.finished =
			(fpEqual(this.angle, this.angleF, fpTolerance) &&
			fpEqual(this.scaleX, this.scaleXf, fpTolerance) &&
			fpEqual(this.scaleY, this.scaleYf, fpTolerance));
		if (this.finished)
			this.justFinished = true;
		return this.finished;
	}
	recent() // returns true iff the most recent call to this.done() has returned true but...
	{ //...the call to this.done immediately prior to the most recent call to this.done()...
		if (this.justFinished==false) //...has returned false
			return false;
		this.justFinished = false;
		return true;
	}
	proceed()
	{
		if (this.finished)
			return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u = this.scaleX + (this.vScaleX)*dt;
		this.scaleX = fpMax(u, this.scaleXf, fpTolerance); // prevent scaleX from surpassing scaleXf
		u = this.scaleY + (this.vScaleY)*dt;
		this.scaleY = fpMax(u, this.scaleYf, fpTolerance); // prevent scaleY from surpassing scaleYf
		u = this.angle + (this.vAngle)*dt;
		this.angle = fpMin(u, this.angleF, fpTolerance); // prevent angle from surpassing angleF
		this.t = t1;
	}
	draw()
	{
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.ctx.clearRect(this.xClear, this.yClear, this.wClear, this.hClear);
		this.ctx.save(); // to reverse, using restore(), the following transformations after drawing the graphic
		this.ctx.translate(this.xc, this.yc);
		this.ctx.rotate(-this.angle);
		this.ctx.scale(this.scaleX, this.scaleY);
		this.ctx.translate(-this.hwi, -this.hhi);
		const oldText = this.drawingOnCanvas.text;
		const oldNumberOfTallyMarks = this.drawingOnCanvas.numberOfTallyMarks;
		this.drawingOnCanvas.text = this.initialText;
		this.drawingOnCanvas.numberOfTallyMarks = this.initialNumber;
		if (this.fcnInitialDrawing !== null)
			this.drawingOnCanvas.draw(this.fcnInitialDrawing, 0, 0);
		this.drawingOnCanvas.text = oldText;
		this.drawingOnCanvas.numberOfTallyMarks = oldNumberOfTallyMarks;
		this.ctx.restore();
	}
}

class MetamorphoseIIIIItoV //1st stage of animations of metamorphosis of IIIII->V
{//(but for tally drawings, instead use class ShrinkAndRotateIIIII)
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	initialText = "IIIII"; // (constant) to metamorphose into finalText
	finalText = "V"; // constant
	wi = 0; // width (in pixels) on canvas of initialText
	wf = 0; // width (in pixels) on canvas of finalText
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
	verticalPosition = 0; // vertical position of all the text treated by this class
	finished = true; // iff finished the metamorphosis of intialText into finalText
	justFinished = false; // used to implement this.recent()
	constructor(d)
	{ // d must be ref. to DrawingOnCanvas object: either romanNumeralsAdditive or romanNumeralsSubtractive
		if (d === null)
			return;
		this.drawingOnCanvas = d;
		this.cnv = this.drawingOnCanvas.canvas;
		if (this.cnv.getContext !== null) // otherwise, browser does not support canvas
			this.ctx = this.cnv.getContext("2d");
	}
	xInitial() {return this.x0i;}
	xFinal() {return this.xf;}
	wInitial() {return this.wi;}
	wFinal() {return this.wf;}
	computeGraphicsSizes() // called in this.start()
	{ // useless to compute this in this.constructor() b/c no guarantee that the HTML canvas is properly set up before this.constructor() is called
		if (this.ctx === null)
			return; // browser does not support canvas
		let metrics = this.ctx.measureText(this.initialText);
		if (metrics !== null)
		{
			if (fpLess(0, metrics.width, fpTolerance))
				this.wi = metrics.width;
			if (fpLess(0, metrics.actualBoundingBoxAscent, fpTolerance))
				this.verticalPosition = metrics.actualBoundingBoxAscent;
		}
		metrics = this.ctx.measureText(this.finalText);
		if ((metrics !== null) && fpLess(0, metrics.width, fpTolerance))
			this.wf = metrics.width;
	}
	start()
	{
		this.finished = true;
		this.justFinished = false;
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.finished = false;
		this.computeGraphicsSizes();
		this.x0i = this.x0 = horizontalOffset + this.wi;
		let metrics = this.ctx.measureText(this.initialText.substring(1));
		if ((metrics !== null) && fpLess(0, metrics.width, fpTolerance))
			this.x1 = horizontalOffset + metrics.width;
		metrics = this.ctx.measureText(this.initialText.substring(2));
		if ((metrics !== null) && fpLess(0, metrics.width, fpTolerance))
			this.x2 = horizontalOffset + metrics.width;
		metrics = this.ctx.measureText(this.initialText.substring(3));
		if ((metrics !== null) && fpLess(0, metrics.width, fpTolerance))
			this.x3 = horizontalOffset + metrics.width;
		metrics = this.ctx.measureText(this.initialText.substring(4));
		if ((metrics !== null) && fpLess(0, metrics.width, fpTolerance))
			this.x4 = horizontalOffset + metrics.width;
		if (this.drawingOnCanvas.flipHorizontalAxis == false)
		{
			this.x0i = this.cnv.width - this.x0i;
			this.x0 = this.cnv.width - this.x0;
			this.x1 = this.cnv.width - this.x1;
			this.x2 = this.cnv.width - this.x2;
			this.x3 = this.cnv.width - this.x3;
			this.x4 = this.cnv.width - this.x4;
		}
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
		if (this.finished)
			return true;
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
		if (this.finished)
			return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u = this.x1 + (this.vx1)*dt;
		this.x1 = fpMin(u, this.xf, fpTolerance); // prevent x1 from surpassing xf
		//u = this.x2 + (this.vx2)*dt; // here x2 stays still
		//this.x2 = fpLessEq(this.x1, u, fpTolerance) ? u : this.x1;
 		u = this.x3 + (this.vx3)*dt;
		this.x3 = fpMax(this.xf, u, fpTolerance); // prevent x3 from surpassing xf
		u = this.x0 + (this.vx0)*dt;
		this.x0 = fpMin(u, this.x1, fpTolerance); // prevent x0 from surpassing x1
		u = this.x4 + (this.vx4)*dt;
		this.x4 = fpMax(this.x3, u, fpTolerance); // prevent x4 from surpassing x3
		u = this.skew + (this.vSkew)*dt;
		this.skew = fpMin(u, this.skewF, fpTolerance); // prevent skew from surpassing skewF
		this.t = t1;
	}
	draw()
	{
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.ctx.clearRect(this.xInitial(), -0.5, this.wInitial(), this.cnv.height);
		this.ctx.save(); // to reverse the transform(), using restore(), after drawing at (x0,verticalPosition), before doing the same for the next position
		this.ctx.transform(1, 0, this.skew, 1, this.x0, this.verticalPosition); // translate the axes to (x0,verticalPosition) and skew leftwards
		this.ctx.fillText(this.initialText[0], 0, 0);
		this.ctx.restore();
		this.ctx.save(); // use transform()n rather than setTransform() b/c setTransform() discards useful transforms applied earlier often causing letters drawn by this method to be not perfectly aligned with each other vertically
		this.ctx.transform(1, 0, -this.skew, 1, this.x1, this.verticalPosition); // translate the axes to (x1,verticalPosition) and skew rightwards
		this.ctx.fillText(this.initialText[1], 0, 0);
		this.ctx.restore();
		this.ctx.save(); // set the position of drawing, together with the skew, via the call to transform() to ensure correct horizontal positioning of all the letters drawn by this method
		this.ctx.transform(1, 0, -this.skew, 1, this.x2, this.verticalPosition); // translate the axes to (x2,verticalPosition) and skew rightwards
		this.ctx.fillText(this.initialText[2], 0, 0);
		this.ctx.restore();
		this.ctx.save();
		this.ctx.transform(1, 0, -this.skew, 1, this.x3, this.verticalPosition); // translate the axes to (x3,verticalPosition) and skew rightwards
		this.ctx.fillText(this.initialText[3], 0, 0);
		this.ctx.restore();
		this.ctx.save();
		this.ctx.transform(1, 0, -this.skew, 1, this.x4, this.verticalPosition); // translate the axes to (x4,verticalPosition) and skew rightwards
		this.ctx.fillText(this.initialText[4], 0, 0);
		this.ctx.restore();
	}
}

class MetamorphoseVtoIIIII // animation of metamorphosis of V->IIIII
{// including simultaneous moving of the context to make space for IIIII
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	initialText = null; // to metamorphose into finalText
	finalText = null; // obtain both initialText and finalText from an object of class MetamorphoseIIIIItoV
	sameText = null; // the context of initialText and finalText, to be moved to the left to make space as the Is diverge
	nCsame = 0; // how many numerals in sameText
	entireText = null; // sameText followed by initialText
	x0 = 0; // updated horizontal position of the leftmost I
	x1 = 0; // updated horizontal position of the next to the leftmost I
	x2 = 0; // updated horizontal position of the middle I
	x3 = 0; // updated horizontal position of the next to the rightmost I
	x4 = 0; // updated horizontal position of the rightmost I
	xs = 0; // updated horizontal position of the leftmost end of sameText
	x0f = 0; // final horizontal position of the leftmost I
	x1f = 0; // final horizontal position of the next to the leftmost I
	x2f = 0; // final horizontal position of the middle I
	x3f = 0; // final horizontal position of the next to the rightmost I
	x4f = 0; // final horizontal position of the rightmost I
	xSf = 0; // final horizontal position of the leftmost end of sameText
	skewI = 0; // constant (initial (at the beginning of their divergence) skew of the Is)
	skewF = 0; // constant (final (usual) skew of the Is) (obtain both skewI and skewF from an object of class MetamorphoseIIIIItoV)
	vSkew = 0; // how fast to move skew towards skewF (calculated from skewF, skewI and AnimationSpeedMetamorphosis)
	vSkewPos = false; // true iff vSkew > 0
	skew = 0; // current value (starts = skewI and increases to skewF)
	vx0 = 0; // (px/msec) how fast to move x0 towards x0f
	vx1 = 0; // (px/msec) how fast to move x1 towards x1f
	vx2 = 0; // (px/msec) how fast to move x2 towards x2f
	vx3 = 0; // (px/msec) how fast to move x3 towards x3f
	vx4 = 0; // (px/msec) how fast to move x4 towards x4f
	vxs = 0; // (px/msec) how fast to move xs towards xSf
	t = 0; // (msec) time of last update
	verticalPosition = 0; // vertical position of all the text treated by this class
	started = false; // true iff initialText was found in entireText
	finished = false; // iff finished the metamorphosis of intialText into finalText
	constructor(m) // m must be object of class MetamorphoseIIIIItoV
	{
		if (m === null)
			return;
		this.drawingOnCanvas = m.drawingOnCanvas;
		this.initialText = m.finalText;
		this.finalText = m.initialText;
		this.skewI = m.skewF;
		this.skewF = m.skewI;
		this.cnv = this.drawingOnCanvas.canvas;
		this.ctx = m.ctx;
	}
	getText()
	{
		const iTxt = this.initialText;
		const fTxt = this.finalText;
		return {iTxt, fTxt};
	}
	reset()
	{
		this.started = false;
		this.finished = false;
	}
	start(sText)
	{
		if (sText == null || this.initialText == null || this.finalText == null ||
			typeof(sText) !== 'string' || typeof(this.initialText) !== 'string' ||
			typeof(this.finalText) !== 'string' ||
			this.initialText.length < 1 || this.finalText.length < 1)
		{
			this.finished = true;
			return; // invalid parameters, so nothing to do here
		}
		this.entireText = sText;
 		this.nCsame = this.entireText.length - this.initialText.length;
		if (this.nCsame < 0)
		{
			this.finished = true;
			return; // entireText shorter than initialText, so nothing to substitute, so nothing to do here
		}
		if (this.entireText.substring(this.nCsame) !== this.initialText)
		{
			this.finished = true;
			return; // entireText does not end with initialText, so nothing to substitute, so nothing to do here
		}
		this.sameText = this.entireText.substring(0, this.nCsame);
		if (this.cnv === null || this.ctx === null)
		{
			this.finished = true;
			return; // browser does not support canvas
		}
		this.started = true;
		this.finished = false;
		const cvw = this.cnv.width - horizontalOffset;
		let metrics = this.ctx.measureText(this.finalText);
		this.verticalPosition = metrics.actualBoundingBoxAscent;
		this.x0f = cvw - metrics.width;
		metrics = this.ctx.measureText(this.finalText.substring(1));
		this.x1f = cvw - metrics.width;
		metrics = this.ctx.measureText(this.finalText.substring(2));
		this.x2f = cvw - metrics.width;
		metrics = this.ctx.measureText(this.finalText.substring(3));
		this.x3f = cvw - metrics.width;
		metrics = this.ctx.measureText(this.finalText.substring(4));
		this.x4f = cvw - metrics.width;
		metrics = this.ctx.measureText(this.initialText);
		this.x0 = this.x1 = this.x2 = this.x3 = this.x4 = cvw - metrics.width;
		metrics = this.ctx.measureText(this.sameText);
		this.xSf = this.x0f - metrics.width;
		this.xs = this.x0 - metrics.width;
		this.skew = this.skewI;
		this.vSkew = AnimationSpeedMetamorphosis*(this.skewF - this.skewI);
		this.vSkewPos = fpLess(0, this.vSkew, fpTolerance);
		this.vxs = AnimationSpeedMetamorphosis*(this.xSf - this.xs);
		this.vx0 = AnimationSpeedMetamorphosis*(this.x0f - this.x0);
		this.vx1 = AnimationSpeedMetamorphosis*(this.x1f - this.x1);
		this.vx2 = AnimationSpeedMetamorphosis*(this.x2f - this.x2);
		this.vx3 = AnimationSpeedMetamorphosis*(this.x3f - this.x3);
		this.vx4 = AnimationSpeedMetamorphosis*(this.x4f - this.x4);
		this.t = Date.now();
	}
	done()
	{
		if (this.finished) return true;
		this.finished =
			(fpEqual(this.skew, this.skewF, fpTolerance) &&
			fpEqual(this.xs, this.xSf, fpTolerance) &&
			fpEqual(this.x0, this.x0f, fpTolerance) &&
			fpEqual(this.x1, this.x1f, fpTolerance) &&
			fpEqual(this.x2, this.x2f, fpTolerance) &&
			fpEqual(this.x3, this.x3f, fpTolerance) &&
			fpEqual(this.x4, this.x4f, fpTolerance));
		return this.finished;
	}
	proceed()
	{
		if (this.finished) return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u = this.xs + (this.vxs)*dt;
		this.xs = fpMax(this.xSf, u, fpTolerance); // prevent xs from surpassing xSf
		let xLim = fpMax(this.xs, this.x0f, fpTolerance);
		u = this.x0 + (this.vx0)*dt;
		this.x0 = fpMax(xLim, u, fpTolerance); // prevent x0 from surpassing max(xs,x0f)
		xLim = fpMax(this.x0, this.x1f, fpTolerance);
		u = this.x1 + (this.vx1)*dt;
		this.x1 = fpMax(xLim, u, fpTolerance); // prevent x1 from surpassing max(x0, x1f)
		xLim = fpMax(this.x1, this.x2f, fpTolerance);
		u = this.x2 + (this.vx2)*dt;
		this.x2 = fpMax(xLim, u, fpTolerance); // prevent x2 from surpassing max(x1, x2f)
		xLim = fpMax(this.x2, this.x3f, fpTolerance);
 		u = this.x3 + (this.vx3)*dt;
		this.x3 = fpMax(xLim, u, fpTolerance); // prevent x3 from surpassing max(x2, x3f)
		u = this.x4 + (this.vx4)*dt;
		this.x4 = fpMin(u, this.x4f, fpTolerance); // prevent x4 from surpassing x4f
		u = this.skew + (this.vSkew)*dt;
		this.skew = this.vSkewPos ? fpMin(u, this.skewF, fpTolerance)
						: fpMax(this.skewF, u, fpTolerance); // prevent skew from surpassing skewF
		this.t = t1;
	}
	draw()
	{
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		const cvw = this.cnv.width - this.xs;
		this.ctx.clearRect(this.xs, -0.5, cvw, this.cnv.height);
		this.ctx.fillText(this.sameText, this.xs, this.verticalPosition);
		this.ctx.save(); // to reverse the transform(), using restore(), after drawing at (x0,verticalPosition), before doing the same for the next position
		this.ctx.transform(1, 0, this.skew, 1, this.x0, this.verticalPosition); // translate the axes to (x0,verticalPosition) and skew leftwards
		this.ctx.fillText(this.finalText[0], 0, 0);
		this.ctx.restore();
		this.ctx.save(); // use transform()n rather than setTransform() b/c setTransform() discards useful transforms applied earlier often causing letters drawn by this method to be not perfectly aligned with each other vertically
		this.ctx.transform(1, 0, -this.skew, 1, this.x1, this.verticalPosition); // translate the axes to (x1,verticalPosition) and skew rightwards
		this.ctx.fillText(this.finalText[1], 0, 0);
		this.ctx.restore();
		this.ctx.save(); // set the position of drawing, together with the skew, via the call to transform() to ensure correct horizontal positioning of all the letters drawn by this method
		this.ctx.transform(1, 0, -this.skew, 1, this.x2, this.verticalPosition); // translate the axes to (x2,verticalPosition) and skew rightwards
		this.ctx.fillText(this.finalText[2], 0, 0);
		this.ctx.restore();
		this.ctx.save();
		this.ctx.transform(1, 0, -this.skew, 1, this.x3, this.verticalPosition); // translate the axes to (x3,verticalPosition) and skew rightwards
		this.ctx.fillText(this.finalText[3], 0, 0);
		this.ctx.restore();
		this.ctx.save();
		this.ctx.transform(1, 0, -this.skew, 1, this.x4, this.verticalPosition); // translate the axes to (x4,verticalPosition) and skew rightwards
		this.ctx.fillText(this.finalText[4], 0, 0);
		this.ctx.restore();
	}
	more()
	{
		if (this.started == false || this.finished == true)
			return false;
		if (this.done() == false)
		{
			this.proceed();
			this.draw();
		}
		if (this.finished && this.drawingOnCanvas !== null)
		{
			let s = replaceLastChars(this.entireText, this.initialText, this.finalText);
			this.drawingOnCanvas.set((s == null) ? this.entireText : s);
		}
		return !this.finished;
	}
}

class MetamorphoseVVtoX // 1st stage of animations of VV->X (but for tally...
{//...drawings, instead use class MergeVerticallyTwoHorizontallyAdjacentBoxes)
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	initialText = "VV"; // (constant) to metamorphose into finalText
	finalText = "X"; // constant
	wi = 0; // width (in pixels) on canvas of initialText
	wf = 0; // width (in pixels) on canvas of finalText
	halfWidthNumeral = 0; // half of the width, in pixels, of initialText[0] (used in transforming the coordinate system in this.draw())
	halfHeightNumeral = 0; // half of the height, in pixels, of initialText[0] (used in transforming the coordinate system in this.draw())
	x1i = 0; // initial horizontal position of the leftmost end of initialText, where to start clearing the canvas in each call to draw()
	x1 = 0; // updated horizontal position of the left V
	x2 = 0; // updated horizontal position of the right V
	xf = 0; // final horizontal position of characters of initialText (as they finish metamorphosing into finalText)
	y1 = 0; // updated vertical position of the left V
	y2 = 0; // updated vertical position of the right V
	y1f = 0; // final vertical position of the left V
	y2f = 0; // final vertical position of the right V
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
	vy1 = 0; // (px/msec) how fast to move y1 towards y1f
	vy2 = 0; // (px/msec) how fast to move y2 towards y2f
	t = 0; // (msec) time of last update
	finished = true; // iff finished the metamorphosis of intialText into finalText
	justFinished = false; // used to implement this.recent()
	constructor(d)
	{ // d must be ref. to DrawingOnCanvas object: either romanNumeralsAdditive or romanNumeralsSubtractive
		if (d === null)
			return;
		this.drawingOnCanvas = d;
		this.cnv = this.drawingOnCanvas.canvas;
		if (this.cnv.getContext !== null) // otherwise, browser does not support canvas
			this.ctx = this.cnv.getContext("2d");
	}
	xInitial() {return this.x1i;} // initial horizontal position of initialText
	xFinal() {return this.xf;} // horizontal position of finalText at the end of this metamorphosis
	wInitial() {return this.wi;}
	wFinal() {return this.wf;}
	computeGraphicsSizes() // called in this.start()
	{ // useless to compute this in this.constructor() b/c no guarantee that the HTML canvas is properly set up before this.constructor() is called
		if (this.ctx === null)
			return; // browser does not support canvas
		let metrics = this.ctx.measureText(this.initialText);
		if (metrics !== null)
		{
			if (fpLess(0, metrics.width, fpTolerance))
				this.wi = metrics.width;
			if (fpLess(0, metrics.actualBoundingBoxAscent, fpTolerance))
			{
				this.y2 = this.y1f = this.y1 = metrics.actualBoundingBoxAscent;
				this.y2f = 0.5 * (this.y2);
			}
		}
		metrics = this.ctx.measureText(this.finalText);
		if ((metrics !== null) && fpLess(0, metrics.width, fpTolerance))
			this.wf = metrics.width;
	}
	start()
	{
		this.finished = true;
		this.justFinished = false;
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.finished = false;
		this.computeGraphicsSizes();
		this.x1i = this.x1 = horizontalOffset + this.wi;
		let metrics = this.ctx.measureText(this.initialText.substring(1));
		if ((metrics !== null) && fpLess(0, metrics.width, fpTolerance))
			this.x2 = horizontalOffset + metrics.width;
		if (this.drawingOnCanvas.flipHorizontalAxis == false)
		{
			this.x1i = this.cnv.width - this.x1i;
			this.x1 = this.cnv.width - this.x1;
			this.x2 = this.cnv.width - this.x2;
		}
		this.xf = 0.25 * (this.x1) + 0.75 * (this.x2); // put convergence point closer to right V in order to help avoid drawing small parts of extremities of the left V on the part of the canvas which must remain unchanged during this metamorphosis
		metrics = this.ctx.measureText(this.initialText[0]);
		if (metrics !== null)
		{
			if (fpLess(0, metrics.width, fpTolerance))
				this.halfWidthNumeral = 0.5 * (metrics.width);
			if (fpLess(0, metrics.actualBoundingBoxAscent, fpTolerance))
				this.halfHeightNumeral = 0.5 * (metrics.actualBoundingBoxAscent);
		}
		this.scale = this.scaleI;
		this.angle = this.angleI;
		this.vx1 = 2*AnimationSpeedMetamorphosis*(this.xf - this.x1); // speed up the movement of the left V to its destination in order to help avoid drawing small parts of extremities of the left V outside the part of the canvas which initially displays initialText
		this.vx2 = AnimationSpeedMetamorphosis*(this.xf - this.x2);
		this.vy1 = AnimationSpeedMetamorphosis*(this.y1f - this.y1);
		this.vy2 = AnimationSpeedMetamorphosis*(this.y2f - this.y2);
		this.vScale = 2*AnimationSpeedMetamorphosis*(this.scaleF - this.scaleI); // speed up the scaling down of both Vs in order to help avoid putting small parts of the extremities of the left V outside the part of the canvas which initially displays initialText
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
		this.x1 = fpMin(u, this.xf, fpTolerance); // prevent x1 from surpassing xf
		u = this.x2 + (this.vx2)*dt;
		this.x2 = fpMax(this.xf, u, fpTolerance); // prevent x2 from surpassing xf
 		//u = this.y1 + (this.vy1)*dt; // y1 remains the same here
		//this.y1 = fpMax(this.y1f, u, fpTolerance); // prevent y1 from surpassing y1f
 		u = this.y2 + (this.vy2)*dt;
		this.y2 = fpMax(this.y2f, u, fpTolerance); // prevent y2 from surpassing y2f
		u = this.scale + (this.vScale)*dt;
		this.scale = fpMax(this.scaleF, u, fpTolerance); // prevent scale from surpassing scaleF
		u = this.angle + (this.vAngle)*dt;
		this.angle = fpMin(u, this.angleF, fpTolerance); // prevent angle from surpassing angleF
		this.t = t1;
	}
	draw()
	{
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		const cvw = this.cnv.width - this.xInitial();
		this.ctx.clearRect(this.xInitial(), -0.5, cvw, this.cnv.height);
		this.ctx.save(); // to reverse, using restore(), the following transformations after drawing at (x1,y1), before doing the same for (x2,y2)
		this.ctx.translate(this.x1 + this.halfWidthNumeral,
					this.y1 - (this.scale) * (this.halfHeightNumeral));
		this.ctx.rotate(-this.angle);
		this.ctx.scale(1, this.scale);
		this.ctx.translate(-this.halfWidthNumeral, this.halfHeightNumeral);
		this.ctx.fillText(this.initialText[0], 0, 0);
		this.ctx.restore();
		this.ctx.save();
		this.ctx.translate(this.x2 + this.halfWidthNumeral, this.y2);
		this.ctx.scale(1, this.scale);
		this.ctx.translate(-this.halfWidthNumeral, 0);
		this.ctx.fillText(this.initialText[1], 0, 0);
		this.ctx.restore();
	}
}

class MetamorphoseXtoVV // animation of metamorphosis of X->VV
{//including simultaneous moving of the context to make space for VV
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	initialText = null; // to metamorphose into finalText
	finalText = null; // obtain both initialText and finalText from an object of class MetamorphoseVVtoX
	sameText = null; // the context of initialText and finalText, to be moved to the left to make space as the Is diverge
	nCsame = 0; // how many numerals in sameText
	entireText = null; // sameText followed by initialText
	halfWidthNumeral = 0; // half of the width, in pixels, of initialText[0] (used in transforming the coordinate system in this.draw())
	halfHeightNumeral = 0; // half of the height, in pixels, of initialText[0] (used in transforming the coordinate system in this.draw())
	x1 = 0; // updated horizontal position of the left V
	x2 = 0; // updated horizontal position of the right V
	xs = 0; // updated horizontal position of the leftmost end of sameText
	x1f = 0; // final horizontal position of characters of left V
	x2f = 0; // final horizontal position of characters of left V
	xSf = 0; // final horizontal position of the leftmost end of sameText
	y1 = 0; // updated vertical position of the left V
	y2 = 0; // updated vertical position of the right V
	yf = 0; // final vertical position of the Vs
	scaleI = 0; // constant (initial (usual) scale of the Vs)
	scaleF = 0; // constant (final (at their convergence) scale of the Vs)
	vScale = 0; // how fast to move scale towards scaleF (calculated from scaleF, scaleI and AnimationSpeedMetamorphosis)
	scale = 0; // current value (starts = scaleI and decreases to scaleF)
	angleI = 0; // constant (initial (usual) angle of the left V)
	angleF = 0; // constant (final (at their convergence) angle of the left V)
	vAngle = 0; // how fast to move angle towards angleF (calculated from angleF, angleI and AnimationSpeedMetamorphosis)
	angle = 0; // (of the left V) current value (starts = angleI and decreases to angleF)
	vx1 = 0; // (px/msec) how fast to move x1 towards xf
	vx2 = 0; // (px/msec) how fast to move x2 towards xf
	vxs = 0; // (px/msec) how fast to move x4 towards xSf
	vy1 = 0; // (px/msec) how fast to move y1 towards yf
	vy2 = 0; // (px/msec) how fast to move y2 towards yf
// factors to adjust vx1 and vScale to help avoid drawing small parts of extremities of the left V on the part of the canvas which must remain unchanged during this metamorphosis
	v1AdjSlow = 0.5; // slow-down factor for vx1 and vScale (during the first half of this metamorphosis)
	v1AdjFast = 0.0; // speed-up factor for rate of change of aOut (during the second half of this metamorphosis)
	x1m = 0; // midpoint, between x1 initial and x1f, where to start using v1AdjFast instead of v1AdjSlow
	t = 0; // (msec) time of last update
	started = false; // true iff initialText was found in entireText
	finished = false; // iff finished the metamorphosis of intialText into finalText
	constructor(m) // m must be object of class MetamorphoseVVtoX
	{
		if (m === null)
			return;
		this.drawingOnCanvas = m.drawingOnCanvas;
		this.initialText = m.finalText;
		this.finalText = m.initialText;
		this.scaleI = m.scaleF;
		this.scaleF = m.scaleI;
		this.angleI = m.angleF;
		this.angleF = m.angleI;
		this.cnv = this.drawingOnCanvas.canvas;
		this.ctx = m.ctx;
	}
	getText()
	{
		const iTxt = this.initialText;
		const fTxt = this.finalText;
		return {iTxt, fTxt};
	}
	reset()
	{
		this.started = false;
		this.finished = false;
	}
	start(sText)
	{
		if (sText == null || this.initialText == null || this.finalText == null ||
			typeof(sText) !== 'string' || typeof(this.initialText) !== 'string' ||
			typeof(this.finalText) !== 'string' ||
			this.initialText.length < 1 || this.finalText.length < 1)
		{
			this.finished = true;
			return; // invalid parameters, so nothing to do here
		}
		this.entireText = sText;
 		this.nCsame = this.entireText.length - this.initialText.length;
		if (this.nCsame < 0)
		{
			this.finished = true;
			return; // entireText shorter than initialText, so nothing to substitute, so nothing to do here
		}
		if (this.entireText.substring(this.nCsame) !== this.initialText)
		{
			this.finished = true;
			return; // entireText does not end with initialText, so nothing to substitute, so nothing to do here
		}
		this.sameText = this.entireText.substring(0, this.nCsame);
		if (this.cnv === null || this.ctx === null)
		{
			this.finished = true;
			return; // browser does not support canvas
		}
		this.started = true;
		this.finished = false;
		const cvw = this.cnv.width - horizontalOffset;
		let metrics = this.ctx.measureText(this.finalText);
		this.yf = this.y1 = metrics.actualBoundingBoxAscent;
		this.y2 = 0.5 * (this.yf);
		this.x1f = cvw - metrics.width;
		metrics = this.ctx.measureText(this.finalText[0]);
		this.halfHeightNumeral = 0.5 * (metrics.actualBoundingBoxAscent);
		this.halfWidthNumeral = 0.5 * (metrics.width);
		metrics = this.ctx.measureText(this.finalText.substring(1));
		this.x2f = cvw - metrics.width;
		metrics = this.ctx.measureText(this.initialText);
		this.x1 = this.x2 = cvw - metrics.width;
		metrics = this.ctx.measureText(this.sameText);
		this.xSf = this.x1f - metrics.width;
		this.xs = this.x1 - metrics.width;
		this.scale = this.scaleI;
		this.angle = this.angleI;
		this.x1m = 0.5 * (this.x1f + this.x1);
		this.v1AdjFast = 2 - this.v1AdjSlow; // assumes that x1m=(x1f+x1)/2
		this.vxs = AnimationSpeedMetamorphosis*(this.xSf - this.xs);
		this.vx1 = AnimationSpeedMetamorphosis*(this.x1f - this.x1); // move left V to its destination faster in order to help avoid drawing small parts of extremities of the left V on the part of the canvas which must remain unchanged during this metamorphosis
		this.vx2 = AnimationSpeedMetamorphosis*(this.x2f - this.x2);
		this.vy1 = AnimationSpeedMetamorphosis*(this.yf - this.y1);
		this.vy2 = AnimationSpeedMetamorphosis*(this.yf - this.y2);
		this.vScale = AnimationSpeedMetamorphosis*(this.scaleF - this.scaleI); // scale both Vs down faster in order to help avoid putting small parts of their extremities outside the part of the canvas initially displaying initialText
		this.vAngle = AnimationSpeedMetamorphosis*(this.angleF - this.angleI);
		this.t = Date.now();
	}
	done()
	{
		if (this.finished) return true;
		this.finished =
			(fpEqual(this.scale, this.scaleF, fpTolerance) &&
			fpEqual(this.angle, this.angleF, fpTolerance) &&
			fpEqual(this.xs, this.xSf, fpTolerance) &&
			fpEqual(this.x1, this.x1f, fpTolerance) &&
			fpEqual(this.x2, this.x2f, fpTolerance) &&
			fpEqual(this.y1, this.yf, fpTolerance) &&
			fpEqual(this.y2, this.yf, fpTolerance));
		return this.finished;
	}
	proceed()
	{
		if (this.finished) return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		const vAdj = fpLess(this.x1, this.x1m, fpTolerance) ? this.v1AdjSlow : this.v1AdjFast;
		let u = this.xs + (this.vxs)*dt;
		this.xs = fpMax(this.xSf, u, fpTolerance); // prevent xs from surpassing xSf
		let xLim = fpMax(this.xs, this.x1f, fpTolerance);
		u = this.x1 + vAdj * (this.vx1) * dt;
		this.x1 = fpMax(xLim, u, fpTolerance); // prevent x1 from surpassing max(xs,x1f)
		u = this.x2 + (this.vx2)*dt;
		this.x2 = fpMin(u, this.x2f, fpTolerance); // prevent x2 from surpassing x2f
 		//u = this.y1 + (this.vy1)*dt; // y1 remains the same here
		//this.y1 = fpMax(this.yf, u, fpTolerance); // prevent y1 from surpassing yf
 		u = this.y2 + (this.vy2)*dt;
		this.y2 = fpMin(u, this.yf, fpTolerance); // prevent y2 from surpassing yf
		u = this.scale + vAdj * (this.vScale) * dt;
		this.scale = fpMin(u, this.scaleF, fpTolerance); // prevent scale from surpassing scaleF
		u = this.angle + (this.vAngle)*dt;
		this.angle = fpMax(this.angleF, u, fpTolerance); // prevent angle from surpassing angleF
		this.t = t1;
	}
	draw()
	{
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		const cvw = this.cnv.width - this.xs;
		this.ctx.clearRect(this.xs, -0.5, cvw, this.cnv.height);
		this.ctx.fillText(this.sameText, this.xs, this.yf);
		this.ctx.save(); // to reverse, using restore(), the following transformations after drawing at (x1,y1), before doing the same for (x2,y2)
		this.ctx.translate(this.x1 + this.halfWidthNumeral,
					this.y1 - (this.scale) * (this.halfHeightNumeral));
		this.ctx.rotate(-this.angle);
		this.ctx.scale(1, this.scale);
		this.ctx.translate(-this.halfWidthNumeral, this.halfHeightNumeral);
		this.ctx.fillText(this.finalText[0], 0, 0);
		this.ctx.restore();
		this.ctx.save();
		this.ctx.translate(this.x2 + this.halfWidthNumeral, this.y2);
		this.ctx.scale(1, this.scale);
		this.ctx.translate(-this.halfWidthNumeral, 0);
		this.ctx.fillText(this.finalText[1], 0, 0);
		this.ctx.restore();
	}
	more()
	{
		if (this.started == false || this.finished == true)
			return false;
		if (this.done() == false)
		{
			this.proceed();
			this.draw();
		}
		if (this.finished && this.drawingOnCanvas !== null)
		{
			let s = replaceLastChars(this.entireText, this.initialText, this.finalText);
			this.drawingOnCanvas.set((s == null) ? this.entireText : s);
		}
		return !this.finished;
	}
}

class Fade // used to fade graphics in, to fade graphics out...
{//...and to cross-fade one graphic into another
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	initialText = null; // (constant) text to fade out
	finalText = null; // (constant) text to fade in
	fcnInitialDrawing = null; // ref. to function used to draw the graphic to fade out
	fcnFinalDrawing = null; // ref. to function used to draw the graphic to fade in
	xi = 0; // horizontal position (in pixels) of the graphic to fade out, if given, otherwise of the leftmost end of initialText, if given
	xf = 0;  // horizontal position (in pixels) of the graphic to fade in, if given, otherwise of finalText, if given
	wi = 0; // width (in pixels) of the graphic to fade out, if given, otherwise of initialText, if given
	wf = 0;  // width (in pixels) of the graphic to fade in, if given, otherwise of finalText, if given
	textOnly = true; // true iff fcnInitialDrawing===null and fcnFinalDrawing===null
	aOutI = 1.0; // constant (initial alpha of initialText)
	aOutF = 0.0; // constant (final alpha of initialText)
	vaOut = 0; // how fast to change aOut to aOutF (calculated from aOutF, aOutI and AnimationSpeedMetamorphosis)
	aOut = 0; // current alpha value for initialText (starts = aOutI and decreases to aOutF)
	aInI = 0.0; // constant (initial alpha of finalText)
	aInF = 1.0; // constant (final (at their convergence) angle of the left V)
	vaIn = 0; // how fast to change aIn to aInF (calculated from aInF, aInI and AnimationSpeedMetamorphosis)
	aIn = 0; // current alpha value for finalText (starts = aInI and increases to aInF)
	xClear = 0; // horizontal position (in pixels) of the leftmost corner of the part of canvas to be cleared before redrawing
	wClear = 0; // width (in pixels) of the part of canvas to be cleared before redrawing
	t = 0; // (msec) time of last update
	verticalPosition = 0; // vertical position of all the text treated by this class
	finished = true; // iff finished the metamorphosis of intialText into finalText
	justFinished = false; // used to implement this.recent()
	constructor(d, oText, iText)
	{ // d must be ref. to DrawingOnCanvas object: either romanNumeralsAdditive or romanNumeralsSubtractive
		if (d === null)
			return;
		this.drawingOnCanvas = d;
		this.cnv = this.drawingOnCanvas.canvas;
		if (this.cnv.getContext !== null) // otherwise, browser does not support canvas
			this.ctx = this.cnv.getContext("2d");
		this.initialText = oText;
		this.finalText = iText;
	}
	setDrawings(outFcn, inFcn)
	{
		this.fcnInitialDrawing = outFcn;
		this.fcnFinalDrawing = inFcn;
		this.textOnly = ((this.fcnInitialDrawing===null) &&
							(this.fcnFinalDrawing===null));
	}
	xInitial() {return this.xi;} // initial horizontal position of initialText
	xFinal() {return this.xf;} // horizontal position of finalText at the end of this metamorphosis
	wInitial() {return this.wi;}
	wFinal() {return this.wf;}
	computeGraphicsSizes() // called in this.start() and in AnimateTallyMarkInsertion.start() which calls wFinal() method of this class
	{ // useless to compute this in this.constructor() b/c no guarantee that the HTML canvas is properly set up before this.constructor() is called
		if (this.ctx === null)
			return; // browser does not support canvas
		let metrics = null;
		if (this.finalText !== null)
		{
			metrics = this.ctx.measureText(this.finalText);
			this.wf = metrics.width;
			if ((this.initialText === null) && (this.fcnFinalDrawing === null))
				this.verticalPosition = metrics.actualBoundingBoxAscent;
		}
		if (this.initialText !== null)
		{
			metrics = this.ctx.measureText(this.initialText);
			this.wi = metrics.width;
			if (this.fcnInitialDrawing === null)
				this.verticalPosition = metrics.actualBoundingBoxAscent;
		}
	}
	start()
	{
		this.finished = true;
		this.justFinished = false;
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.finished = false;
		this.verticalPosition = this.textOnly ? this.cnv.height : verticalOffset;
		this.xi = horizontalOffset;
		this.xf = horizontalOffset;
		let metrics = null;
		this.computeGraphicsSizes();
		const finalTextOnly = (this.finalText !== null) && (this.fcnFinalDrawing === null);
		if (this.initialText !== null)
		{
			if (this.fcnInitialDrawing === null)
				this.xi += this.wi;
			if (finalTextOnly)
				this.xf += 0.5 * (this.wi + this.wf);
		} else if (finalTextOnly)
			this.xf += this.wf;
		this.aOut = this.aOutI;
		this.aIn = this.aInI;
		this.vaOut = AnimationSpeedMetamorphosis*(this.aOutF - this.aOutI);
		this.vaIn = AnimationSpeedMetamorphosis*(this.aInF - this.aInI);
		if (this.drawingOnCanvas.flipHorizontalAxis == false)
		{
			this.xi = this.cnv.width - this.xi;
			this.xf = this.cnv.width - this.xf;
		}
		this.xClear = fpMin(this.xi, this.xf, fpTolerance) - 1; // subtracting 1 remedies the erroneous erasure of the rightmost boundary of the rightmost box of tally marks (5, 10, 50, ...) when fading in the additional tally mark (as part of incrementing the number) immediately after sliding all the boxes leftwards to leave space for the tally mark to be faded in
		this.xClear = fpLimitToInterval(this.xClear, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
		this.wClear = fpMax(this.wi, this.wf, fpTolerance);
		if (this.textOnly)
			this.wClear++; // the hack to remedy the failure to erase the rightmost pixel(s) of the rightmost numerals when cross-fading XXXXX->L or LL->C etc.
		else
			this.wClear--; // the hack to remedy erroneous erasure of the rightmost edge of the rightmost box of tally marks when fading in the additional tally mark if incrementing the number from 5, 10 or 1000 (occurred in Firefox but not in Chrome nor in MS Edge nor in Opera)
		this.wClear = fpLimitToInterval(this.wClear, 0, this.cnv.width - this.xClear, fpTolerance); // prevent from exceeding available canvas width and from being negative
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
			u = this.aOut + (this.vaOut) * dt;
			this.aOut = fpMax(this.aOutF, u, fpTolerance); // prevent aOut from surpassing aOutF
		}
		if (this.finalText !== null)
		{
			u = this.aIn + (this.vaIn)*dt;
			this.aIn = fpMin(u, this.aInF, fpTolerance); // prevent aIn from surpassing aInF
		}
		this.t = t1;
	}
	draw()
	{
		if ((this.initialText===null) && (this.finalText===null))
			return;
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		this.ctx.clearRect(this.xClear, -0.5, this.wClear, this.cnv.height);
		const oldFillStyle = this.ctx.fillStyle;
		const oldStrokeStyle = this.ctx.strokeStyle;
		const canvasStyle = getComputedStyle(this.cnv);
		const foregroundColor = canvasStyle.color;
		const fgc = extractRGBValues(foregroundColor);
		if (this.initialText !== null)
		{
			const outStyle = `rgb(${fgc.r} ${fgc.g} ${fgc.b} / ${this.aOut})`; // with alpha for initialText
			this.ctx.fillStyle = outStyle;
			this.ctx.strokeStyle = outStyle;
			if (this.fcnInitialDrawing !== null)
				this.drawingOnCanvas.draw(this.fcnInitialDrawing, this.xInitial(), this.verticalPosition, this.wi);
			else
				this.ctx.fillText(this.initialText, this.xInitial(), this.verticalPosition);
		}
		if (this.finalText !== null)
		{
			const inStyle = `rgb(${fgc.r} ${fgc.g} ${fgc.b} / ${this.aIn})`; // with alpha for finalText
			this.ctx.fillStyle = inStyle;
			this.ctx.strokeStyle = inStyle;
			if (this.fcnFinalDrawing !== null)
				this.drawingOnCanvas.draw(this.fcnFinalDrawing, this.xFinal(), this.verticalPosition, this.wf);
			else
				this.ctx.fillText(this.finalText, this.xFinal(), this.verticalPosition);
		}
		this.ctx.fillStyle = oldFillStyle; // restore original value
		this.ctx.strokeStyle = oldStrokeStyle; // restore original value
	}
}

class AnimateSymbolSubstitutionToMany // cross-fade initialText (1 numeral) into finalText...
{//...(more than 1 numeral) while moving the numerals of finalText apart (starting from overlapping each other and ending at their usual spacing)
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	initialText = null; // (constant) text to fade out
	finalText = null; // (constant) text to fade in
	sameText = null; // set to entireText.substring(0, nCsame) in this.start()
	nCsame = 0; // how many numerals in sameText
	entireText = null; // sameText followed by initialText
	xs = 0; // current horizontal position of sameText
	xSf = 0; // final horizontal position of sameText
	wInitialText = 0; // # of px for initialText
	x = null;  // current horizontal position of each character of finalText
	xf = null; // final horizontal position of each character of finalText
	aOutI = 0; // constant (initial alpha of initialText)
	aOutF = 0; // constant (final alpha of initialText)
	vaOut = 0; // how fast to change aOut to aOutF (calculated from aOutF, aOutI and AnimationSpeedMetamorphosis)
	aOut = 0; // current alpha value for initialText (starts = aOutI and decreases to aOutF)
	aInI = 0; // constant (initial alpha of finalText)
	aInF = 0; // constant (final (at their convergence) angle of the left V)
	vaIn = 0; // how fast to change aIn to aInF (calculated from aInF, aInI and AnimationSpeedMetamorphosis)
	aIn = 0; // current alpha value for finalText (starts = aInI and increases to aInF)
	vx = null; // (px/msec) how fast to move x[i] towards xf[i]
	vxPos = null; // array of booleans: vxPos[i] == (vx[i] > 0)
	vxs = 0; // (px/msec) how fast to move xs towards xSf
	t = 0; // (msec) time of last update
	verticalPosition = 0; // vertical position of all the text treated by this class
	started = false; // true iff initialText was found in entireText
	finished = false; // iff finished the metamorphosis of intialText into finalText
	constructor(m)
	{
		if (m === null)
			return;
		this.drawingOnCanvas = m.drawingOnCanvas;
		this.initialText = m.finalText;
		this.finalText = m.initialText;
		this.aOutI = m.aOutI;
		this.aOutF = m.aOutF;
		this.aInI = m.aInI;
		this.aInF = m.aInF;
		this.cnv = this.drawingOnCanvas.canvas;
		this.ctx = m.ctx;
	}
	getText()
	{
		const iTxt = this.initialText;
		const fTxt = this.finalText;
		return {iTxt, fTxt};
	}
	reset()
	{
		this.started = false;
		this.finished = false;
	}
	start(sText)
	{
		if (sText == null || this.initialText == null || this.finalText == null ||
			typeof(sText) !== 'string' || typeof(this.initialText) !== 'string' ||
			typeof(this.finalText) !== 'string' ||
			this.initialText.length < 1 || this.finalText.length < 1)
		{
			this.finished = true;
			return; // invalid parameters, so nothing to do here
		}
		this.entireText = sText;
		this.nCsame = this.entireText.length - this.initialText.length; // how many numerals in sameText
		if (this.nCsame < 0)
		{
			this.finished = true;
			return; // entireText shorter than initialText, so nothing to substitute, so nothing to do here
		}
		if (this.entireText.substring(this.nCsame) !== this.initialText)
		{
			this.finished = true;
			return; // entireText does not end with initialText, so nothing to substitute, so nothing to do here
		}
		this.sameText = this.entireText.substring(0, this.nCsame);
		if (this.cnv === null || this.ctx === null)
		{
			this.finished = true;
			return; // browser does not support canvas
		}
		this.started = true;
		this.finished = false;
		const cvw = this.cnv.width - horizontalOffset;
		if (this.x === null)
			this.x = new Array(this.finalText.length);
		if (this.xf === null)
			this.xf = new Array(this.x.length);
		if (this.vx === null)
			this.vx = new Array(this.x.length);
		if (this.vxPos === null)
			this.vxPos = new Array(this.x.length);
		let metrics = this.ctx.measureText(this.initialText);
		this.verticalPosition = metrics.actualBoundingBoxAscent;
		this.wInitialText = metrics.width;
		for (let i=0; i<this.x.length; i++)
		{
			metrics = this.ctx.measureText(this.finalText.substring(i));
			this.xf[i] = cvw - metrics.width;
		}
		if (this.initialText.length < 2)
			this.x.fill(cvw - this.wInitialText); // the characters of finalText diverge from the same initial position
		else
		{
			const initialToFinalLengthRatio = this.initialText.length / (this.finalText.length);
			for (let i=0; i<this.x.length; i++)
				this.x[i] = cvw - Math.round( (cvw - this.xf[i]) * initialToFinalLengthRatio );
		}
		metrics = this.ctx.measureText(this.sameText);
		this.xSf = this.xf[0] - metrics.width;
		this.xs = this.x[0] - metrics.width;
		this.aOut = this.aOutI;
		this.aIn = this.aInI;
		this.vaOut = AnimationSpeedMetamorphosis*(this.aOutF - this.aOutI);
		this.vaIn = AnimationSpeedMetamorphosis*(this.aInF - this.aInI);
		this.vxs = AnimationSpeedMetamorphosis*(this.xSf - this.xs);
		for (let i=0; i<this.x.length; i++)
		{
			this.vx[i] = AnimationSpeedMetamorphosis*(this.xf[i] - this.x[i]);
			this.vxPos[i] = fpLessEq(0, this.vx[i], fpTolerance);
		}
		this.t = Date.now();
	}
	done()
	{
		if (this.finished) return true;
		this.finished = (fpEqual(this.aOut, this.aOutF, fpTolerance) &&
						fpEqual(this.aIn, this.aInF, fpTolerance) &&
						fpEqual(this.xs, this.xSf, fpTolerance));
		for (let i=0; i<this.x.length; i++)
			if (fpEqual(this.x[i], this.xf[i], fpTolerance)==false)
				this.finished = false;
		return this.finished;
	}
	proceed()
	{
		if (this.finished) return;
		if ((this.initialText===null) && (this.finalText===null))
			return;
		const t1 = Date.now(); // (msec)
		const dt = t1 - this.t; // (msec) time since last update
		let u = this.xs + (this.vxs)*dt;
		this.xs = fpMax(this.xSf, u, fpTolerance); // prevent xs from surpassing xSf
		let xLim;
		let xNext;
		const iLast = this.x.length - 1;
		for (let i=0; i<this.x.length; i++)
		{ // xLim = the closest bound for x[i], determined using xf[i] and either x[i-1] or x[i+1]
			if (this.vxPos[i])
				xLim = (i==iLast) ? this.xf[i] : fpMin(this.x[i+1], this.xf[i], fpTolerance);
			else
			{
				xNext = (i < 1) ? this.xs : this.x[i-1]; // use xs instead of x[i-1] if i==0
				xLim = fpMax(xNext, this.xf[i], fpTolerance);
			}
			u = this.x[i] + (this.vx[i])*dt; // prevent x[i] from surpassing xLim
			this.x[i] = this.vxPos[i] ? fpMin(u, xLim, fpTolerance) : fpMax(xLim, u, fpTolerance);
		}
		if (this.initialText !== null)
		{
			u = this.aOut + (this.vaOut) * dt;
			this.aOut = fpMax(this.aOutF, u, fpTolerance); // prevent aOut from surpassing aOutF
		}
		if (this.finalText !== null)
		{
			u = this.aIn + (this.vaIn)*dt;
			this.aIn = fpMin(u, this.aInF, fpTolerance); // prevent aIn from surpassing aInF
		}
		this.t = t1;
	}
	draw()
	{
		if ((this.initialText===null) && (this.finalText===null))
			return;
		if (this.cnv === null || this.ctx === null)
			return; // browser does not support canvas
		const cw = this.cnv.width - this.xs;
		this.ctx.clearRect(this.xs, -0.5, cw, this.cnv.height);
		this.ctx.fillText(this.sameText, this.xs, this.verticalPosition);
		const cvw = this.cnv.width - horizontalOffset;
		const wCleared = cvw - this.x[0]; // draw initialText in the middle of the space
		const xi = cvw - 0.5 * (wCleared + this.wInitialText); // cleared for finalText
		const oldFillStyle = this.ctx.fillStyle;
		const canvasStyle = getComputedStyle(this.cnv);
		const foregroundColor = canvasStyle.color;
		const fgc = extractRGBValues(foregroundColor);
		this.ctx.fillStyle = `rgb(${fgc.r} ${fgc.g} ${fgc.b} / ${this.aOut})`; // with alpha for initialText
		this.ctx.fillText(this.initialText, xi, this.verticalPosition);
		this.ctx.fillStyle = `rgb(${fgc.r} ${fgc.g} ${fgc.b} / ${this.aIn})`; // with alpha for finalText
		for (let i=0; i<this.x.length; i++)
			this.ctx.fillText(this.finalText[i], this.x[i], this.verticalPosition);
		this.ctx.fillStyle = oldFillStyle; // restore original value
	}
	more()
	{
		if (this.started == false || this.finished == true)
			return false;
		if (this.done() == false)
		{
			this.proceed();
			this.draw();
		}
		if (this.finished && this.drawingOnCanvas !== null)
		{
			let s = replaceLastChars(this.entireText, this.initialText, this.finalText);
			this.drawingOnCanvas.set((s == null) ? this.entireText : s);
		}
		return !this.finished;
	}
}

class AnimateSymbolSubstitutionToFew
{
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // drawing context of cnv
	morph = null; // to store MetamorphoseIIIIItoV (or MetamorphoseVVtoX or Fade) object
	closeTheGaps = null; // to store SlideGraphics object
	entireText = null; // this.sameText followed by this.morph.initialText
	sameText = null; // set to this.entireText.substring(0, nCsame) in this.start()
	nCsame = 0; // how many numerals in sameText
	xiSameText = 0; // initial horizontal position (in pixels) of sameText on canvas
	xfSameText = 0; // final horizontal position (in pixels) of sameText on canvas
	wSameText = 0; // width (in pixels) of sameText on canvas
	ySameText = 0; // vertical position (in pixels) of sameText on canvas
	xiNewText = 0; // initial horizontal position (in pixels) of this.morph.finalText on canvas
	xfNewText = 0; // final horizontal position (in pixels) of this.morph.finalText on canvas
	wNewText = 0; // width (in pixels) of this.morph.finalText on canvas
	yNewText = 0; // vertical position (in pixels) of this.morph.finalText on canvas
	started = false; // true iff initialText was found in entireText
	finished = false; // iff finished all the stages of this animation
	constructor(m)
	{
		if (m === null)
			return;
		this.morph = m;
		this.drawingOnCanvas = this.morph.drawingOnCanvas;
		this.closeTheGaps = new SlideGraphics(m, this.morph.finalText);
		this.cnv = this.drawingOnCanvas.canvas;
		this.ctx = this.morph.ctx;
	}
	setDrawings(l, r) {this.closeTheGaps.setDrawings(l, r);}
	getText()
	{
		if (this.morph === null)
		{
			console.log(this.constructor.name + ".getText() error: this.morph===null");
			return null;
		}
		const iTxt = this.morph.initialText;
		const fTxt = this.morph.finalText;
		return {iTxt, fTxt};
	}
	reset()
	{
		this.started = false;
		this.finished = false;
	}
	computeGraphicsSizes()
	{
		if (this.closeTheGaps.textOnly)
		{
			let metrics = this.ctx.measureText(this.sameText);
			if (metrics !== null)
			{
				if (fpLess(0, metrics.width, fpTolerance))
					this.wSameText = metrics.width;
				if (fpLess(0, metrics.actualBoundingBoxAscent, fpTolerance))
					this.ySameText = metrics.actualBoundingBoxAscent;
			}
		}
		else
		{
			const oldText = this.drawingOnCanvas.text;
			const oldNumberOfTallyMarks = this.drawingOnCanvas.numberOfTallyMarks;
			this.drawingOnCanvas.calculateOnly = true;
			this.drawingOnCanvas.text = this.sameText;
			this.drawingOnCanvas.numberOfTallyMarks = convertRomanNumeralsAdditiveToNumber(this.sameText);
			let sz = this.closeTheGaps.fcnLeftDrawing(this.drawingOnCanvas, 0, 0);
			this.wSameText = sz.w;
			this.drawingOnCanvas.text = oldText;
			this.drawingOnCanvas.numberOfTallyMarks = oldNumberOfTallyMarks;
			this.drawingOnCanvas.calculateOnly = false;
		}
		if (this.morph.finalText != null)
			this.wNewText = this.morph.wFinal();
	}
	start(sText)
	{
		if (sText == null || this.morph.initialText == null ||
			typeof(sText) !== 'string' || typeof(this.morph.initialText) !== 'string')
		{
			this.finished = true;
			return; // invalid parameters, so nothing to do here
		}
		this.entireText = sText;
		this.nCsame = this.entireText.length - this.morph.initialText.length; // how many numerals in sameText
		if (this.nCsame < 0)
		{
			this.finished = true;
			return; // entireText shorter than initialText, so nothing to substitute, so nothing to do here
		}
		if (this.entireText.substring(this.nCsame) !== this.morph.initialText)
		{
			this.finished = true;
			return; // entireText does not end with initialText, so nothing to substitute, so nothing to do here
		}
		this.sameText = this.entireText.substring(0, this.nCsame);
		if (this.cnv === null || this.ctx === null)
		{
			this.finished = true;
			return; // browser does not support canvas
		}
		this.started = true;
		this.finished = false;
		this.morph.start();
		this.computeGraphicsSizes();
		this.ySameText = this.closeTheGaps.textOnly ? this.cnv.height : verticalOffset; // default value, in case cannot obtain valid text metrics
		this.xiSameText = horizontalOffset;
		this.xfSameText = horizontalOffset;
		if (this.morph.finalText != null)
		{
			this.xiNewText = horizontalOffset;
			this.xfNewText = horizontalOffset;
		}
		if (this.closeTheGaps.textOnly)
		{
			let metrics = this.ctx.measureText(this.entireText);
			if (metrics !== null)
			{
				if (fpLess(0, metrics.width, fpTolerance))
					this.xiSameText += metrics.width;
				if (fpLess(0, metrics.actualBoundingBoxAscent, fpTolerance))
					this.ySameText = metrics.actualBoundingBoxAscent;
			}
			if (this.morph.finalText == null)
				this.xfSameText += this.wSameText;
			else
			{
				metrics = this.ctx.measureText(this.sameText + this.morph.finalText);
				if (metrics !== null)
				{
					if (fpLess(0, metrics.width, fpTolerance))
						this.xfSameText += metrics.width;
					if (fpLess(0, metrics.actualBoundingBoxAscent, fpTolerance))
						this.ySameText = metrics.actualBoundingBoxAscent;
				}
				this.xiNewText = this.morph.xFinal(); // this returned value is already adjusted according to this.drawingOnCanvas.flipHorizontalAxis
				this.xfNewText += this.wNewText;
			}
		}
		else
		{
			this.xiSameText += this.morph.wInitial();
			this.xfSameText += this.morph.wFinal();
			if (this.morph.finalText != null)
			{ // this.xfNewText remains == horizontalOffset
				this.xiNewText = this.morph.xFinal(); // this returned value is already adjusted according to this.drawingOnCanvas.flipHorizontalAxis
			}
		}
		this.xiSameText = fpLimitToInterval(this.xiSameText, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
		this.xfSameText = fpLimitToInterval(this.xfSameText, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width
		this.yNewText = this.ySameText;

		if (this.drawingOnCanvas.flipHorizontalAxis == false)
			this.xiSameText = this.cnv.width - this.xiSameText;
		if (this.drawingOnCanvas.flipHorizontalAxis == false)
			this.xfSameText = this.cnv.width - this.xfSameText;
//		if ((this.closeTheGaps.textOnly == false) && (this.drawingOnCanvas.flipHorizontalAxis == false))
//			this.xiNewText = this.cnv.width - this.xiNewText;
		if (this.drawingOnCanvas.flipHorizontalAxis == false)
			this.xfNewText = this.cnv.width - this.xfNewText;
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
			{
				let xi = this.xiSameText;
				let xf = this.xfSameText;
				let w = this.wSameText;
				let y = this.ySameText;
				let lData = {xi, xf, w, y};
				let rData = null;
				if (this.morph.finalText != null)
				{
					xi = this.xiNewText;
					xf = this.xfNewText;
					w = this.wNewText;
					y = this.yNewText;
					rData = {xi, xf, w, y};
				}
				this.ctx.clearRect(this.morph.xInitial(), -0.5,//remedies failure to erase top-left
									this.morph.wInitial(),//corner of merged IIIII until after
									this.cnv.height);//sliding the resulting V to the right
				this.closeTheGaps.start(this.sameText, lData, rData);
			}
			this.finished = this.closeTheGaps.done();
			if (this.finished == false)
			{
				this.closeTheGaps.proceed();
				this.closeTheGaps.draw();
			}
		}
		if (this.finished && (this.drawingOnCanvas !== null))
		{
			let s = null;
			if (this.morph.finalText == null)
				s = (this.morph.initialText==null) ? this.entireText : this.sameText;
			else
				s = replaceLastChars(this.entireText, this.morph.initialText, this.morph.finalText);
			if (this.closeTheGaps.textOnly)
				this.drawingOnCanvas.set(s);
			else //the following redrawing remedies the apparent small jump in some parts of the final
			{//tally when all the graphics are redrawn at the end of animation e.g. of incrementing from 24
				this.drawingOnCanvas.clearCanvas();
				this.drawingOnCanvas.text = s;
				this.drawingOnCanvas.numberOfTallyMarks = convertRomanNumeralsAdditiveToNumber(s);
				this.closeTheGaps.fcnLeftDrawing(this.drawingOnCanvas, horizontalOffset, verticalOffset);
			}
		}
		return !this.finished;
	}
}

class AnimateTallyMarkInsertion
{
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains ref. to HTML canvas object on which to draw the animation and the text to draw
	cnv = null; // HTML canvas object on which to draw the animation
	ctx = null; // the drawing context of cnv
	morph = null; // to store Fade object (for fading-in)
	makeSpace = null; // to store SlideGraphics object
	entireText = null; // sameText followed by initialText
	started = false; // true iff initialText was found in romanNumeralsAdditive
	finished = false; // iff finished all the stages of this animation
	constructor(m) // m must be ref. to object of class Fade
	{
		if (m === null)
			return;
		this.morph = m;
		this.drawingOnCanvas = this.morph.drawingOnCanvas;
		this.cnv = this.drawingOnCanvas.canvas;
		this.ctx = this.morph.ctx;
		this.makeSpace = new SlideGraphics(m, null);
	}
	setDrawing(f) {this.makeSpace.setDrawings(f, null);}
	getText()
	{
		if (this.morph === null)
		{
			console.log(this.constructor.name + ".getText() error: this.morph===null");
			return null;
		}
		const iTxt = this.morph.initialText;
		const fTxt = this.morph.finalText;
		return {iTxt, fTxt};
	}
	reset()
	{
		this.started = false;
		this.finished = false;
	}
	start(sText)
	{
		if (sText == null || this.morph.finalText == null ||
			typeof(sText) !== 'string' || typeof(this.morph.finalText) !== 'string' ||
			this.morph.finalText.length < 1)
		{
			this.finished = true;
			return; // invalid parameters, so nothing to do here
		}
		this.entireText = sText;
		if (this.cnv === null || this.ctx === null)
		{
			this.finished = true;
			return; // browser does not support canvas
		}
		this.started = true;
		this.morph.computeGraphicsSizes(); // necessary to assign correct values for this.morph.wInitial() and to this.morph.wFinal()
		let xi = horizontalOffset;
		let xf = horizontalOffset;
		let w = 0;
		let y = this.textOnly ? this.cnv.height : verticalOffset; // default value, in case cannot obtain valid text metrics
		let metrics = null;
		if (this.makeSpace.textOnly)
		{
			metrics = this.ctx.measureText(this.entireText);
			if (metrics !== null && fpLess(0, metrics.width, fpTolerance))
			{
				w = metrics.width;
				xi += w;
				if (fpLess(0, metrics.actualBoundingBoxAscent, fpTolerance))
					y = metrics.actualBoundingBoxAscent;
			}
			metrics = this.ctx.measureText(this.entireText + this.morph.finalText); // measure the entire string, as opposed to adding up lengths of measured substrings, in order to minimize small errors
			if (metrics !== null && fpLess(0, metrics.width, fpTolerance))
				xf += metrics.width;
		}
		else
		{
			metrics = this.ctx.measureText(this.morph.finalText); // use the measurement not yet rounded in order to minimize small errors
			if (metrics !== null && fpLess(0, metrics.width, fpTolerance))
				xf += metrics.width;
			w = this.drawingOnCanvas.drawingWidth;
		}
		xi = fpLimitToInterval(xi, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
		xf = fpLimitToInterval(xf, 0, this.cnv.width, fpTolerance); // prevent from exceeding canvas width and from being negative
		if (this.drawingOnCanvas.flipHorizontalAxis == false)
		{
			xi = this.cnv.width - xi;
			xf = this.cnv.width - xf;
		}
		this.makeSpace.start(this.entireText, {xi, xf, w, y}, null);
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
				this.morph.start();
			this.finished = this.morph.done();
			if (this.finished == false)
			{
				this.morph.proceed();
				this.morph.draw();
			}
		}
		if (this.finished && (this.drawingOnCanvas !== null))
		{
			const s = this.entireText + this.morph.finalText;
			if (this.makeSpace.textOnly)
				this.drawingOnCanvas.set(s); // also displays the text on the canvas
			else
				this.drawingOnCanvas.text = s;
		}
		return !this.finished;
	}
}

class AnimationFragment
{ // the reference to a specific animation object and references to preconditions for the execution of this animation object
	anmtn = null; // ref. to the animation object of class AnimateTallyMarkInsertion or AnimateSymbolSubstitutionToFew
	strtd = false; // becomes true when start to execute this.anmtn, reset to false when finished
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains the appropriate romanNumerals (text) member
	prcndtns = []; // ref-s to AnimationSequence objects which contains AnimationFragment objects which must finish executing before this.anmtn starts to execute
	errOcrd = false;
	constructor(a, d) {this.anmtn = a; this.drawingOnCanvas = d;}
	errorOccurred() {return this.errOcrd};
	after(seq, iniTxt, fnlTxt) // set the constraint: this.anmtn can start only after the animation in s (identified using iniTxt and fnlTxt) finishes
	{ // and implement this constraint in this.more()
		if (this.errorOccurred())
			return false;
		if (seq === null)
		{
			console.log(this.constructor.name + ".after() error: s===null");
			this.errOcrd = true;
			return false;
		}
		const idx = seq.findIndex(iniTxt, fnlTxt); // the index of that element in seq which must finish executing before this.anmtn starts to execute
		if (idx === null)
		{
			console.log(this.constructor.name + ".after() error: s.findIndex(" + iniTxt + "," + fnlTxt + ") failed");
			this.errOcrd = true;
			return false;
		}
		this.prcndtns.push({seq, idx});
		return true;
	}
	getText()
	{
		const a = this.anmtn;
		if (a === undefined)
		{
			console.log(this.constructor.name + ".getText() error: this.anmtn===undefined");
			this.errOcrd = true;
			return null;
		}
		if (a === null)
		{
			console.log(this.constructor.name + ".getText() error: this.anmtn===null");
			this.errOcrd = true;
			return null;
		}
		const txt = a.getText();
		if (txt === null)
		{
			console.log(this.constructor.name + ".getText() error: this.anmtn.getText() failed");
			this.errOcrd = true;
		}
		return txt;
	}
	matchText(iniTxt, fnlTxt)
	{
		const txt = this.getText();
		if (txt === null)
		{
			console.log(this.constructor.name + ".matchText(" + iniTxt + "," + fnlTxt + ") error: this.getText() failed");
			this.errOcrd = true;
			return null;
		}
		return (txt.iTxt === iniTxt && txt.fTxt === fnlTxt);
	}
	logPreconditions(f)
	{
		let prc, pa, ptxt;
		const txt = this.getText();
		if (txt === null)
		{
			console.log(this.constructor.name + ".logPreconditions() error: this.getText() failed");
			this.errOcrd = true;
			return;
		}
		let j = 0;
		while (j < this.prcndtns.length)
		{
			prc = this.prcndtns[j];
			if (Number.isInteger(prc.idx) == false || fpLess(prc.idx, 0, fpTolerance))
			{
				console.log(this.constructor.name + ".logPreconditions() error: this.prcndtns[" + j.toString() + "].idx is not a whole number");
				this.errOcrd = true;
				return;
			}
			if (prc.seq === undefined)
			{
				console.log(this.constructor.name + ".logPreconditions() error: this.prcndtns[" + j.toString() + "].seq===undefined");
				this.errOcrd = true;
				return;
			}
			if (prc.seq === null)
			{
				console.log(this.constructor.name + ".logPreconditions() error: this.prcndtns[" + j.toString() + "].seq===null");
				this.errOcrd = true;
				return;
			}
			if (Array.isArray(prc.seq.anmtns) == false)
			{
				console.log(this.constructor.name + ".logPreconditions() error: this.prcndtns[" + j.toString() + "].seq.anmtns is not an array");
				this.errOcrd = true;
				return;
			}
			if (prc.seq.anmtns.length <= prc.idx)
			{
				console.log(this.constructor.name + ".logPreconditions() error: this.prcndtns[" + j.toString() + "].seq.anmtns.length=" +
					prc.seq.anmtns.length.toString() + " <= this.prcndtns[" + j.toString() + "].idx=" + prc.idx.toString());
				this.errOcrd = true;
				return;
			}
			pa = prc.seq.anmtns[prc.idx];
			if (this.constructor.name !== pa.constructor.name)
			{
				console.log(this.constructor.name + ".logPreconditions() error: this.prcndtns[" + j.toString() + "].seq.anmtns[" + prc.idx.toString() + "].constructor.name=" + pa.constructor.name);
				this.errOcrd = true;
				return;
			}
			ptxt = pa.getText();
			if (ptxt === null)
			{
				console.log(this.constructor.name + ".logPreconditions() error: this.prcndtns[" + j.toString() + "].seq.anmtns[" + prc.idx.toString() + "].getText() failed");
				this.errOcrd = true;
				return;
			}
			f(ptxt.iTxt + "->" + ptxt.fTxt + " < " + txt.iTxt + "->" + txt.fTxt);
			j++;
		}
	}
	preconditionsMet()
	{
		if (this.errorOccurred())
			return false;
		let prc, i, f, a, j;
		for (j=0; j<this.prcndtns.length; j++)
		{
			prc = this.prcndtns[j];
			i = prc.seq.index();
			if (i < prc.idx)
				return false; // an awaited animation fragment has not started to execute yet
			if (i > prc.idx)
				continue; // an awaited animation fragment finished (considering that a later one is executing now)
			f = prc.seq.anmtns[i]; // here, i == prc.idx, so check the execution status of the awaited animation fragment
			if (f === null)
			{
				console.log(this.constructor.name + ".preconditionsMet() error: this.prcndtns[" + j.toString() + "].seq.anmtns[" + i.toString() + "]===null");
				this.errOcrd = true;
				return false; // b/c the precondition recorded here is invalid due to a corruption of its supporting data
			}
			a = f.anmtn; // animation object (of class AnimateTallyMarkInsertion or AnimateSymbolSubstitutionToFew) referenced in f
			if (a === null)
			{
				console.log(this.constructor.name + ".preconditionsMet() error: this.prcndtns[" + j.toString() + "].seq.anmtns[" + i.toString() + "].anmtn===null");
				this.errOcrd = true;
				return false; // b/c the precondition recorded here is invalid due to a corruption of its supporting data
			}
			if (a.finished == false)
				return false;
		}
		return true;
	}
	started() {return this.strtd;}
	reset()
	{
		this.strtd = false;
		if (this.anmtn === null)
		{
			console.log(this.constructor.name + ".reset() error: this.anmtn===null");
			this.errOcrd = true;
			return false;
		}
		this.anmtn.reset();
	}
	start()
	{
		if (this.errorOccurred())
			return false;
		if (this.anmtn === null)
		{
			console.log(this.constructor.name + ".start() error: this.anmtn===null");
			this.errOcrd = true;
			return false;
		}
		if (this.drawingOnCanvas === null)
		{
			console.log(this.constructor.name + ".start() error: this.drawingOnCanvas===null");
			this.errOcrd = true;
			return false;
		}
		if (this.preconditionsMet())
		{
			this.strtd = true;
			this.anmtn.start(this.drawingOnCanvas.get());
		}
		return true;
	}
	more()
	{
		if (this.errorOccurred())
			return false;
		if (this.anmtn === null)
		{
			console.log(this.constructor.name + ".more() error: this.anmtn===null");
			this.errOcrd = true;
			return false;
		}
		if (this.started()) // anmtn already started?
			return this.anmtn.more(); // if yes, then proceed and return status whether anmtn still executing
		if (this.start()==false) // otherwise, try (again) to start anmtn
		{
			console.log(this.constructor.name + ".more() error: this.start() failed");
			this.errOcrd = true;
			return false;
		}
		return true;
	}
}

class AnimationSequence // array of AnimationFragment objects and index of the one currently executing
{
	anmtns = []; // AnimationFragment objects (assuming they all are for drawing on the same HTML canvas element)
	idx = 0; // index of that element of anmtns which is executing now
	strtd = false; // becomes true when start to execute anmtns array, reset to false when finished
	drawingOnCanvas = null; // ref. to DrawingOnCanvas object which contains the appropriate romanNumerals (text) member
	errOcrd = false;
	constructor(d) {this.drawingOnCanvas = d;}
	errorOccurred() {return this.errOcrd};
	index() {return this.idx;}
	append(a)
	{
		if (this.errorOccurred())
			return;
		if (a === null)
		{
			console.log(this.constructor.name + ".append() error: a===null (this.anmtns.length=" + this.anmtns.length.toString() + ")");
			this.errOcrd = true;
			return false;
		}
		if (("drawingOnCanvas" in a) == false)
		{
			console.log(this.constructor.name + ".append() error: a lacks drawingOnCanvas member (this.anmtns.length=" + this.anmtns.length.toString() + ")");
			this.errOcrd = true;
			return false;
		}
		if (this.drawingOnCanvas === null)
		{
			console.log(this.constructor.name + ".append() error: this.drawingOnCanvas===null (this.anmtns.length=" + this.anmtns.length.toString() + ")");
			this.errOcrd = true;
			return false;
		}
		this.anmtns.push(new AnimationFragment(a, this.drawingOnCanvas));
	}
	logPreconditions(f)
	{
		let i;
		for (i=0; i<this.anmtns.length; i++)
			this.anmtns[i].logPreconditions(f);
	}
	reset()
	{
		if (this.errorOccurred())
			return;
		this.strtd = false;
		this.idx = 0;
		let i;
		for (i=0; i<this.anmtns.length; i++)
			this.anmtns[i].reset();
	}
	started() {return this.strtd;}
	start()
	{
		if (this.errorOccurred())
			return;
		if (this.anmtns.length <= 0)
			return;
		let f = this.anmtns[0];
		if (f === null)
		{
			console.log(this.constructor.name + ".start() error: this.anmtns[0]===null");
			this.errOcrd = true;
			return;
		}
		if (f.start()==false)
		{
			console.log(this.constructor.name + ".start() error: this.anmtns[0].start() failed");
			this.errOcrd = true;
			return; // some failure in this.anmtns[0].start(), so stop executing this AnimationSequence
		}
		this.strtd = true;
	}
	finished() {return (this.started() && (this.idx >= this.anmtns.length));}
	more()
	{
		if (this.errorOccurred())
			return false;
		if (this.anmtns === null)
		{
			console.log(this.constructor.name + ".more() error: this.anmtns===null");
			this.errOcrd = true;
			return false;
		}
		if (this.started()==false)
			return true;
		if (this.finished())
			return false;
		let f = this.anmtns[this.idx];
		if (f === null)
		{
			console.log(this.constructor.name + ".start() error: this.anmtns[" + this.idx.toString() + "]===null (before call to more() method)");
			this.errOcrd = true;
			return;
		}
		if (f.more())
			return true; // anmtns[idx] still executing
		this.idx++; // otherwise, move to the next AnimationFragment object
		if (this.finished())
			return false;
		f = this.anmtns[this.idx];
		if (f === null)
		{
			console.log(this.constructor.name + ".start() error: this.anmtns[" + this.idx.toString() + "]===null (before call to start() method)");
			this.errOcrd = true;
			return;
		}
		if (f.start()==false)
		{
			console.log(this.constructor.name + ".more() error: this.anmtns[" + this.idx.toString() + "].start() failed");
			this.errOcrd = true;
			return false; // some error in this.anmtns[this.idx].start(), so stop executing this AnimationSequence
		}
		return true;
	}
	findFragment(iniTxt, fnlTxt)
	{
		if (this.errorOccurred())
			return null;
		let i = this.findIndex(iniTxt, fnlTxt);
		if (i === null)
		{
			console.log(this.constructor.name + ".findFragment() error: this.findIndex(" + iniTxt + ", " + fnlTxt + ") returned null");
			this.errOcrd = true;
			return null;
		}
		return this.anmtns[i];
	}
	findIndex(iniTxt, fnlTxt)
	{
		if (this.errorOccurred())
			return null;
		let m;
		let i = 0;
		while (i < this.anmtns.length)
		{
			m = this.anmtns[i].matchText(iniTxt, fnlTxt);
			if (m === null)
			{
				console.log(this.constructor.name + ".findIndex(" + iniTxt + "," + fnlTxt + ") error: this.anmtns[" + i.toString() + "].matchText() failed");
				this.errOcrd = true;
				return null;
			}
			if (m == true)
				return i;
			i++;
		}
		return null;
	}
}

const incNumAnmtnsAddtv = new AnimationSequence(romanNumeralsAdditive);
const incNumAnmtnsSbtrctv = new AnimationSequence(romanNumeralsSubtractive);

let mAddtvInI = new Fade(romanNumeralsAdditive, null, "I");
let mIIIIItoV = new MetamorphoseIIIIItoV(romanNumeralsAdditive);
let mVVtoX = new MetamorphoseVVtoX(romanNumeralsAdditive);
let mXXXXXtoL = new Fade(romanNumeralsAdditive, "XXXXX", "L");
let mLLtoC = new Fade(romanNumeralsAdditive, "LL", "C");
let mCCCCCtoD = new Fade(romanNumeralsAdditive, "CCCCC", "D");
let mDDtoM = new Fade(romanNumeralsAdditive, "DD", "M");
incNumAnmtnsAddtv.append(new AnimateTallyMarkInsertion(mAddtvInI));
incNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToFew(mIIIIItoV));
incNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToFew(mVVtoX));
incNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToFew(mXXXXXtoL));
incNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToFew(mLLtoC));
incNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToFew(mCCCCCtoD));
incNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToFew(mDDtoM));

let mSbtrctvInI = new Fade(romanNumeralsSubtractive, null, "I");
let mVIIIItoIX = new Fade(romanNumeralsSubtractive, "VIIII", "IX");
let mIIIItoIV = new Fade(romanNumeralsSubtractive, "IIII", "IV");
let mIVItoV = new Fade(romanNumeralsSubtractive, "IVI", "V");
let mIXItoX = new Fade(romanNumeralsSubtractive, "IXI", "X");
let mLXXXXtoXC = new Fade(romanNumeralsSubtractive, "LXXXX", "XC");
let mXXXXtoXL = new Fade(romanNumeralsSubtractive, "XXXX", "XL");
let mXLXtoL = new Fade(romanNumeralsSubtractive, "XLX", "L");
let mXCXtoC = new Fade(romanNumeralsSubtractive, "XCX", "C");
let mDCCCCtoCM = new Fade(romanNumeralsSubtractive, "DCCCC", "CM");
let mCCCCtoCD = new Fade(romanNumeralsSubtractive, "CCCC", "CD");
let mCDCtoD = new Fade(romanNumeralsSubtractive, "CDC", "D");
let mCMCtoM = new Fade(romanNumeralsSubtractive, "CMC", "M");
incNumAnmtnsSbtrctv.append(new AnimateTallyMarkInsertion(mSbtrctvInI));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mVIIIItoIX));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mIIIItoIV));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mIVItoV));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mIXItoX));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mLXXXXtoXC));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mXXXXtoXL));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mXLXtoL));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mXCXtoC));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mDCCCCtoCM));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mCCCCtoCD));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mCDCtoD));
incNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mCMCtoM));

let mTallyInI = new Fade(tally, null, "I");
mTallyInI.setDrawings(null, drawTallyMark);
let insertTally = new AnimateTallyMarkInsertion(mTallyInI);
insertTally.setDrawing(drawTally);
let mShrinkAndRotateIIIII = new ShrinkAndRotateIIIII(tally, drawTally, drawBox5); // >>> EXPERIMENTAL <<<
let aBoxIIIII = new AnimateSymbolSubstitutionToFew(mShrinkAndRotateIIIII); // >>> EXPERIMENTAL <<<
aBoxIIIII.setDrawings(drawTally, drawBox5); // >>> EXPERIMENTAL <<<
let mFivesToTen = new MergeVerticallyTwoHorizontallyAdjacentBoxes(tally, "VV", "X", drawTally); // >>> EXPERIMENTAL <<<
let aFivesToTen = new AnimateSymbolSubstitutionToFew(mFivesToTen); // >>> EXPERIMENTAL <<<
aFivesToTen.setDrawings(drawTally, drawBox10); // >>> EXPERIMENTAL <<<

function incNumAnmtnsConstraints()
{
	let f = incNumAnmtnsSbtrctv.findFragment("IVI", "V");
	if (f === null)
		console.log('failed in incNumAnmtnsSbtrctv.findFragment("IVI", "V")');
	else if (f.after(incNumAnmtnsAddtv, "IIIII", "V") == false)
		console.log('failed in f.after(incNumAnmtnsAddtv, "IIIII", "V")');

	f = incNumAnmtnsSbtrctv.findFragment("IXI", "X");
	if (f === null)
		console.log('failed in incNumAnmtnsSbtrctv.findFragment("IXI", "X")');
	else if (f.after(incNumAnmtnsAddtv, "VV", "X") == false)
		console.log('failed in f.after(incNumAnmtnsAddtv, "VV", "X")');

	f = incNumAnmtnsAddtv.findFragment("XXXXX", "L");
	if (f === null)
		console.log('failed in incNumAnmtnsAddtv.findFragment("XXXXX", "L")');
	else if (f.after(incNumAnmtnsSbtrctv, "IXI", "X") == false)
		console.log('failed in f.after(incNumAnmtnsSbtrctv, "IXI", "X")');

	f = incNumAnmtnsSbtrctv.findFragment("XLX", "L");
	if (f === null)
		console.log('failed in incNumAnmtnsSbtrctv.findFragment("XLX", "L")');
	else if (f.after(incNumAnmtnsAddtv, "XXXXX", "L") == false)
		console.log('failed in f.after(incNumAnmtnsAddtv, "XXXXX", "L")');

	f = incNumAnmtnsSbtrctv.findFragment("XCX", "C");
	if (f === null)
		console.log('failed in incNumAnmtnsSbtrctv.findFragment("XCX", "C")');
	else if (f.after(incNumAnmtnsAddtv, "LL", "C") == false)
		console.log('failed in f.after(incNumAnmtnsAddtv, "LL", "C")');

	f = incNumAnmtnsAddtv.findFragment("CCCCC", "D");
	if (f === null)
		console.log('failed in incNumAnmtnsAddtv.findFragment("CCCCC", "D")');
	else if (f.after(incNumAnmtnsSbtrctv, "XCX", "C") == false)
		console.log('failed in f.after(incNumAnmtnsSbtrctv, "XCX", "C")');

	f = incNumAnmtnsSbtrctv.findFragment("CDC", "D");
	if (f === null)
		console.log('failed in incNumAnmtnsSbtrctv.findFragment("CDC", "D")');
	else if (f.after(incNumAnmtnsAddtv, "CCCCC", "D") == false)
		console.log('failed in f.after(incNumAnmtnsAddtv, "CCCCC", "D")');

	f = incNumAnmtnsSbtrctv.findFragment("CMC", "M");
	if (f === null)
		console.log('failed in incNumAnmtnsSbtrctv.findFragment("CMC", "M")');
	else if (f.after(incNumAnmtnsAddtv, "DD", "M") == false)
		console.log('failed in f.after(incNumAnmtnsAddtv, "DD", "M")');
}

let incrementTallyAnimationState = 0; // >>> EXPERIMENTAL <<<

function incrementNumber()
{
	if (incNumAnmtnsAddtv.errorOccurred() || incNumAnmtnsSbtrctv.errorOccurred())
		return;
	if (incNumAnmtnsAddtv.started()==false && incNumAnmtnsSbtrctv.started()==false)
	{
		if (inputNumber >= largestNumberToDisplay)
			return;
		if (incrementOrDecrementExecuting)
			return;
		disableButtons(true);
		eraseDrawings();
		incNumAnmtnsAddtv.start();
		incNumAnmtnsSbtrctv.start();
		insertTally.start(tally.get()); // >>> EXPERIMENTAL <<<
	}
	else
	{
		incNumAnmtnsAddtv.more();
		incNumAnmtnsSbtrctv.more();
		if (incrementTallyAnimationState == 0) // >>> EXPERIMENTAL <<<
		{ // >>> EXPERIMENTAL <<<
			if (insertTally.more() == false) // >>> EXPERIMENTAL <<<
			{ // >>> EXPERIMENTAL <<<
				aBoxIIIII.start(tally.get()); // >>> EXPERIMENTAL <<<
				incrementTallyAnimationState++; // >>> EXPERIMENTAL <<<
			} // >>> EXPERIMENTAL <<<
		} // >>> EXPERIMENTAL <<<
		else if (incrementTallyAnimationState == 1) // >>> EXPERIMENTAL <<<
		{ // >>> EXPERIMENTAL <<<
			if (aBoxIIIII.more() == false) // >>> EXPERIMENTAL <<<
			{ // >>> EXPERIMENTAL <<<
				aFivesToTen.start(tally.get()); // >>> EXPERIMENTAL <<<
				incrementTallyAnimationState++; // >>> EXPERIMENTAL <<<
			} // >>> EXPERIMENTAL <<<
		} // >>> EXPERIMENTAL <<<
		else if (incrementTallyAnimationState == 2) // >>> EXPERIMENTAL <<<
		{ // >>> EXPERIMENTAL <<<
			if (aFivesToTen.more() == false) // >>> EXPERIMENTAL <<<
			{ // >>> EXPERIMENTAL <<<
				//aTensToFifty.start(tally.get()); // >>> EXPERIMENTAL <<<
				incrementTallyAnimationState++; // >>> EXPERIMENTAL <<<
			} // >>> EXPERIMENTAL <<<
		} // >>> EXPERIMENTAL <<<
	}
	if (incNumAnmtnsAddtv.finished() && incNumAnmtnsSbtrctv.finished())
	{ // reset() method changes the internal state read by finished() accessor...
		incNumAnmtnsAddtv.reset(); //...so call it only (immediately) after _both_ animation sequences finish,...
		incNumAnmtnsSbtrctv.reset(); //...otherwise this branch of this if-statement will never be executed
		insertTally.reset();
		aBoxIIIII.reset(); // >>> EXPERIMENTAL <<<
		aFivesToTen.reset(); // >>> EXPERIMENTAL <<<
		incrementTallyAnimationState = 0; // >>> EXPERIMENTAL <<<
		inputNumber++;
		setNumber();
	}
	else
		window.requestAnimationFrame(incrementNumber);
}

let mAddtvOutI = new Fade(romanNumeralsAdditive, "I", null);
const decNumAnmtnsAddtv = new AnimationSequence(romanNumeralsAdditive);
decNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToMany(mDDtoM));
decNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToMany(mCCCCCtoD));
decNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToMany(mLLtoC));
decNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToMany(mXXXXXtoL));
decNumAnmtnsAddtv.append(new MetamorphoseXtoVV(mVVtoX));
decNumAnmtnsAddtv.append(new MetamorphoseVtoIIIII(mIIIIItoV));
decNumAnmtnsAddtv.append(new AnimateSymbolSubstitutionToFew(mAddtvOutI));

let mSbtrctvOutI = new Fade(romanNumeralsSubtractive, "I", null);
const decNumAnmtnsSbtrctv = new AnimationSequence(romanNumeralsSubtractive);
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mDCCCCtoCM));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mCMCtoM));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mCCCCtoCD));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mCDCtoD));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mLXXXXtoXC));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mXCXtoC));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mXXXXtoXL));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mXLXtoL));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mVIIIItoIX));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mIXItoX));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mIIIItoIV));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToMany(mIVItoV));
decNumAnmtnsSbtrctv.append(new AnimateSymbolSubstitutionToFew(mSbtrctvOutI));

let mTallyOutI = new Fade(tally, "I", null);
mTallyOutI.setDrawings(drawTallyMark, null);
let removeTally = new AnimateSymbolSubstitutionToFew(mTallyOutI);
removeTally.setDrawings(drawTally, null);

function decNumAnmtnsConstraints()
{
	let f = decNumAnmtnsSbtrctv.findFragment("M", "CMC");
	if (f === null)
		console.log('failed in decNumAnmtnsSbtrctv.findFragment("M", "CMC")');
	else if (f.after(decNumAnmtnsAddtv, "D", "CCCCC") == false)
		console.log('failed in f.after(decNumAnmtnsAddtv, "D", "CCCCC")');

	f = decNumAnmtnsAddtv.findFragment("C", "LL");
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("C", "LL")');
	else if (f.after(decNumAnmtnsSbtrctv, "M", "CMC") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "M", "CMC")');

	f = decNumAnmtnsAddtv.findFragment("C", "LL");
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("C", "LL")');
	else if (f.after(decNumAnmtnsSbtrctv, "CM", "DCCCC") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "CM", "DCCCC")');

	f = decNumAnmtnsSbtrctv.findFragment("D", "CDC");
	if (f === null)
		console.log('failed in decNumAnmtnsSbtrctv.findFragment("D", "CDC")');
	else if (f.after(decNumAnmtnsAddtv, "D", "CCCCC") == false)
		console.log('failed in f.after(decNumAnmtnsAddtv, "D", "CCCCC")');

	f = decNumAnmtnsAddtv.findFragment("C", "LL");
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("C", "LL")');
	else if (f.after(decNumAnmtnsSbtrctv, "D", "CDC") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "D", "CDC")');

	f = decNumAnmtnsAddtv.findFragment("C", "LL");
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("C", "LL")');
	else if (f.after(decNumAnmtnsSbtrctv, "CD", "CCCC") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "CD", "CCCC")');

	f = decNumAnmtnsAddtv.findFragment("X", "VV");
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("X", "VV")');
	else if (f.after(decNumAnmtnsSbtrctv, "XC", "LXXXX") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "XC", "LXXXX")');

	f = decNumAnmtnsSbtrctv.findFragment("C", "XCX");
	if (f === null)
		console.log('failed in decNumAnmtnsSbtrctv.findFragment("C", "XCX")');
	else if (f.after(decNumAnmtnsAddtv, "L", "XXXXX") == false)
		console.log('failed in f.after(decNumAnmtnsAddtv, "L", "XXXXX")');

	f = decNumAnmtnsAddtv.findFragment("X", "VV");
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("X", "VV")');
	else if (f.after(decNumAnmtnsSbtrctv, "C", "XCX") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "C", "XCX")');

	f = decNumAnmtnsSbtrctv.findFragment("L", "XLX");
	if (f === null)
		console.log('failed in decNumAnmtnsSbtrctv.findFragment("L", "XLX")');
	else if (f.after(decNumAnmtnsAddtv, "L", "XXXXX") == false)
		console.log('failed in f.after(decNumAnmtnsAddtv, "L", "XXXXX")');

	f = decNumAnmtnsAddtv.findFragment("X", "VV");
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("X", "VV")');
	else if (f.after(decNumAnmtnsSbtrctv, "L", "XLX") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "L", "XLX")');

	f = decNumAnmtnsAddtv.findFragment("X", "VV");
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("X", "VV")');
	else if (f.after(decNumAnmtnsSbtrctv, "XL", "XXXX") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "XL", "XXXX")');

	f = decNumAnmtnsSbtrctv.findFragment("X", "IXI");
	if (f === null)
		console.log('failed in decNumAnmtnsSbtrctv.findFragment("X", "IXI")');
	else if (f.after(decNumAnmtnsAddtv, "V", "IIIII") == false)
		console.log('failed in f.after(decNumAnmtnsAddtv, "V", "IIIII")');

	f = decNumAnmtnsSbtrctv.findFragment("V", "IVI");
	if (f === null)
		console.log('failed in decNumAnmtnsSbtrctv.findFragment("V", "IVI")');
	else if (f.after(decNumAnmtnsAddtv, "V", "IIIII") == false)
		console.log('failed in f.after(decNumAnmtnsAddtv, "V", "IIIII")');

	f = decNumAnmtnsAddtv.findFragment("I", null);
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("I", null)');
	else if (f.after(decNumAnmtnsSbtrctv, "IX", "VIIII") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "IX", "VIIII")');

	f = decNumAnmtnsAddtv.findFragment("I", null);
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("I", null)');
	else if (f.after(decNumAnmtnsSbtrctv, "IV", "IIII") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "IV", "IIII")');

	f = decNumAnmtnsAddtv.findFragment("I", null);
	if (f === null)
		console.log('failed in decNumAnmtnsAddtv.findFragment("I", null)');
	else if (f.after(decNumAnmtnsSbtrctv, "V", "IVI") == false)
		console.log('failed in f.after(decNumAnmtnsSbtrctv, "V", "IVI")');
}

function decrementNumber()
{
	if (decNumAnmtnsAddtv.errorOccurred() || decNumAnmtnsSbtrctv.errorOccurred())
		return;
	if (decNumAnmtnsAddtv.started()==false && decNumAnmtnsSbtrctv.started()==false)
	{
		if (inputNumber <= smallestNumberToDisplay)
			return;
 		if (incrementOrDecrementExecuting)
			return;
		disableButtons(false);
		eraseDrawings();
		decNumAnmtnsAddtv.start();
		decNumAnmtnsSbtrctv.start();
		removeTally.start(romanNumeralsAdditive.get());
	}
	else
	{
		decNumAnmtnsAddtv.more();
		decNumAnmtnsSbtrctv.more();
		removeTally.more();
	}
	if (decNumAnmtnsAddtv.finished() && decNumAnmtnsSbtrctv.finished())
	{ // reset() method changes the internal state read by finished() accessor...
		decNumAnmtnsAddtv.reset(); //...so call reset() only (immediately) after _both_ animation sequences finish,...
		decNumAnmtnsSbtrctv.reset(); //...otherwise this branch of this if-statement will never be executed
		removeTally.reset();
		inputNumber--;
		setNumber();
	}
	else
		window.requestAnimationFrame(decrementNumber);
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

incNumAnmtnsConstraints();
incNumAnmtnsAddtv.logPreconditions((s)=>{console.log(s)});
incNumAnmtnsSbtrctv.logPreconditions((s)=>{console.log(s)});
decNumAnmtnsConstraints();
decNumAnmtnsAddtv.logPreconditions((s)=>{console.log(s)});
decNumAnmtnsSbtrctv.logPreconditions((s)=>{console.log(s)});

initializeCanvas(romanToArabicConnectorCanvas, true);
romanNumeralsSubtractive.initializeCanvas();
initializeCanvas(romanAdditiveToSubtractiveConnectorCanvas, true);
romanNumeralsAdditive.initializeCanvas();
initializeCanvas(romanToTallyConnectorCanvas, false);
tally.initializeCanvas();
//testCanvas();
setNumber(0);
//the code to bind keyup listener to input text element is based on example from
//https://blog.devgenius.io/how-to-detect-the-pressing-of-the-enter-key-in-a-text-input-field-with-javascript-380fb2be2b9e
arabicNumeralsElement.addEventListener("keyup",
	(event) => {if (event.keyCode === 13) processNumberArabic();});
