// ==========================================
// LINKUP JAVASCRIPT
// ==========================================

console.log("LinkUp JavaScript is connected!");


// ==========================================
// BUTTON INTERACTION
// ==========================================

const buttons = document.querySelectorAll(".primary-btn");

buttons.forEach(function(button) {

    button.addEventListener("click", function(event) {

        console.log("LinkUp button clicked!");

    });

});