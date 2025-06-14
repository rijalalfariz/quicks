import React, { Dispatch, RefObject, useEffect, useState } from 'react';
import Image from 'next/image';
import DateText from './DateText';
import { Task } from '@/interfaces/interfaces';
import { getTaskList } from '@/services/api';
import TaskItem from './TaskItem';

interface TaskPanelProps {
  loading: boolean;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  loading,
  setLoading,
}) => {
  const [tasks, setTasks] = useState<Task[] | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [])

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const taskData = await getTaskList();
      setTasks(taskData);
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white w-[734px] h-[737px] rounded-md QuicksContainer px-[32px] py-[24px]">
      <div className="flex justify-between items-center">
        <div>
          <select className="focus:outline-none" defaultValue={"My Task"}>
            <option value="My Task">My Task</option>
            <option value="Personal Errand">Personal Errand</option>
            <option value="Urgent To-Do">Urgent To-Do</option>
          </select>
        </div>
        <div>
          <button className="bg-[var(--primary)] rounded-[5px] text-white py-[8px] px-[16px]">New Task</button>
        </div>
      </div>
      {tasks?.map(task => (
        <TaskItem
          key={task.id}
          task={task}
        />
      )
      )}
      <div>

      </div>
    </div>
  );
}

export default TaskPanel;