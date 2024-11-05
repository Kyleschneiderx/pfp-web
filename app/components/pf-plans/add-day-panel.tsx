import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { EducationModel } from "@/app/models/education_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import { PfPlanDailies, PfPlanExerciseModel } from "@/app/models/pfplan_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import { usePfPlanDailiesStore } from "@/app/store/store";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import clsx from "clsx";
import { CircleX, Pencil, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "../elements/Button";
import Card from "../elements/Card";
import Input from "../elements/Input";
import MoveTaskIcon from "../icons/move_task_icon";
import { validateDayForm } from "./add-day-validation";

const ExerciseEducationPanel = dynamic(
  () => import("./exercise-education-panel"),
  { ssr: false }
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDayPanel({ isOpen = false, onClose }: Props) {
  const { showSnackBar } = useSnackBar();
  const { days, setDay, selectedDay, setSelectedDay } = usePfPlanDailiesStore();
  const [name, setName] = useState("");
  const [isOpenSelectList, setIsOpenSelectList] = useState(false);
  const [exercises, setExercises] = useState<PfPlanExerciseModel[]>([]);
  const [selectedEducation, setSelectedEducation] =
    useState<EducationModel | null>(null);
  const [activeTab, setActiveTab] = useState(1);
  const [currentDayCount, setCurrentDayCount] = useState(1);

  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);

  useEffect(() => {
    setCurrentDayCount(days.length + 1);
  }, [days]);

  useEffect(() => {
    if (selectedDay) {
      setName(selectedDay.name);
      const firstContent = selectedDay.contents[0];
      if (firstContent && "title" in firstContent) {
        setSelectedEducation(firstContent as EducationModel);
      }
      const exerciseContents = selectedDay.contents
        .slice(1)
        .filter((item): item is PfPlanExerciseModel => "exercise_id" in item);
      setExercises(exerciseContents);
    }
  }, [selectedDay]);

  const handleOnClose = () => {
    setIsOpenSelectList(false);
    onClose();
    clear();
  };

  const onSelectExercise = (exercise: ExerciseModel) => {
    const itemExists = exercises.some(
      (item) => item.exercise_id === exercise.id
    );
    const data: PfPlanExerciseModel = {
      exercise_id: exercise.id,
      sets: exercise.sets,
      reps: exercise.reps,
      hold: exercise.hold,
      exercise: exercise,
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
    const updatedExercises = exercises.filter(
      (item) => item.exercise_id !== id
    );
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

  const isValid = () => {
    const validationErrors = validateDayForm({
      name,
      education: selectedEducation,
      exerciseLength: exercises.length,
      days,
      selectedDay,
    });
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  useEffect(() => {
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => error.message).join("\n");
      showSnackBar({ message: errorMessages, success: false });
    }
  }, [errors]);

  const onSave = () => {
    if (isValid()) {
      let contents: any = [...exercises];
      if (selectedEducation) {
        contents.unshift(selectedEducation);
      }
      const day: PfPlanDailies = {
        id: selectedDay?.id,
        name: name,
        day: selectedDay?.day || currentDayCount,
        contents: contents,
      };
      setDay(day);
      clear();
      showSnackBar({
        message: `Day ${
          selectedDay?.day || currentDayCount
        } was successfully saved.`,
        success: true,
      });
    }
  };

  const clear = () => {
    setName("");
    setSelectedEducation(null);
    setExercises([]);
    setSelectedDay(null);
  };

  const pClass =
    "truncate max-w-xs overflow-hidden text-ellipsis whitespace-nowrap";

  const exerciseInputClass = "!w-[55px] sm:!w-[80px]";

  return (
    <div
      className={clsx(
        "fixed flex top-0 right-0 h-full bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        isOpenSelectList ? "sm:w-[1043px]" : "sm:w-[593px]"
      )}
    >
      <div className="order-last sm:order-first">
        <ExerciseEducationPanel
          tab={activeTab}
          isOpen={isOpenSelectList}
          onClose={() => setIsOpenSelectList(false)}
          onSelectExercise={onSelectExercise}
          onSelectEducation={onSelectEducation}
        />
      </div>
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
            <Button label="Save" onClick={onSave} />
          </div>
          <Card className="px-3 sm:p-4">
            <div className="flex items-center justify-center mb-4">
              <label className="text-[22px] font-medium mr-2">
                Day&nbsp;{selectedDay?.day || currentDayCount}&nbsp;-
              </label>
              <Input
                type="text"
                placeholder={`Name your Day ${currentDayCount} Plan`}
                value={name}
                invalid={false}
                onChange={(e) => setName(e.target.value)}
                className="sm:!w-[440px]"
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
                    <div className="ml-3 w-[200px] sm:w-auto">
                      <p
                        className={clsx(
                          pClass,
                          "text-sm font-medium text-neutral-800 mb-1"
                        )}
                      >
                        {selectedEducation.title}
                      </p>
                      <p className={clsx(pClass, "text-xs text-neutral-500")}>
                        {selectedEducation.description}
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
                        key={"key" + item.exercise_id}
                        draggableId={item.exercise_id.toString()}
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
                                className="w-[80px] h-[50px]  sm:w-[120px] sm:h-[80px]"
                              />
                              <div className="ml-6">
                                <p className="text-[20px] font-medium w-[200px] sm:w-[330px] whitespace-nowrap overflow-hidden text-ellipsis">
                                  {item.exercise.name}
                                </p>
                                <div className="flex space-x-4 sm:space-x-6">
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
                                      className={exerciseInputClass}
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
                                      className={exerciseInputClass}
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
                                      className={exerciseInputClass}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <CircleX
                              className="text-error-600 ml-auto"
                              onClick={() => onRemoveExercise(item.exercise_id)}
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
