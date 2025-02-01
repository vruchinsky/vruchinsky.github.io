const largestNumberToDisplay = 4999;
const emptySetSymbol = "\u2205"; // hex code for empty-set symbol in unicode

const arabicNumeralsElement = document.getElementById("DisplayArabic");
const arabicNumeralsWithSpacesElement = document.getElementById("DisplayArabicWithSpaces");
const romanToArabicConnectorElement = document.getElementById("ConnectRomanToArabic");
const romanNumeralsElement = document.getElementById("DisplayRoman");
const romanNumeralsWithSpacesElement = document.getElementById("DisplayRomanWithSpaces");
const incrementButton = document.getElementById("incrementButton");
const decrementButton = document.getElementById("decrementButton");
const talliesCanvas = document.getElementById("tallies");

let inputNumber = 0;
let incrementOrDecrementExecuting = false;

function initializeCanvas()
{
	if (talliesCanvas.getContext == null)
		return;
	const ctx = talliesCanvas.getContext("2d");
	const rect = talliesCanvas.getBoundingClientRect();
	talliesCanvas.width = rect.width; // otherwise canvas width&height can be some arbitrary (possibly wrong) values
	talliesCanvas.height = rect.height; //...and supposedly thin vertical lines look thick & shorter than horizontal lines supposedly of the same length
	// the above problem&solution are discussed on https://stackoverflow.com/questions/35331128/incorrect-canvas-width-value
    const style = getComputedStyle(talliesCanvas);
	ctx.font = style.fontSize + " " + style.fontFamily; // otherwise font is some arbitrary default
	// the above solution is from code posted in https://stackoverflow.com/questions/59666877/how-to-use-in-a-canvas-a-text-element-with-a-font-described-in-css
	// (fragment from function getFontStyle())
	ctx.translate(0.5, 0.5); // otherwise, for lineWidth=1, horizontal&vertical lines look a little thick and blurry
}

function initializeNumber()
{
	inputNumber = 0;
	romanNumeralsElement.textContent = emptySetSymbol;
	arabicNumeralsElement.textContent = inputNumber.toString();
	arabicNumeralsWithSpacesElement.textContent = insertSpacesInArabicNumerals(inputNumber.toString());
	let s = insertSpacesInRomanNumerals(romanNumeralsElement.textContent);
	romanNumeralsWithSpacesElement.textContent = s;
	romanToArabicConnectorElement.textContent = romanToArabicConnector(s);
	initializeCanvas();
	testCanvas();
//	writeTallies(inputNumber);
}

function drawTestPattern(c, scale)
{
	for (let i=0; i<20; i++)
	{
		c.beginPath();
		c.moveTo(3*i / scale, 3*i / scale);
		c.lineTo(3*i / scale, (3*i+100) / scale);
		c.stroke();
		c.beginPath();
		c.moveTo(3*i / scale, 3*i / scale);
		c.lineTo((3*i+100) / scale, 3*i / scale);
		c.stroke();
	}
}

function roundedRect(ctx, x, y, width, height, radius) // draw rectangle with rounded corners
{ // based on https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
	ctx.beginPath();
	if (height < 2*radius) radius = height/2; // avoid arcs protruding outside
	if (width < 2*radius) radius = width/2; // avoid arcs protruding outside
	ctx.moveTo(x, y + radius);
	ctx.arcTo(x, y + height, x + radius, y + height, radius);
	ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
	ctx.arcTo(x + width, y, x + width - radius, y, radius);
	ctx.arcTo(x, y, x, y + radius, radius);
	ctx.stroke();
}

const tallyHeight = 25;
const tallyThickness = 1;
const hSpace = 2;
const vSpace = 3;
const hOffset = 2;
const vOffset = 2;
const boundaryThickness = 1;
const boundaryPadding = 2;
const hSpaceInsideBox = 2;
const halfVspaceInsideBox = Math.ceil(vSpace / 2);

function drawVline(ctx, x, y, l)
{
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x, y + l);
	ctx.stroke();
}

