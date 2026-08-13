import "./task.css";

interface props {
  taskname: string;
}

function tasklist({ taskname }: props) {
  return (
    <ul className="task-list">
      <li className="task-item">
        <span className="task-text">{taskname}</span>
        <div className="task-actions">
          <button className="delete-btn">Delete</button>
          <button className="edit-btn">Edit</button>
        </div>
      </li>
    </ul>
  );
}

export default tasklist;
