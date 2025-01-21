const largestNumberToDisplay = 4999;
const emptySetSymbol = "\u2205"; // hex code for empty-set symbol in unicode
const romanNumeralsElement = document.getElementById("DisplayRoman");
const romanNumeralsWithSpacesElement = document.getElementById("DisplayRomanWithSpaces");
const incrementButton = document.getElementById("incrementButton");
const decrementButton = document.getElementById("decrementButton");

let inputNumber = 0;
let incrementOrDecrementExecuting = false;

function initializeNumber()
{
	inputNumber = 0;
	romanNumeralsElement.textContent = emptySetSymbol;
	romanNumeralsWithSpacesElement.textContent = emptySetSymbol;
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
	let order = orderOfMagnitude(s[0]);
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
	romanNumeralsElement.style.cursor = 'default';
	romanNumeralsWithSpacesElement.style.cursor = 'default';
}

async function incrementNumber()
{
	if (inputNumber >= largestNumberToDisplay) return;
	if (incrementOrDecrementExecuting) return;
	disableButtons(true);
	romanNumeralsWithSpacesElement.textContent = "";
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
	romanNumeralsWithSpacesElement.textContent = insertSpacesInRomanNumerals(romanNumeralsElement.textContent);
	reenableButtons();
}

async function decrementNumber()
{
	if (inputNumber <= 0) return;
	if (incrementOrDecrementExecuting) return;
	disableButtons(false);
	romanNumeralsWithSpacesElement.textContent = "";
	await pause(minimumPauseTime);
	inputNumber--;
	if (inputNumber == 0)
	{
		romanNumeralsElement.textContent = emptySetSymbol;
		romanNumeralsWithSpacesElement.textContent = emptySetSymbol;
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
	romanNumeralsWithSpacesElement.textContent = insertSpacesInRomanNumerals(romanNumeralsElement.textContent);
	reenableButtons();
}

initializeNumber();
