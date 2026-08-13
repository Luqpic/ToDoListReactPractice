import './task.css'

interface TaskProps {
    taskName: string;
}

function TaskList({ taskName }: TaskProps) {
    return (
        <li className="task-item">
            <span className="task-text">{taskName}</span>
            <div className="task-actions">
                <button className="delete-btn">Delete</button>
                <button className="edit-btn">Edit</button>
            </div>
        </li>
    )
}

export default TaskList