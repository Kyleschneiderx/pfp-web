import ExerciseForm from "@/app/components/exercises/exercise-form";
import { getExerciseDetails } from "@/app/services/server_side/exercises";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const response = await getExerciseDetails(id);
  const exerciseDetail = response;
  return <ExerciseForm action="Edit" exercise={exerciseDetail} />;
}
