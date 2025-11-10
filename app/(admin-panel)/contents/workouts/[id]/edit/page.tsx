import WorkoutForm from "@/app/components/workouts/workout-form";
import { getWorkoutDetails } from "@/app/services/server_side/workouts";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const response = await getWorkoutDetails(id);
  return <WorkoutForm action="Edit" workout={response} />;
}
