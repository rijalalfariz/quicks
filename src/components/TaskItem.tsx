import React, { Dispatch, RefObject, use, useEffect, useRef, useState } from "react";
import { Task } from "@/interfaces/interfaces";
import Image from "next/image";
import { completeTask } from "@/services/api";
import DateText, { getDateDifference } from "./DateText";
import StickerPill, { stickerObj } from "./StickerPill"

interface TaskItemProps {
  task: Task;
  onCompleteTask: (completed: boolean, taskId: number) => void;
  activeTaskAction: number;
  setActiveTaskAction: Dispatch<React.SetStateAction<number>>;
  activeTaskStickers: number;
  setActiveTaskStickers: Dispatch<React.SetStateAction<number>>;
  onDelete: (taskId: number) => void;
  onUpdate: (taskId: number, updatedTaskData: Task) => void;
  activeDescTaskField: number;
  setActiveDescTaskField: Dispatch<React.SetStateAction<number>>;
  suppressNextOutsideClick: RefObject<boolean>;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onCompleteTask,
  activeTaskAction,
  setActiveTaskAction,
  onDelete,
  onUpdate,
  activeDescTaskField,
  setActiveDescTaskField,
  suppressNextOutsideClick,
  activeTaskStickers,
  setActiveTaskStickers
}) => {
  const taskDetailRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const inputDateRef = useRef<HTMLInputElement | null>(null);
  const dueDateDifference = getDateDifference({ from: task.dueDate });
  const [showTaskDetail, setShowTaskDetail] = useState(!task.isCompleted);
  const [showTaskOption, setShowTaskOption] = useState(false);
  const [showDescField, setShowDescField] = useState(false);
  const [inlineHeight, setInlineHeight] = useState<`${number}px` | "auto">("0px");
  const [taskDetailOverflow, setTaskDetailOverflow] = useState<"hidden" | "visible">("hidden")
  const [description, setDescription] = useState(task.description);
  const [descFieldHeight, setDescFieldHeight] = useState(0);
  const [taskTitle, setTaskTitle] = useState("");
  const [showStickerDropdown, setShowStickerDropdown] = useState(false);

  useEffect(() => {
    if (showTaskDetail) {
      setTaskDetailOverflow("visible");
      setInlineHeight("auto");
    } else {
      setTaskDetailOverflow("hidden");
      setInlineHeight("0px");
    }
  }, [])

  useEffect(() => {
    setShowTaskOption(activeTaskAction == task.id);
  }, [activeTaskAction])

  useEffect(() => {
    setShowDescField(activeDescTaskField == task.id)
  }, [activeDescTaskField])

  useEffect(() => {
    setShowStickerDropdown(activeTaskStickers == task.id)
  }, [activeTaskStickers])

  useEffect(() => {
    if (!showDescField) {
      setDescFieldHeight(descriptionRef.current?.scrollHeight || 0)
    }
  }, [showDescField])

  const toggle = () => {
    const el = taskDetailRef.current;
    if (!el) return;

    if (showTaskDetail) {
      const fullHeight = el.scrollHeight;
      setTaskDetailOverflow("hidden");
      setInlineHeight(`${fullHeight}px`);
      requestAnimationFrame(() => {
        setInlineHeight("0px");
        setShowTaskDetail(false);
      });
    } else {
      const fullHeight = el.scrollHeight;
      setTaskDetailOverflow("hidden");
      setInlineHeight(`${fullHeight}px`);
      setShowTaskDetail(true);
    }
  };

  const handleTransitionEnd = () => {
    if (showTaskDetail) {
      setTaskDetailOverflow("visible");
      setInlineHeight("auto");
    }
  };

  return (
    <div className={"py-[22px] flex gap-[18px]" + (task.newTask ? " NewTaskContainer" : "")}>
      <div className="cursor-pointer">
        {task.isCompleted
          ? (
            <Image
              src="/images/checkbox-checked.svg"
              alt="expand-collapse"
              width={20}
              height={20}
              className=""
              onClick={() => {
                onCompleteTask(false, task.id)
              }}
            />
          ) : (
            <Image
              src="/images/checkbox-unchecked.svg"
              alt="expand-collapse"
              width={20}
              height={20}
              className=""
              onClick={() => {
                onCompleteTask(true, task.id)
              }}
            />
          )
        }
      </div>

      <div className="grid w-full">
        <div className="flex justify-between items-center">
          {task.title && !task.newTask
            ? (
              <div className={(task.isCompleted ? "text-[var(--primary-2)] line-through" : "text-[var(--primary-3)]") + " font-bold"}>
                {task.title}
              </div>
            ) : (
              <input className="py-[7px] px-[14px] focus:outline-none border-1 border-[var(--primary-2)] rounded-[5px] -mt-[10px]" type="text" value={taskTitle}
                onChange={(e) => {
                  setTaskTitle(e.target.value);
                  onUpdate(task.id, {
                    ...task,
                    title: taskTitle
                  })
                }}
                onBlur={() => {
                }}
              />
            )}
          <div className="flex items-center">
            {!task.isCompleted && task.dueDate && (
              <div className="text-[var(--indicator-red)] mr-[19px]">{dueDateDifference.result} {dueDateDifference.suffix} {dueDateDifference.result > 0 ? "Left" : "Ago"}</div>
            )}
            {task.dueDate && (
              <div className="mr-[10px]">
                {new Date(task.dueDate).toLocaleDateString("id-ID", {
                  timeZone: 'UTC', day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </div>
            )}
            <div>
              <Image
                src="/images/cevron-gray.svg"
                alt="expand-collapse"
                width={20}
                height={20}
                className={(showTaskDetail ? "" : "rotate-180") + " mr-[15px] cursor-pointer"}
                onClick={() => {
                  toggle()
                }}
              />
            </div>
            <div className="relative">
              <Image
                src="/images/kebab-gray-2.svg"
                alt="more"
                width={14}
                height={4}
                className="TaskActionContainer py-1 cursor-pointer"
                onClick={() => {
                  setActiveTaskAction(activeTaskAction == 0 ? task.id : 0)
                }}
              />
              {showTaskOption && (
                <div className="absolute w-[126px] py-[8px] px-[18px] rounded-[5px] border-1 border-[var(--primary-2)] text-[var(--indicator-red)] right-0 top-5 cursor-pointer"
                  onClick={() => {
                    onDelete(task.id);
                  }}
                >
                  Delete
                </div>
              )}
            </div>
          </div>
        </div>
        <div ref={taskDetailRef} className={"transition-all duration-300 grid gap-3" + (showTaskDetail ? " mt-4" : " mt-0")}
          style={{
            height: inlineHeight,
            overflow: taskDetailOverflow,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          <div className="flex gap-[18px] items-center">
            <Image
              src={"/images/clock-" + (task.dueDate ? "blue" : "gray") + ".svg"}
              alt="clock"
              width={20}
              height={20}
              className=""
            />
            <button className="relative rounded-[5px] border-1 border-[var(--primary-2)] py-2 pr-[13px] pl-[14px] flex min-w-[193px] justify-between"
              onClick={() => {
                inputDateRef.current?.showPicker?.();
                // inputDateRef.current?.click();
              }}
            >
              {task.dueDate
                ? (
                  <>{new Date(task.dueDate).toLocaleDateString("id-ID", { timeZone: 'UTC' })}</>
                ) : (
                  <>Set Date</>
                )}
              <Image
                src="/images/calendar.svg"
                alt="clock"
                width={16}
                height={16}
                className="cursor-pointer"
              />
              <input ref={inputDateRef} type="date" value={task.dueDate.slice(0, 10)} name="duedate-task" id={"duedate-task" + task.id} className="top-[20px] -right-[100px] opacity-0 absolute pointer-events-none"
                onChange={(e) => {
                  console.log('val', e.target.value)
                  onUpdate(task.id, {
                    ...task,
                    dueDate: e.target.value ? new Date(e.target.value).toISOString() : ""
                  })
                }}
              />
            </button>
          </div>
          <div className="TaskDescFieldContainer flex gap-[18px] items-start">
            <Image
              src={"/images/pencil-" + (task.description ? "blue" : "gray") + ".svg"}
              alt="pencil"
              width={20}
              height={20}
              className="min-w-5 cursor-pointer"
              onClick={() => {
                if (showDescField) {
                  onUpdate(task.id, {
                    ...task,
                    description: description
                  })
                } else {
                  setActiveDescTaskField(task.id)
                }
                setShowDescField(!showDescField)
              }}
            />
            {showDescField
              ? (
                <textarea className="leading-normal min-h-[40px] w-full rounded-[5px] border-1 border-[var(--primary-2)] p-2 resize-none focus:outline-none" name="task-description" id="" defaultValue={task.description}
                  onChange={(e) => { setDescription(e.target.value) }}
                  style={{
                    height: descFieldHeight + 18
                  }}
                ></textarea>
              ) : (
                <div ref={descriptionRef} className="cursor-pointer"
                  onClick={() => {
                    suppressNextOutsideClick.current = true;
                    setShowDescField(true);
                  }}
                >
                  {task.description ? task.description : "No Description"}
                </div>
              )}
          </div>
          <div className="flex gap-[18px] items-start relative">
            <Image
              src={"/images/bookmarks-"+(task.stickers?.length?"blue":"gray")+".svg"}
              alt="clock"
              width={19}
              height={20}
              className="cursor-pointer min-h-[20px] mt-1 TaskStickersContainer"
              onClick={() => {
                setActiveTaskStickers(activeTaskAction == 0 ? task.id : 0)
              }}
            />
            <div className="flex flex-wrap gap-[10px]">
              {task.stickers?.map(v => 
                <StickerPill sticker={v}/>
              )}
            </div>

            {showStickerDropdown && (
              <div className="absolute z-10 bg-white grid gap-[10px] p-4 rounded-[5px] border-1 border-[var(--primary-2)] w-[277px] top-[40px]">
                {Object.entries(stickerObj).map(([key, v]) => (
                  <div
                    key={key}
                    className="cursor-pointer"
                    onClick={() => {
                      const stickerNum = Number(key);
                      const hasSticker = task.stickers?.includes(stickerNum);
                      const updatedStickers = hasSticker
                        ? task.stickers?.filter(s => s !== stickerNum)
                        : [...(task.stickers || []), stickerNum];
                      onUpdate(task.id, {
                        ...task,
                        stickers: updatedStickers,
                      });
                    }}
                  >
                    <StickerPill
                      sticker={Number(key)}
                      active={task.stickers?.includes(Number(key))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;