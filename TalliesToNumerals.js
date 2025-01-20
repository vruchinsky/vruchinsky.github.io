const largestNumberToDisplay = 4999;
const emptySetSymbol = "\u2205"; // hex code for empty-set symbol in unicode
const romanTextElement = document.getElementById("DisplayRoman");
const incrementButton = document.getElementById("incrementButton");
const decrementButton = document.getElementById("decrementButton");

let inputNumber = 0;
let incrementOrDecrementExecuting = false;

function initializeNumber()
{
	inputNumber = 0;
	romanTextElement.textContent = emptySetSymbol;
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
}

async function incrementNumber()
{
	if (inputNumber >= largestNumberToDisplay) return;
	if (incrementOrDecrementExecuting) return;
	disableButtons(true);
	await pause(minimumPauseTime);
	if (inputNumber == 0)
		romanTextElement.textContent = "";
	inputNumber++;
    romanTextElement.textContent += "I";
	let s = replaceLastChars(romanTextElement.textContent, "IIIII", "\\ ////");
	if (s != null)
	{ // IIIII -> V multistep text-character-based animation
		await pause(intermediateReplacementPauseTime);
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\\ ////", "\\/");
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\\/", "V");
		romanTextElement.textContent = s;
	}
 	s = replaceLastChars(romanTextElement.textContent, "VV", "\u039bV"); // \u039b = capital letter lambda
	if (s != null)
	{ // VV -> X multistep text-character-based animation
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\u039bV", "\u1D27\u2C7D"); // \u1D27 = small capital letter lambda
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\u1D27\u2C7D", "X"); // \u2C7D = superscript letter v
		romanTextElement.textContent = s;
	}
	s = replaceLastChars(romanTextElement.textContent, "XXXXX", "L");
	if (s != null) {await pause(replacementPauseTime); romanTextElement.textContent = s;}
 	s = replaceLastChars(romanTextElement.textContent, "LL", "\u0393L"); // \u0393 = capital letter gamma
	if (s != null)
	{ // LL -> C multistep text-character-based animation
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\u0393L", "\u228f"); // \u228f = square subset symbol
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\u228f", "C");
		romanTextElement.textContent = s;
	}
	s = replaceLastChars(romanTextElement.textContent, "CCCCC", "D");
	if (s != null) {await pause(replacementPauseTime); romanTextElement.textContent = s;}
 	s = replaceLastChars(romanTextElement.textContent, "DD", "M");
	if (s != null) {await pause(replacementPauseTime); romanTextElement.textContent = s;}
	reenableButtons();
}

async function decrementNumber()
{
	if (inputNumber <= 0) return;
	if (incrementOrDecrementExecuting) return;
	disableButtons(false);
	await pause(minimumPauseTime);
	inputNumber--;
	if (inputNumber == 0)
	{
		romanTextElement.textContent = emptySetSymbol;
		reenableButtons();
		return;
	}
	let s = replaceLastChars(romanTextElement.textContent, "M", "DD");
	if (s != null) {romanTextElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "D", "CCCCC");
	if (s != null) {romanTextElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "C", "\u228f"); // \u228f = square subset symbol
	if (s != null)
	{ // C -> LL multistep text-character-based animation
		romanTextElement.textContent = s;
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanTextElement.textContent, "\u228f", "\u0393L"); // \u0393 = capital letter gamma
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\u0393L", "LL");
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
	}
	s = replaceLastChars(romanTextElement.textContent, "L", "XXXXX");
	if (s != null) {romanTextElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "X", "\u1D27\u2C7D"); // \u1D27 = small capital letter lambda
	if (s != null)
	{ // X -> VV multistep text-character-based animation
		romanTextElement.textContent = s;
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanTextElement.textContent, "\u1D27\u2C7D", "\u039bV"); // \u2C7D = superscript letter v
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\u039bV", "VV"); // \u039b = capital letter lambda
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
	}
	s = replaceLastChars(romanTextElement.textContent, "V", "\\/");
	if (s != null)
	{ // V -> IIIII multistep text-character-based animation
		romanTextElement.textContent = s;
		await pause(replacementPauseTime); // wait longer before starting this multistep animation
		s = replaceLastChars(romanTextElement.textContent, "\\/", "\\ ////");
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\\ ////", "IIIII");
		romanTextElement.textContent = s;
		await pause(intermediateReplacementPauseTime);
	}
	s = romanTextElement.textContent;
	romanTextElement.textContent = s.substring(0,s.length-1);
	reenableButtons();
}

initializeNumber();