function drawHline(ctx, x, y, l)
{
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

function testCanvas()
{
	if (talliesCanvas.getContext == null)
		return;
	const ctx = talliesCanvas.getContext("2d");
	const canvasStyle = getComputedStyle(talliesCanvas);
	const backgroundColor = canvasStyle.backgroundColor;
	const foregroundColor = canvasStyle.color;
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(-0.5, -0.5, talliesCanvas.width, talliesCanvas.height); // clear the canvas
	ctx.fillStyle = foregroundColor;
	ctx.strokeStyle = foregroundColor;
	ctx.lineWidth = 1;
	//drawTestPattern(ctx, 1);
	const testText = "MDCLXVI";
	const textMetrics = ctx.measureText(testText);
	const textHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
	const textHpos = talliesCanvas.width - textMetrics.width - boundaryPadding - boundaryThickness - hOffset;
	const textVpos = textMetrics.fontBoundingBoxAscent + boundaryThickness + boundaryPadding + vOffset;
	const boundaryWidth = textMetrics.width + 2*boundaryPadding + boundaryThickness;
	const boundaryHeight = textHeight + 2*boundaryPadding + boundaryThickness;
	const boundaryHpos = textHpos - boundaryPadding - boundaryThickness;
	console.log("text width=" + textMetrics.width.toString());
	console.log("text height=" + textHeight.toString());
	console.log("text hpos=" + textHpos.toString());
	console.log("text vpos=" + textVpos.toString());
	console.log("boundary hpos=" + boundaryHpos.toString());
	console.log("boundary width=" + boundaryWidth.toString());
	console.log("boundary height=" + boundaryHeight.toString());
	ctx.fillText(testText, textHpos, textVpos);
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, boundaryHpos, vOffset, boundaryWidth, boundaryHeight, 2);
	ctx.lineWidth = 1;
	let tw = stringWidthOnCanvas(ctx, "I");
	drawTally(ctx, boundaryHpos - Math.floor(tw), vOffset);
	drawTally(ctx, boundaryHpos - Math.floor(2*tw), vOffset);
	drawTally(ctx, boundaryHpos - Math.floor(3*tw), vOffset);
	console.log("tally width=" + tw.toString());
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, boundaryHpos, vOffset + boundaryHeight + 5, boundaryWidth, 5, 2);
	roundedRect(ctx, boundaryHpos, vOffset + boundaryHeight + 20, boundaryWidth, 4, 2);
	roundedRect(ctx, boundaryHpos, vOffset + boundaryHeight + 30, boundaryWidth, 3, 2);
	roundedRect(ctx, boundaryHpos, vOffset + boundaryHeight + 40, boundaryWidth, 2, 2);
	roundedRect(ctx, boundaryHpos, vOffset + boundaryHeight + 50, boundaryWidth, 1, 2);
	roundedRect(ctx, boundaryHpos, vOffset + boundaryHeight + 60, boundaryWidth, 0, 2);
	drawBox5(ctx, boundaryHpos, vOffset + boundaryHeight + 70);
	drawBox10(ctx, boundaryHpos + 30, vOffset + boundaryHeight + 70);
	drawBox5(ctx, boundaryHpos + 60, vOffset + boundaryHeight + 70);
	drawBox10(ctx, boundaryHpos + 90, vOffset + boundaryHeight + 70);
	drawBox50(ctx, boundaryHpos - 60, vOffset);
	drawBox100(ctx, boundaryHpos - 80, vOffset);
	drawBox500(ctx, 10, vOffset);
/* 	drawBox100(ctx, boundaryHpos - 115, vOffset);
	drawBox100(ctx, boundaryHpos - 130, vOffset);
	drawBox100(ctx, boundaryHpos - 145, vOffset);
	drawBox100(ctx, boundaryHpos - 160, vOffset); */
}

function stringWidthOnCanvas(ctx, s)
{
	const metrics = ctx.measureText(s);
	return metrics.width;
}

function drawTally(ctx, x, y)
{
	const w = stringWidthOnCanvas(ctx, "I");
	ctx.lineWidth = tallyThickness;
	drawVline(ctx, x + Math.floor(w/2), y, tallyHeight);
	return w;
}

