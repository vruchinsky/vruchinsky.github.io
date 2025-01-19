const largestNumberToDisplay = 4999;
const romanTextElement = document.getElementById("DisplayRoman");
const incrementButton = document.getElementById("incrementButton");
const decrementButton = document.getElementById("decrementButton");

let inputNumber = 0;
let incrementOrDecrementExecuting = false;

function initializeNumber()
{
	inputNumber = 0;
	romanTextElement.textContent = "\u2205"; // hex code for empty-set symbol in unicode
}

const replacementPauseTime = 1000; // milliseconds
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
	{ // IIIII -> V step-by-step text-character-based animation
		await pause(replacementPauseTime);
		romanTextElement.textContent = s;
		await pause(replacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\\ ////", "\\/");
		romanTextElement.textContent = s;
		await pause(replacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\\/", "V");
		romanTextElement.textContent = s;
	}
 	s = replaceLastChars(romanTextElement.textContent, "VV", "\u039bV");
	if (s != null)
	{ // VV -> X step-by-step text-character-based animation
		await pause(replacementPauseTime);
		romanTextElement.textContent = s;
		await pause(replacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\u039bV", "X");
		romanTextElement.textContent = s;
	}
	s = replaceLastChars(romanTextElement.textContent, "XXXXX", "L");
	if (s != null) {await pause(replacementPauseTime); romanTextElement.textContent = s;}
 	s = replaceLastChars(romanTextElement.textContent, "LL", "C");
	if (s != null) {await pause(replacementPauseTime); romanTextElement.textContent = s;}
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
		romanTextElement.textContent = "\u2205";
		reenableButtons();
		return;
	}
	let s = replaceLastChars(romanTextElement.textContent, "M", "DD");
	if (s != null) {romanTextElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "D", "CCCCC");
	if (s != null) {romanTextElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "C", "LL");
	if (s != null) {romanTextElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "L", "XXXXX");
	if (s != null) {romanTextElement.textContent = s; await pause(replacementPauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "X", "\u039bV");
	if (s != null)
	{ // X -> VV step-by-step text-character-based animation
		romanTextElement.textContent = s;
		await pause(replacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\u039bV", "VV");
		romanTextElement.textContent = s;
		await pause(replacementPauseTime);
	}
	s = replaceLastChars(romanTextElement.textContent, "V", "\\/");
	if (s != null)
	{ // V -> IIIII step-by-step text-character-based animation
		romanTextElement.textContent = s;
		await pause(replacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\\/", "\\ ////");
		romanTextElement.textContent = s;
		await pause(replacementPauseTime);
		s = replaceLastChars(romanTextElement.textContent, "\\ ////", "IIIII");
		romanTextElement.textContent = s;
		await pause(replacementPauseTime);
	}
	s = romanTextElement.textContent;
	romanTextElement.textContent = s.substring(0,s.length-1);
	reenableButtons();
}

initializeNumber();
