//scss 불러오기
import "../scss/main.scss";

// 모듈 import
import axios from "axios";
import Sortable from "sortablejs";

// API 정보
const API_URL =
  "https://asia-northeast3-heropy-api.cloudfunctions.net/api/todos";
const API_KEY = "FcKdtJs202204";
const USER_NAME = "KDT2_YangDayoung";

// DOM
const inputTextEl = document.querySelector(".input-text");
const formEl = document.querySelector(".todo-form");
const todoEl = document.querySelector(".todos-list");
const todoSection = document.querySelector(".todos-container");
const countEl = document.querySelector(".count");
const leftItemsBtn = document.querySelector(".left-items");
const completeItemsBtn = document.querySelector(".complete-items");
const allItemsBtn = document.querySelector(".all-items");
const activeItemsBtn = document.querySelector(".active-items");
const clearCompleteItemsBtn = document.querySelector(".clear-complete-items");
const loadingEl = document.querySelector(".loading");

const noTodoListEl = document.querySelector(".noTodoList");

// Todo 정보
let todos = [];

// Event
formEl.addEventListener("submit", (e) => onSubmitTodo(e, inputTextEl.value));

todoEl.addEventListener("click", (e) => {
  if (e.target.dataset.action === "delete") {
    const value = e.target.parentNode.value;
    deleteTodo(value);
  }
});

todoEl.addEventListener("click", (e) => {
  if (e.target.dataset.action === "check") {
    const value = e.target.parentNode.value;
    onCheck(value);
  }
});

completeItemsBtn.addEventListener("click", () => toggleComplete(true));

allItemsBtn.addEventListener("click", () => renderTodos(todos));

activeItemsBtn.addEventListener("click", () => toggleComplete(false));

clearCompleteItemsBtn.addEventListener("click", clearCompleteTodos);

todoEl.addEventListener("click", (e) => onEdit(e));

// 처음 실행
async function Init() {
  await getTodo();
  renderTodos(todos);
}

// 할 일 가져오기
async function getTodo() {
  showLoading(true);
  try {
    const res = await request({
      method: "GET",
    });
    if (res.data.length === 0) {
      showNoTodo(true);
    } else {
      showNoTodo(false);
      res.data.forEach((item) => todos.push(item));
    }
    return res;
  } catch (err) {
    alert(err);
  } finally {
    showLoading(false);
  }
}

// 할 일 등록하기
async function createTodo(todosValue, orderNum) {
  showLoading(true);
  try {
    const res = await request({
      method: "POST",
      data: {
        title: todosValue,
        order: orderNum,
      },
    });
    todos.push(res.data);
    return res;
  } catch (err) {
    alert(err);
  } finally {
    showLoading(false);
    todos.length === 0 ? showNoTodo(true) : showNoTodo(false);
    renderTodos(todos);
  }
}

function onSubmitTodo(e, todosValue) {
  e.preventDefault();
  if (todosValue === "") {
    alert("내용을 입력해 주세요");
    return;
  }
  createTodo(todosValue, todos.length + 1);
  inputTextEl.value = "";
  inputTextEl.focus();
}

// 할 일 삭제하기
async function deleteTodo(value) {
  try {
    todos = todos.filter((item) => item.id !== value);
    const res = await request({
      url: `${API_URL}/${value}`,
      method: "DELETE",
    });
    return res;
  } catch (err) {
    alert(err);
  } finally {
    todos.length === 0 ? showNoTodo(true) : showNoTodo(false);
    renderTodos(todos);
  }
}

// 할 일 완료 체크 업데이트
async function putTodo(checkItem) {
  const { title, order, done, id } = checkItem;
  try {
    const res = await request({
      url: `${API_URL}/${id}`,
      method: "PUT",
      data: {
        title,
        order,
        done: !done,
      },
    });
    // todos에 반영
    const targetIndex = todos.findIndex((item) => item.id === id);
    todos[targetIndex] = {
      ...todos[targetIndex],
      title,
      order,
      done: !done,
    };
    return res;
  } catch (err) {
    alert(err);
  } finally {
    renderTodos(todos);
  }
}

// 할 일 텍스트 수정 후 업데이트
async function putUpdateTodo(updateItem) {
  const { title, id, order } = updateItem;
  try {
    const res = await request({
      url: `${API_URL}/${id}`,
      method: "PUT",
      data: {
        title,
        done: false,
        order,
      },
    });
    // todos에 반영
    const targetIndex = todos.findIndex((item) => item.id === id);
    todos[targetIndex] = {
      ...todos[targetIndex],
      title,
      order,
    };
    return res;
  } catch (err) {
    alert(err);
  } finally {
    renderTodos(todos);
  }
}