function weightedAverageTruncated(a, b, w) {return Math.floor((1-w)*a + w*b);}
const foregroundWeightBoxBoundary = 0.3;

function setBoxBoundaryColor(ctx, foregroundWeight)
{
	const canvasStyle = getComputedStyle(talliesCanvas);
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
		y = y + vSpace + tallyThickness;
	}
	return (n*tallyThickness + (n-1)*vSpace); // column height
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
	const foregroundColor = setBoxBoundaryColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, 2);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	return {boxWidth, boundingRectHeight};
}

function drawBox10(ctx, x, y)
{
	const boxWidth = Math.floor(stringWidthOnCanvas(ctx, "X"));
	const boundingRectWidth = boxWidth - 2*boundaryThickness;
	const lineLength = boundingRectWidth - 2*boundaryPadding - 2*boundaryThickness;
	const lineHpos = x + boundaryPadding + boundaryThickness;
	let lineVpos = y + boundaryPadding + boundaryThickness;
	const columnHeight1 = drawColumnHlines(ctx, lineHpos, lineVpos, lineLength, 5); // column of five horizontal,
	lineVpos = lineVpos + columnHeight1 + 2*vSpace; // then space underneath,
	const columnHeight2 = drawColumnHlines(ctx, lineHpos, lineVpos, lineLength, 5); // then another column of five horizontal
	const boundingRectHeight = columnHeight1 + columnHeight2 + 2*vSpace + 2*boundaryPadding + boundaryThickness;
	const foregroundColor = setBoxBoundaryColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, 2);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	return {boxWidth, boundingRectHeight};
}

function drawColumn50Hlines(ctx, x, y, len)
{ // used in drawBox50(), drawBox100() and drawColumn100Hlines()
	const xr = x + len + hSpaceInsideBox; // offset right column horizontally
	let columnHeight = 0;
	for (let i=0; i<5; i++)
	{
		const dHeight = drawColumnHlines(ctx, x, y, len, 5); // left column of five horizontal,
		drawColumnHlines(ctx, xr, y + halfVspaceInsideBox, len, 5); // right column (offset horizontally&vertically),
		y = y + dHeight + 2*vSpace; // regular vertical spacing (for visual clarity)
		columnHeight = columnHeight + dHeight + 2*vSpace;
	}
	const w = 2*len + hSpaceInsideBox;  // width of the drawing
	const h = columnHeight + halfVspaceInsideBox - 2*vSpace; // height of the drawing
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
	const foregroundColor = setBoxBoundaryColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, 2);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawColumn100Hlines(ctx, x, y, len)
{ // used in drawBox100() and drawBox500()
	const columnSize1 = drawColumn50Hlines(ctx, x, y, len); // column of 50 horizontal tally marks,
	y = y + columnSize1.h + 2*vSpace; // extra space halfway down,
	const columnSize2 = drawColumn50Hlines(ctx, x, y, len); // another column of 50 horizontal tally marks underneath
	const w = columnSize1.w;  // width of the drawing
	const h = columnSize1.h + columnSize2.h + 2*vSpace; // height of the drawing	
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
	const foregroundColor = setBoxBoundaryColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, 2);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function drawBox500(ctx, x, y) // 10 columns each of 50 short horizontal tally marks, with extra vertical...
{//...space between each group of 5, and extra space halfway down, all enclosed in rectangular box
	const rnWidth = Math.floor(stringWidthOnCanvas(ctx, "D"));
	const boxWidth = 5 * rnWidth; // 2 columns same width as 1 Roman numeral
	const boundingRectWidth = boxWidth - 2*boundaryThickness;
	const lineLength = rnWidth/2 - boundaryPadding - boundaryThickness - 1;
	let lineHpos = x + boundaryPadding + boundaryThickness; // left column horizontal position
	const lineVpos = y + boundaryPadding + boundaryThickness; // left column vertical position
	const columnSize = drawColumn100Hlines(ctx, lineHpos, lineVpos, lineLength);
	const dHpos = Math.floor(columnSize.w + 2.5*hSpaceInsideBox);
	lineHpos = lineHpos + dHpos; // move horizontal position
	drawColumn100Hlines(ctx, lineHpos, lineVpos, lineLength);
	lineHpos = lineHpos + dHpos; // move horizontal position
	drawColumn100Hlines(ctx, lineHpos, lineVpos, lineLength);
	lineHpos = lineHpos + dHpos; // move horizontal position
	drawColumn100Hlines(ctx, lineHpos, lineVpos, lineLength);
	lineHpos = lineHpos + dHpos; // move horizontal position
	drawColumn100Hlines(ctx, lineHpos, lineVpos, lineLength);
	const boundingRectHeight = columnSize.h + 2*boundaryPadding; // same as for 100
	const foregroundColor = setBoxBoundaryColor(ctx, foregroundWeightBoxBoundary);
	const oldlw = ctx.lineWidth;
	ctx.lineWidth = boundaryThickness;
	roundedRect(ctx, x, y, boundingRectWidth, boundingRectHeight, 2);
	ctx.lineWidth = oldlw; // restore lineWidth
	ctx.strokeStyle = foregroundColor; // restore foreground color
	const w = boxWidth;  // width of the drawing
	const h = boundingRectHeight; // height of the drawing
	return {w, h};
}

