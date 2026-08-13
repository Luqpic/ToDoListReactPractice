import "./App.css";
import TaskList from "./components/task.tsx";

function App() {
  return (
    <div className="todo-app">
      <h1>TODOLIST</h1>

      <div className="input-section">
        <input type="text" placeholder="add item . . ." />
        <button className="add-btn">ADD</button>
      </div>
      <TaskList taskname="Study React" />
      <TaskList taskname="Study Vue" />
    </div>
  );
}

export default App;
