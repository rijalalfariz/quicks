import React, { useState } from "react";
import { Task } from "@/interfaces/interfaces";

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task
}) => {
  return (
    <div>{task.title}</div>
  );
}

export default TaskItem;