function writeTallies(n)
{
	if (talliesCanvas.getContext == null)
	{ // fallback in case browser does not support canvas
		let tallyMark = "|"; // simplest: write out the tally marks
		talliesCanvas.textContent = tallyMark.repeat(n);
		return;
	}
	const ctx = talliesCanvas.getContext("2d");
	const canvasStyle = getComputedStyle(talliesCanvas);
	const backgroundColor = canvasStyle.backgroundColor;
	const foregroundColor = canvasStyle.color;
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(-0.5, -0.5, talliesCanvas.width, talliesCanvas.height); // clear the canvas
	ctx.fillStyle = foregroundColor;
	if (n === 0)
	{
		const textMetrics = ctx.measureText(emptySetSymbol);
		const textHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
		ctx.fillText(emptySetSymbol, talliesCanvas.width - textMetrics.width, textHeight);
		return;
	}
	ctx.strokeStyle = foregroundColor;
	ctx.lineWidth = tallyThickness;
	let x = talliesCanvas.width;
	let y = vOffset;
	let nw = stringWidthOnCanvas(ctx, "I");
	let r = n % 5;
	for (let i=0; i<r; i++)
	{
		x = x - nw;
		drawTally(ctx, Math.floor(x), y);
	}
	n = Math.floor(n / 5);
	nw = stringWidthOnCanvas(ctx, "V");
	r = n % 2;
	if (r > 0)
	{
		x = x - nw;
		drawBox5(ctx, Math.floor(x), y);
	}
	n = Math.floor(n / 2);
	nw = stringWidthOnCanvas(ctx, "X");
	r = n % 5;
	for (let i=0; i<r; i++)
	{
		x = x - nw;
		drawBox10(ctx, Math.floor(x), y);
	}
	n = Math.floor(n / 5);
	nw = stringWidthOnCanvas(ctx, "L");
	r = n % 2;
	if (r > 0)
	{
		x = x - nw;
		drawBox50(ctx, Math.floor(x), y);
	}
	n = Math.floor(n / 2);
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

function removeLeadingWhiteSpace(s)
{
	while (s.length > 0 && s[0] === ' ')
		s = s.substring(1); // remove leading spaces
	return s;
}

function removeTrailingWhiteSpace(s)
{
	while (s.length > 0 && s[s.length-1] === ' ')
		s = s.substring(0,s.length-1); // remove trailing spaces
	return s;
}

function insertSpacesInRomanNumerals(s)
{
	s = removeLeadingWhiteSpace(s);
	s = removeTrailingWhiteSpace(s);
	if (s.length < 1) return "";
	if (s === emptySetSymbol) return emptySetSymbol;
	let r = "";
	for (let i=0; i<s.length; i++)
	{
		let c = s[i];
		r += c; // copy each numeral
		let oc = orderOfMagnitude(c);
		let on = orderOfMagnitude(s.substring(i+1));
		let od = oc - on;
		while (od > 1) // and check whether to insert
		{ // spaces for lower orders of magnitude
			r += " ";
			od--;
		}
	}
	return r;
}

function insertSpacesInArabicNumerals(s)
{
	s = removeLeadingWhiteSpace(s);
	s = removeTrailingWhiteSpace(s);
	if (s.length < 1) return "";
	let r = "";
	for (let i=0; i<s.length; i++)
	{
		let c = s[i];
		r += c; // copy each numeral
		if (i+1 < s.length)
		{
			switch(Number(s[i+1]))
			{
				case 2:
				case 6: r += "\u2194"; break; // left-right arrow
				case 3:
				case 7: r += "\u2190\u2192"; break; // left arrow, right arrow
				case 4:
				case 8: r += "\u2190\u2014\u2192"; break; // left arrow, horizontal line, right arrow
				case 9: r += "\u2190\u2014\u2014\u2192"; break;
			}
		}
	}
	return r;
}

function romanToArabicConnector(s)
{
	if (s.length < 1) return "";
	if (s === emptySetSymbol) return "";
	let r = "";
	for (let i=0; i<s.length; i++)
	{
		let c = s[i];
		if (c === " ")
			r += c; // copy space
		else
		{
			let oc = orderOfMagnitude(c);
			let on = orderOfMagnitude(s.substring(i+1));
			r += ((oc==on) ? "\u0337" : "\u2191"); // 2191 = hex code for unicode upward arrow
		} // and 0337 = hex code for unicode forward slash
	}
	return r;
}

const buttonNormalColor = "#E0E0E0";
const buttonDisabledColor = "#707070";
const buttonsPressedColor = "#A0A0A0";
const buttonHoverColor = "#C0C0C0";

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
	arabicNumeralsWithSpacesElement.style.cursor = 'progress';
	romanToArabicConnectorElement.style.cursor = 'progress';
	romanNumeralsElement.style.cursor = 'progress';
	romanNumeralsWithSpacesElement.style.cursor = 'progress';
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
	arabicNumeralsWithSpacesElement.style.cursor = 'default';
	romanToArabicConnectorElement.style.cursor = 'default';
	romanNumeralsElement.style.cursor = 'default';
	romanNumeralsWithSpacesElement.style.cursor = 'default';
}

