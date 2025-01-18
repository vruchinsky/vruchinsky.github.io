const largestNumberToDisplay = 4999;
const romanTextElement = document.getElementById("DisplayRoman");

//let romanNumeralsText = "";
let inputNumber = 0;

function initializeNumber() {
	inputNumber = 0;
	romanTextElement.textContent = "NULL";
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms)); // from https://dev.to/rajnishkatharotiya/pause-function-execution-for-a-certain-time-in-javascript-9lj

async function incrementNumber() {
	if (inputNumber >= largestNumberToDisplay)
		return;
	if (inputNumber == 0)
		romanTextElement.textContent = "";
	inputNumber++;
    romanTextElement.textContent += "I";
	if (replaceLastChars("IIIII", "V")) await pause(4000);
 	if (replaceLastChars("VV", "X")) await pause(4000);
	if (replaceLastChars("XXXXX", "L")) await pause(4000);
 	if (replaceLastChars("LL", "C")) await pause(4000);
	if (replaceLastChars("CCCCC", "D")) await pause(4000);
 	replaceLastChars("DD", "M");
}

function replaceLastChars(a, b) {
	s = romanTextElement.textContent;
	if (s.substring(s.length-a.length) === a)
	{
		romanTextElement.textContent = (s.substring(0,s.length-a.length) + b);
		return true;
	}
	return false;
}

async function decrementNumber() {
	if (inputNumber <= 0)
		return;
	inputNumber--;
	if (inputNumber == 0) {
		romanTextElement.textContent = "NULL";
		return;
	}
	if (replaceLastChars("M", "DD")) await pause(4000);
	if (replaceLastChars("D", "CCCCC")) await pause(4000);
	if (replaceLastChars("C", "LL")) await pause(4000);
	if (replaceLastChars("L", "XXXXX")) await pause(4000);
	if (replaceLastChars("X", "VV")) await pause(4000);
	if (replaceLastChars("V", "IIIII")) await pause(2000);
	let oldContent = romanTextElement.textContent;
	let oldLength = oldContent.length;
	romanTextElement.textContent = oldContent.substring(0,oldLength-1);
}

initializeNumber();
