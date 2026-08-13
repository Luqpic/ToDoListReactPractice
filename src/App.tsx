import './App.css'
import TaskList from './components/task'


function App() {

  return (
    <div className="todo-app">
      <h1>TODOLIST</h1>

      <div className="input-section">
        <input type="text" placeholder="add item . . ." />
        <button className="add-btn">ADD</button>
      </div>

      <TaskList taskName='Task 1' />
      <TaskList taskName='Task 2' />
      <TaskList taskName='Task 3' />

    </div>
  )
}

export default App
