/* Inisial */
let count = 0;

/* Set index */
const countDisplay = document.getElementById("count")
const increaseBtn  = document.getElementById("increase")
const decreaseBtn  = document.getElementById("decrease")
const resetBtn     = document.getElementById("reset")

/* Add event */
/* Input mouse */
increaseBtn.addEventListener("click", ()=> 
{
    count += 1;
    updateDisplay();
});
decreaseBtn.addEventListener("click", ()=>
{
    count -= 1;
    updateDisplay();
});
resetBtn.addEventListener("click", ()=>
{
    count = 0;
    updateDisplay();
});
/* Input key Board */
document.addEventListener("keydown", function(event){
    if( event.key == "ArrowRight" ){
        count += 1;
        updateDisplay();
    }
    else if( event.key == "ArrowLeft" ){
        count -= 1;
        updateDisplay();
    }
    else if( event.key == " " ){
        count = 0;
        updateDisplay();
    }
})

/* Function */
function updateDisplay() {
    countDisplay.textContent = count;
}