async function incrementNumber()
{
	if (inputNumber >= largestNumberToDisplay) return;
	if (incrementOrDecrementExecuting) return;
	disableButtons(true);
	arabicNumeralsElement.textContent = "";
	arabicNumeralsWithSpacesElement.textContent = "";
	romanNumeralsWithSpacesElement.textContent = "";
	romanToArabicConnectorElement.textContent = "";
	await pause(minimumPauseTime);
	if (inputNumber == 0)
		romanNumeralsElement.textContent = "";
	inputNumber++;
    romanNumeralsElement.textContent += "I";
	let s = replaceLastChars(romanNumeralsElement.textContent, "IIIII", "\\ ////");
	if (s != null)
	{ // IIIII -> V multistep text-character-based animation
		await pause(intermediateReplacementPauseTime);
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\\ ////", "\\/");
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\\/", "V");
		romanNumeralsElement.textContent = s;
	}
 	s = replaceLastChars(romanNumeralsElement.textContent, "VV", "\u039bV"); // \u039b = capital letter lambda
	if (s != null)
	{ // VV -> X multistep text-character-based animation
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\u039bV", "\u1D27\u2C7D"); // \u1D27 = small capital letter lambda
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\u1D27\u2C7D", "X"); // \u2C7D = superscript letter v
		romanNumeralsElement.textContent = s;
	}
	s = replaceLastChars(romanNumeralsElement.textContent, "XXXXX", "L");
	if (s != null) {await pause(replacementPauseTime); romanNumeralsElement.textContent = s;}
 	s = replaceLastChars(romanNumeralsElement.textContent, "LL", "\u0393L"); // \u0393 = capital letter gamma
	if (s != null)
	{ // LL -> C multistep text-character-based animation
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\u0393L", "\u228f"); // \u228f = square subset symbol
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\u228f", "C");
		romanNumeralsElement.textContent = s;
	}
	s = replaceLastChars(romanNumeralsElement.textContent, "CCCCC", "D");
	if (s != null) {await pause(replacementPauseTime); romanNumeralsElement.textContent = s;}
 	s = replaceLastChars(romanNumeralsElement.textContent, "DD", "M");
	if (s != null) {await pause(replacementPauseTime); romanNumeralsElement.textContent = s;}
	s = insertSpacesInRomanNumerals(romanNumeralsElement.textContent);
	romanNumeralsWithSpacesElement.textContent = s;
	romanToArabicConnectorElement.textContent = romanToArabicConnector(s);
	arabicNumeralsElement.textContent = inputNumber.toString();
	arabicNumeralsWithSpacesElement.textContent = insertSpacesInArabicNumerals(inputNumber.toString());
	writeTallies(inputNumber);
	reenableButtons();
}

