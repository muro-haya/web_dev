const display = document.getElementById("display");
const buttons = document.getElementsByClassName("btn");

let currentInput     = "";
let displayNum       = "";
let inputNumArray    = [];
let operatorArray    = [];
let inputNum         = 0;

Array.from(buttons).forEach(button =>
{
    button.addEventListener("click", ()=>
    {
        const value = button.dataset.value;

        if( button.classList.contains("fnc") ){
            inputNumArray.push(currentInput);
            currentInput     = "";
            switch(value){
            case "+":
            case "-":
            case "÷":
            case "×":
                displayNum       += value
                operatorArray.push(value);
                inputNum ++;
                break;
            case "clr":
                currentInput     = "";
                displayNum       = "0"
                inputNum = 0;
                inputNumArray = [];
                break;
            case "equal":
                try{
                    // currentInput = eval(currentInput).tostring();
                    for (let num = 0; num < inputNum; num++) {
                        
                        let num1 = Number(inputNumArray[num]);
                        let num2 = Number(inputNumArray[num+1]);

                        switch (operatorArray[num]){
                        case "+":
                            currentInput = num1 + num2;
                            break;
                        case "-":
                            currentInput = num1 - num2;
                            break;
                        case "÷":
                            currentInput = num1 / num2;
                            break;
                        case "×":
                            currentInput = num1 * num2;
                            break;
                        default:
                            currentInput = 0;
                            break;
                        }
                    }
                    displayNum = currentInput;

                    inputNum      = 0;
                    inputNumArray = [];
                    operatorArray = [];
                }
                catch{
                    currentInput     = "";
                    displayNum       = "error";
                }
                break;
            default:
                break;
            }
        }
        else{
            if(0==displayNum){
                displayNum = "";
            }
            currentInput     += value;
            displayNum       += value;
        }
        display.textContent = displayNum;
    });
});
