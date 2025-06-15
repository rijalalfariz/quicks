import React, { Dispatch, RefObject, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Task, TaskMode } from '@/interfaces/interfaces';
import { completeTask, createTask, deleteTask, getTaskList, updateTask } from '@/services/api';
import TaskItem from './TaskItem';

interface TaskPanelProps {
  loading: boolean;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
  suppressNextOutsideClick: RefObject<boolean>;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  loading,
  setLoading,
  suppressNextOutsideClick
}) => {
  const taskScrollRef = useRef(null)
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [selectedTaskMode, setSelectedTaskMode] = useState<TaskMode>("My Task");
  const [showTaskModeOption, setShowTaskModeOption] = useState(false);
  const [taskModeOptions] = useState<TaskMode[]>(["My Task", "Personal Errand", "Urgently To-Do"]);
  const [activeTaskAction, setActiveTaskAction] = useState(0);
  const [activeDescTaskField, setActiveDescTaskField] = useState(0);
  const [activeTaskStickers, setActiveTaskStickers] = useState(0);

  useEffect(() => {
    if (tasks?.find(v => v.newTask)) {
      setTimeout(() => {
        if (taskScrollRef.current) {
          const scrollDiv = taskScrollRef.current as HTMLDivElement;
          scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: "smooth" });
        }
      }, 100);
    }
  }, [tasks])

  useEffect(() => {
    fetchTasks();

    const handleClickOutsideTaskAction = (e: MouseEvent) => {
      const taskActionContainer = document.getElementsByClassName("TaskActionContainer");
      if (taskActionContainer && Array.from(taskActionContainer).filter(v => v.contains(e.target as Node)).length == 0) {
        setActiveTaskAction(0);
      }

      const taskOptionContainer = document.getElementsByClassName("TaskOptionContainer");
      if (taskOptionContainer && Array.from(taskOptionContainer).filter(v => v.contains(e.target as Node)).length == 0) {
        setShowTaskModeOption(false);
      }

      const taskDescFieldContainer = document.getElementsByClassName("TaskDescFieldContainer");
      if (taskDescFieldContainer && Array.from(taskDescFieldContainer).filter(v => v.contains(e.target as Node)).length == 0) {
        setActiveDescTaskField(0);
      }

      const taskStickersContainer = document.getElementsByClassName("TaskStickersContainer");
      if (taskStickersContainer && Array.from(taskStickersContainer).filter(v => v.contains(e.target as Node)).length == 0) {
        console.log('stick clos')
        setActiveTaskStickers(0);
      }
    }

    document.addEventListener("click", handleClickOutsideTaskAction)

    return () => {
      document.removeEventListener("click", handleClickOutsideTaskAction)
    }
  }, [])

  useEffect(() => {
    const handleClickOutsideTaskCreate = (e: MouseEvent) => {
      const newTaskContainer = document.getElementsByClassName("NewTaskContainer");
      if (newTaskContainer && Array.from(newTaskContainer).filter(v => v.contains(e.target as Node)).length == 0) {
        const creatingTask = tasks?.find(v => (v.newTask == true));
        console.log('created aa', creatingTask)
        if (creatingTask && !creatingTask.title) {
          setTasks(prev => [...(prev || [])?.filter(v => !v.newTask)])
          deleteTask(creatingTask.id)
        } else if (creatingTask && creatingTask.title) {
          console.log('created')
          setTasks(prev => [...(prev || [])?.map(v => {
            if (v == creatingTask) {
              return {
                ...v,
                newTask: false
              }
            }
            return v;
          })])
          createTask({...creatingTask, newTask: false})
        }
      }
    }

    document.addEventListener("click", handleClickOutsideTaskCreate)

    return () => {
      document.removeEventListener("click", handleClickOutsideTaskCreate)
    }
  }, [tasks])

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
    <div className="bg-white w-[734px] h-[737px] rounded-md QuicksContainer py-[24px] grid grid-rows-[min-content_1fr]">
      <div className="flex justify-between items-center px-[32px]">
        <div className="relative flex justify-center w-[288px]">
          <div className="flex gap-[6px] py-[10px] px-[14px] items-center rounded-[5px] border-1 border-[var(--primary-2)] justify-between font-bold w-fit cursor-pointer TaskOptionContainer"
            onClick={() => {
              setShowTaskModeOption(!showTaskModeOption)
            }}
          >
            <div>{selectedTaskMode}</div>
            <Image
              src="/images/cevron-gray.svg"
              alt="expand-collapse"
              width={20}
              height={20}
              className={(showTaskModeOption ? "rotate-180" : "")}
            />
          </div>
          {showTaskModeOption && (
            <div className="w-[288px] border-1 border-[var(--primary-2)] divide-y divide-[var(--primary-2)] font-bold rounded-[5px] absolute z-10 bg-white top-[54px]">
              {taskModeOptions.map(v =>
                v !== selectedTaskMode && (
                  <div className="px-[16px] py-[14px] cursor-pointer" key={v} onClick={() => {
                    suppressNextOutsideClick.current = true;
                    setSelectedTaskMode(v);
                    setShowTaskModeOption(false);
                  }}>
                    {v}
                  </div>
                )
              )}
            </div>
          )}
        </div>
        <div>
          <button className="bg-[var(--primary)] rounded-[5px] text-white py-[8px] px-[16px] cursor-pointer"
            onClick={() => {
              if (tasks?.find(v => v.newTask == true)) return;
              setTasks(prev => [
                ...(prev || []),
                {
                  id: (tasks && tasks.length > 0) ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
                  title: "",
                  description: "",
                  dueDate: "",
                  isCompleted: false,
                  taskMode: selectedTaskMode,
                  newTask: true
                }
              ]);
            }}
          >New Task</button>
        </div>
      </div>
      {loading
        ? (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="relative inline-block w-[60px] h-[60px]">
              <span
                className="absolute inset-0 rounded-full border-[6px] animate-spin"
                style={{
                  borderTopColor: "#c4c4c4",
                  borderRightColor: "#c4c4c4",
                  borderBottomColor: "#f8f8f8",
                  borderLeftColor: "#f8f8f8",
                }}
              ></span>
            </span>
            <p className="text-[var(--primary-3)] mt-4 font-bold text-[16px]">Loading Task List...</p>
          </div>
        ) : (
          <div ref={taskScrollRef} className="grid divide-y divide-[var(--primary-2)] pr-[32px] pl-[32px] overflow-y-auto max-h-full grid-rows-[min-content]">
            {[...(tasks || []).filter(v => v.taskMode == selectedTaskMode)]?.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onCompleteTask={async (completed, taskId) => {
                  if (tasks?.find(v=> v.id==taskId)?.newTask) {
                    setTasks(prev => [...(prev || [])?.map(v => {
                      if (v.id == taskId) {
                        return {...v, isCompleted: completed};
                      }
                      return v;
                    })])
                  } else {
                    const updatedTask = await completeTask(completed, taskId);
                    setTasks(updatedTask);
                  }
                }
                }
                activeTaskAction={activeTaskAction}
                setActiveTaskAction={setActiveTaskAction}
                activeTaskStickers={activeTaskStickers}
                setActiveTaskStickers={setActiveTaskStickers}
                onDelete={async (taskId) => {
                  suppressNextOutsideClick.current = true;

                  await deleteTask(taskId);
                  const updatedTask = await getTaskList(true);
                  setTasks(updatedTask);
                }}
                onUpdate={async (taskId, updatedTaskData) => {
                  if (updatedTaskData.newTask) {
                    setTasks(prev => [...(prev || [])?.map(v => {
                      if (v.id == taskId) {
                        return updatedTaskData;
                      }
                      return v;
                    })])
                  } else {
                    const updatedTask = await updateTask(taskId, updatedTaskData);
                    setTasks(updatedTask);
                  }
                }}
                activeDescTaskField={activeDescTaskField}
                setActiveDescTaskField={setActiveDescTaskField}
                suppressNextOutsideClick={suppressNextOutsideClick}
              />
            )
            )}
            {[...(tasks || []).filter(v => v.taskMode == selectedTaskMode)].length == 0 && (
              <div className="flex items-center justify-center h-full pt-[calc(50%-24px)]">There is no task yet.</div>
            )}
          </div>
        )}
    </div>
  );
}

export default TaskPanel;