// 할 일 완료 체크
function onCheck(value) {
  const checkItem = todos.find((item) => item.id === value);
  putTodo(checkItem);
}

// 남은 목록 개수 표시
function countTodos(todos) {
  const yetTodos = todos.filter((item) => item.done === false);
  let leftItems = yetTodos.length;
  if (leftItems === 0) {
    countEl.innerText = "0";
  } else {
    countEl.innerText = `${leftItems}`;
  }
}

// 완료 목록 토글
function toggleComplete(isComplete) {
  const doneTodos = todos.filter((item) => item.done === isComplete);
  renderTodos(doneTodos);
}

// 모든 완료 목록 삭제
async function clearCompleteTodos() {
  const completeItems = todos.filter((item) => item.done === true);
  const idArray = [];
  completeItems.map((item) => idArray.push(item.id));
  idArray.forEach((id) => {
    axios({
      url: `${API_URL}/${id}`,
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        apikey: API_KEY,
        username: USER_NAME,
      },
    });
  });
  renderTodos(todos);
  todos = todos.filter((item) => item.done === false);
}

// 순서 변경
async function putOrderTodo(value) {
  const res = await request({
    url: `${API_URL}/reorder`,
    method: "PUT",
    data: {
      todoIds: value,
    },
  });
  console.log(res);
  return res;
}

// 할 일 텍스트 수정
async function onEdit(e) {
  const todosTextEl = document.querySelectorAll("#todo-text");
  todosTextEl.forEach((editText) => {
    if (
      e.target === editText &&
      e.target.classList.contains("todo-text-false")
    ) {
      editText.contentEditable = true;
      editText.focus();
      editText.addEventListener("keydown", (e) => {
        if (e.keyCode === 13) {
          const value = editText.parentNode.value; // 할 일 id
          const title = editText.innerText;
          editText.contentEditable = false;
          putUpdateTodo({ id: value, title });
        }
      });
    }
  });
}

//리스트 없을 때 함수
function showNoTodo(isTodolist) {
  if (isTodolist) {
    noTodoListEl.style.display = "block";
  } else {
    noTodoListEl.style.display = "none";
  }
}

// Loading 처리 함수
function showLoading(isLoading) {
  if (isLoading) {
    loadingEl.style.display = "block";
    todoSection.style.display = "none";
  } else {
    loadingEl.style.display = "none";
    todoSection.style.display = "block";
  }
}

// Request 함수
async function request({ url = API_URL, method = "", data = {} }) {
  const response = await axios({
    url,
    method,
    headers: {
      "content-type": "application/json",
      apikey: API_KEY,
      username: USER_NAME,
    },
    data,
  });
  return response;
}

// Rendering 함수
function renderTodos(todos) {
  const todosEl = todos.map(
    (todo) => /* html */ `
      <li order=${todo.order} value=${todo.id} class="todoLi">
        <div>
          <button value=${todo.id}>
            <span class="material-symbols-outlined" class="todo-unChecked" data-action='check' id='check' value=${
              todo.id
            }>
              ${todo.done === false ? "radio_button_unchecked" : "check_circle"}
            </span>
          </button>
          <button value=${todo.id} class="todo-text-parent">
            <span id="todo-text" class="todo-text-${
              todo.done
            }" data-action='edit' data-title=${new Date(todo.updatedAt)
      .toLocaleString()
      .replace(/(\s*)/g, "")
      .substring(0, 15)}>
                ${todo.title}
            </span>
          </button>
        </div>
          <div>
            <button class="delete-btn" value=${todo.id} >
              <span class="material-symbols-outlined" data-action='delete'>
                close
              </span>
            </button>
          </div>
      </li>
    `
  );

  const todoTitles = todosEl.join("");
  todoEl.innerHTML = todoTitles;
  todoSection.append(todoEl);
  countTodos(todos);
}

// 드래그하여 리스트 순서 변경
let sortable = Sortable.create(todoEl, {
  animation: 150,
  onEnd: function () {
    const idList = [];
    const todoLiEl = document.querySelectorAll(".todoLi");
    todoLiEl.forEach((item) => {
      idList.push(item.getAttribute("value"));
    });
    putOrderTodo(idList);
  },
});

Init();
