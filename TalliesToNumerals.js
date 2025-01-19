const largestNumberToDisplay = 4999;
const romanTextElement = document.getElementById("DisplayRoman");
const incrementButton = document.getElementById("incrementButton");
const decrementButton = document.getElementById("decrementButton");

let inputNumber = 0;
let incrementOrDecrementExecuting = false;

function initializeNumber()
{
	inputNumber = 0;
	romanTextElement.textContent = "NULL";
}

const pauseTime = 2000; // milliseconds
const pause = ms => new Promise(resolve => setTimeout(resolve, ms)); // from https://dev.to/rajnishkatharotiya/pause-function-execution-for-a-certain-time-in-javascript-9lj

function replaceLastChars(s, a, b)
{
// if string s ends with string a,
// then replace the ending with string b and return the result,
// otherwise do nothing and return null
	if (s.length < a.length) return null;
	let iLast = s.length - a.length; // index of the 1st of last chars in s
	if (s.substring(iLast) === a)
		return (s.substring(0,iLast) + b);
	return null;
}

const buttonNormalColor = "#E0E0E0";
const buttonPressedColor = "#A0A0A0";
const buttonHoverColor = "#C0C0C0";

function beginExecuting()
{
	incrementOrDecrementExecuting = true;
	incrementButton.disabled = true;
	decrementButton.disabled = true;
	incrementButton.style.fontWeight = "bold";
	incrementButton.style.backgroundColor = buttonPressedColor;
	decrementButton.style.fontWeight = "bold";
	decrementButton.style.backgroundColor = buttonPressedColor;
}

function finishExecuting()
{
	incrementButton.disabled = false;
	decrementButton.disabled = false;
	incrementButton.style.fontWeight = "normal";
	incrementButton.style.backgroundColor = buttonNormalColor;
	decrementButton.style.fontWeight = "normal";
	decrementButton.style.backgroundColor = buttonNormalColor;
	incrementOrDecrementExecuting = false;
	incrementButton.addEventListener('mouseover',
		() => {incrementButton.style.backgroundColor = buttonHoverColor;});
	decrementButton.addEventListener('mouseover',
		() => {decrementButton.style.backgroundColor = buttonHoverColor;});
	incrementButton.addEventListener('mouseout',
		() => {incrementButton.style.backgroundColor = buttonNormalColor;});
	decrementButton.addEventListener('mouseout',
		() => {decrementButton.style.backgroundColor = buttonNormalColor;});
}

async function incrementNumber()
{
	if (inputNumber >= largestNumberToDisplay)
		return;
	if (incrementOrDecrementExecuting) return;
	beginExecuting();
	if (inputNumber == 0)
		romanTextElement.textContent = "";
	inputNumber++;
    romanTextElement.textContent += "I";
	let s = replaceLastChars(romanTextElement.textContent, "IIIII", "V");
	if (s != null) {await pause(pauseTime); romanTextElement.textContent = s;}
 	s = replaceLastChars(romanTextElement.textContent, "VV", "X");
	if (s != null) {await pause(pauseTime); romanTextElement.textContent = s;}
	s = replaceLastChars(romanTextElement.textContent, "XXXXX", "L");
	if (s != null) {await pause(pauseTime); romanTextElement.textContent = s;}
 	s = replaceLastChars(romanTextElement.textContent, "LL", "C");
	if (s != null) {await pause(pauseTime); romanTextElement.textContent = s;}
	s = replaceLastChars(romanTextElement.textContent, "CCCCC", "D");
	if (s != null) {await pause(pauseTime); romanTextElement.textContent = s;}
 	s = replaceLastChars(romanTextElement.textContent, "DD", "M");
	if (s != null) {await pause(pauseTime); romanTextElement.textContent = s;}
	finishExecuting();
}

async function decrementNumber()
{
	if (inputNumber <= 0)
		return;
	if (incrementOrDecrementExecuting) return;
	beginExecuting();
	inputNumber--;
	if (inputNumber == 0)
	{
		romanTextElement.textContent = "NULL";
		finishExecuting();
		return;
	}
	let s = replaceLastChars(romanTextElement.textContent, "M", "DD");
	if (s != null) {romanTextElement.textContent = s; await pause(pauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "D", "CCCCC");
	if (s != null) {romanTextElement.textContent = s; await pause(pauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "C", "LL");
	if (s != null) {romanTextElement.textContent = s; await pause(pauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "L", "XXXXX");
	if (s != null) {romanTextElement.textContent = s; await pause(pauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "X", "VV");
	if (s != null) {romanTextElement.textContent = s; await pause(pauseTime);}
	s = replaceLastChars(romanTextElement.textContent, "V", "IIIII");
	if (s != null) {romanTextElement.textContent = s; await pause(pauseTime);}
	s = romanTextElement.textContent;
	let oldLength = s.length;
	romanTextElement.textContent = s.substring(0,oldLength-1);
	finishExecuting();
}

initializeNumber();
