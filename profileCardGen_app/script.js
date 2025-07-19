const form     = document.getElementById("profile_form");
const cardArea = document.getElementById("card_area");

form.addEventListener("submit", (e) => {
    
    console.log("good");

    e.preventDefault();

    const name_tmp    = document.getElementById("name_input").value;
    const hobby_tmp   = document.getElementById("hobby_input").value;
    const message_tmp = document.getElementById("OneWord_input").value;

    const cardHTML = `
        <div class="card">
            <h2>${name_tmp}</h2>
            <p><strong>My favorite:</strong>${hobby_tmp}</p>
            <p>${message_tmp}</p>
        </div>
    `;

    cardArea.innerHTML = cardHTML;

});