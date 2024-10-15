import { EducationModel } from "@/app/models/education_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import { WorkoutExerciseModel } from "@/app/models/workout_model";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import clsx from "clsx";
import { CircleX, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Button from "../elements/Button";
import Card from "../elements/Card";
import Input from "../elements/Input";
import MoveTaskIcon from "../icons/move_task_icon";
import ExerciseEducationPanel from "./exercise-education-panel";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDayPanel({ isOpen = false, onClose }: Props) {
  const [name, setName] = useState("");
  const [isOpenSelectList, setIsOpenSelectList] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExerciseModel[]>([]);
  const [selectedEducation, setSelectedEducation] =
    useState<EducationModel | null>(null);
  const [activeTab, setActiveTab] = useState(1);

  const handleOnClose = () => {
    setIsOpenSelectList(false);
    onClose();
  };

  const onSelectExercise = (exercise: ExerciseModel) => {
    const itemExists = exercises.some((item) => item.id === exercise.id);
    const data: WorkoutExerciseModel = {
      id: exercise.id,
      sets: exercise.sets,
      reps: exercise.reps,
      hold: exercise.hold,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        photo: exercise.photo ?? undefined,
      },
    };
    if (!itemExists) {
      setExercises((prev) => [...prev, data]);
    }
  };

  const truncatedText = (text: string, max: number) => {
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const onSelectEducation = (education: EducationModel) => {
    setSelectedEducation(education);
  };

  const onRemoveExercise = (id: number) => {
    const updatedExercises = exercises.filter((item) => item.id !== id);
    setExercises(updatedExercises);
  };

  const onDragEnd = (result: any) => {
    const { destination, source } = result;
    if (!destination) return;

    const updatedExercises = [...exercises];
    const [movedExercises] = updatedExercises.splice(source.index, 1);
    updatedExercises.splice(destination.index, 0, movedExercises);

    setExercises(updatedExercises);
  };

  const onChangeExercise = (
    index: number,
    value: number,
    type: "sets" | "reps" | "hold"
  ) => {
    if (index !== -1) {
      const updatedExercises = [...exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [type]: value,
      };
      setExercises(updatedExercises);
    }
  };

  const pClass =
    "truncate max-w-xs overflow-hidden text-ellipsis whitespace-nowrap";

  return (
    <div
      className={clsx(
        "fixed flex top-[83px] right-0 h-[calc(100vh-83px)] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        isOpenSelectList ? "w-[1043px]" : "w-[593px]"
      )}
    >
      {isOpenSelectList && (
        <ExerciseEducationPanel
          tab={activeTab}
          onClose={() => setIsOpenSelectList(false)}
          onSelectExercise={onSelectExercise}
          onSelectEducation={onSelectEducation}
        />
      )}
      <div className="flex flex-col h-full shadow-left">
        <div className="flex-grow overflow-auto p-4">
          <div className="flex items-center mb-4">
            <Image src={ArrowLeft} alt="Arrow left" />
            <p className="text-2xl font-semibold ml-2">Add Day</p>
            <Button
              label="Cancel"
              secondary
              className="ml-auto mr-3"
              onClick={handleOnClose}
            />
            <Button label="Save" />
          </div>
          <Card className="p-4">
            <div className="flex items-center justify-center mb-4">
              <label className="text-[22px] font-medium mr-2">
                Day&nbsp;1&nbsp;-
              </label>
              <Input
                type="text"
                placeholder="Name your Day 1 Workout"
                value={name}
                invalid={false}
                onChange={(e) => setName(e.target.value)}
                className="!w-[440px]"
              />
            </div>

            {exercises.length === 0 && !selectedEducation && (
              <>
                <Button
                  label="Add"
                  outlined
                  className="ml-auto mb-4"
                  onClick={() => setIsOpenSelectList(true)}
                />
                <p className="text-center text-neutral-400 my-[100px]">
                  You don't have any workout or education added yet
                </p>
              </>
            )}
            {selectedEducation && (
              <>
                <div className="flex items-center">
                  <p className="text-[22px] font-semibold">Education</p>
                  <Button
                    label="Change"
                    outlined
                    className="ml-auto !rounded-full !py-1 !px-3 text-sm"
                    icon={<Pencil size={16} className="mr-1" />}
                    onClick={() => {
                      setActiveTab(2);
                      setIsOpenSelectList(true);
                    }}
                  />
                </div>
                <div key={selectedEducation.id} className="flex items-center">
                  <div className="flex items-center shadow-bottom w-full p-2">
                    <Image
                      src={
                        selectedEducation.photo || "/images/exercise-banner.jpg"
                      }
                      width={80}
                      height={56}
                      alt="Banner"
                      placeholder="blur"
                      blurDataURL="/images/placeholder.jpg"
                      className="w-[80px] h-[56px]"
                    />
                    <div className="ml-3">
                      <p
                        className={clsx(
                          pClass,
                          "text-sm font-medium text-neutral-800 mb-1"
                        )}
                      >
                        {truncatedText(selectedEducation.title, 50)}
                      </p>
                      <p className={clsx(pClass, "text-xs text-neutral-500")}>
                        {truncatedText(selectedEducation.description ?? "", 55)}
                      </p>
                    </div>
                    <CircleX
                      className="ml-auto -mr-[8px] text-error-600 cursor-pointer"
                      onClick={() => setSelectedEducation(null)}
                    />
                  </div>
                </div>
              </>
            )}
            {exercises.length > 0 && (
              <div className="flex items-center mt-5">
                <p className="text-[22px] font-semibold">Exercises</p>
                <Button
                  label="Add More"
                  outlined
                  className="ml-auto !rounded-full  !py-1 !px-3 text-sm"
                  icon={<Plus size={16} className="mr-1" />}
                  onClick={() => {
                    setActiveTab(1);
                    setIsOpenSelectList(true);
                  }}
                />
              </div>
            )}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="ExerciseList">
                {(provided) => (
                  <div
                    className="space-y-6 mt-6"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {exercises.map((item, index) => (
                      <Draggable
                        key={"key" + item.id}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={clsx(
                              "flex items-center",
                              snapshot.isDragging
                                ? "drop-shadow-center !top-auto !left-auto bg-white !p-[20px] !h-[120px]"
                                : ""
                            )}
                          >
                            <div className="flex items-center group mr-6">
                              <MoveTaskIcon className="hidden group-hover:inline-block mr-4" />
                              <Image
                                src={
                                  item.exercise.photo ||
                                  "/images/exercise-banner.jpg"
                                }
                                width={80}
                                height={56}
                                alt="Banner"
                                placeholder="blur"
                                blurDataURL="/images/placeholder.jpg"
                                className="w-[120px] h-[80px]"
                              />
                              <div className="ml-6">
                                <p className="text-[20px] font-medium">
                                  {truncatedText(item.exercise.name, 25)}
                                </p>
                                <div className="flex space-x-6">
                                  <div>
                                    <p className="font-medium">Sets</p>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={item.sets}
                                      onChange={(e) =>
                                        onChangeExercise(
                                          index,
                                          parseInt(e.target.value),
                                          "sets"
                                        )
                                      }
                                      className="!w-[80px]"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">Reps</p>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={item.reps}
                                      onChange={(e) =>
                                        onChangeExercise(
                                          index,
                                          parseInt(e.target.value),
                                          "reps"
                                        )
                                      }
                                      className="!w-[80px]"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">Hold</p>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={item.hold}
                                      onChange={(e) =>
                                        onChangeExercise(
                                          index,
                                          parseInt(e.target.value),
                                          "hold"
                                        )
                                      }
                                      className="!w-[80px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <CircleX
                              className="text-error-600 ml-auto"
                              onClick={() => onRemoveExercise(item.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
        </div>
      </div>
    </div>
  );
}
