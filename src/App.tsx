import './App.css'


function App() {

  return (
    <div className="todo-app">
      <h1>TODO LIST</h1>

      <div className="input-section">
        <input type="text" placeholder="add item . . ." />
        <button className="add-btn">ADD</button>
      </div>

      <ul className="task-list">
        <li className="task-item">
          <span className="task-text">Task 1</span>
          <div className="task-actions">
            <button className="delete-btn">Delete</button>
            <button className="edit-btn">Edit</button>
          </div>
        </li>
        <li className="task-item">
          <span className="task-text">Task 2</span>
          <div className="task-actions">
            <button className="delete-btn">Delete</button>
            <button className="edit-btn">Edit</button>
          </div>
        </li>
        <li className="task-item">
          <span className="task-text">Task 3</span>
          <div className="task-actions">
            <button className="delete-btn">Delete</button>
            <button className="edit-btn">Edit</button>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default App