async function decrementNumber()
{
	if (inputNumber <= 0) return;
	if (incrementOrDecrementExecuting) return;
	disableButtons(false);
	arabicNumeralsElement.textContent = "";
	romanNumeralsWithSpacesElement.textContent = "";
	romanToArabicConnectorElement.textContent = "";
	arabicNumeralsWithSpacesElement.textContent = "";
	await pause(minimumPauseTime);
	inputNumber--;
	if (inputNumber == 0)
	{
		romanNumeralsElement.textContent = emptySetSymbol;
		romanNumeralsWithSpacesElement.textContent = emptySetSymbol;
		romanToArabicConnectorElement.textContent = "";
		arabicNumeralsElement.textContent = inputNumber.toString();
		arabicNumeralsWithSpacesElement.textContent = insertSpacesInArabicNumerals(inputNumber.toString());
		reenableButtons();
		return;
	}
	let s = replaceLastChars(romanNumeralsElement.textContent, "M", "DD");
	if (s != null) {romanNumeralsElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanNumeralsElement.textContent, "D", "CCCCC");
	if (s != null) {romanNumeralsElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanNumeralsElement.textContent, "C", "\u228f"); // \u228f = square subset symbol
	if (s != null)
	{ // C -> LL multistep text-character-based animation
		romanNumeralsElement.textContent = s;
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanNumeralsElement.textContent, "\u228f", "\u0393L"); // \u0393 = capital letter gamma
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\u0393L", "LL");
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
	}
	s = replaceLastChars(romanNumeralsElement.textContent, "L", "XXXXX");
	if (s != null) {romanNumeralsElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanNumeralsElement.textContent, "X", "\u1D27\u2C7D"); // \u1D27 = small capital letter lambda
	if (s != null)
	{ // X -> VV multistep text-character-based animation
		romanNumeralsElement.textContent = s;
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanNumeralsElement.textContent, "\u1D27\u2C7D", "\u039bV"); // \u2C7D = superscript letter v
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\u039bV", "VV"); // \u039b = capital letter lambda
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
	}
	s = replaceLastChars(romanNumeralsElement.textContent, "V", "\\/");
	if (s != null)
	{ // V -> IIIII multistep text-character-based animation
		romanNumeralsElement.textContent = s;
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanNumeralsElement.textContent, "\\/", "\\ ////");
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanNumeralsElement.textContent, "\\ ////", "IIIII");
		romanNumeralsElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
	}
	s = romanNumeralsElement.textContent;
	romanNumeralsElement.textContent = s.substring(0,s.length-1);
	s = insertSpacesInRomanNumerals(romanNumeralsElement.textContent);
	romanNumeralsWithSpacesElement.textContent = s;
	romanToArabicConnectorElement.textContent = romanToArabicConnector(s);
	arabicNumeralsElement.textContent = inputNumber.toString();
	arabicNumeralsWithSpacesElement.textContent = insertSpacesInArabicNumerals(inputNumber.toString());
	writeTallies(inputNumber);
	reenableButtons();
}

initializeNumber();
