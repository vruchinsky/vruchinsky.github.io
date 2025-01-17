const largestNumberToDisplay = 20;
const romanTextElement = document.getElementById("DisplayRoman");

let romanNumeralsText = "";
let inputNumber = 0;

function incrementNumber() {
	if (inputNumber > largestNumberToDisplay)
		return;
	inputNumber++;
//    if (currentIndex < textToAnimate.length) {
        romanTextElement.textContent += "I";
//    }
}

function decrementNumber() {
	if (inputNumber < 1)
		return;
	inputNumber--;
	let oldContent = romanTextElement.textContent;
	let oldLength = oldContent.length;
    romanTextElement.textContent = oldContent.substring(0,oldLength-1);
}
