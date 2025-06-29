// Set Index
const form  = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list  = document.getElementById("todo-list");

// Input initial data from local storage
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Function : Display
function renderTodos() {
    list.innerHTML = "";
    todos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
        <span class="todo-text">${todo.text}</span>
        <span>
            <button onclick="toggleTodo(${index})">✔</button>
            <button onclick="deleteTodo(${index})">🗑️</button>
        </span>
        `;
        if(todo.completed){
            li.querySelector(".todo-text").classList.add("completed");
        }
        list.appendChild(li);
    });
}

// Add Task
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if(text === ""){
        return;
    }
    todos.push({text, completed:false});
    input.value = "";
    saveAndRender();
});

// Function : Switch between complete and incomplete
function toggleTodo(index){
    todos[index].completed = !todos[index].completed;
    saveAndRender();
}

// Function : Delete
function deleteTodo(index){
    todos.splice(index, 1);
    saveAndRender();
}

// Function : Save&Render
function saveAndRender() {
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
}

// Initial Render
renderTodos();