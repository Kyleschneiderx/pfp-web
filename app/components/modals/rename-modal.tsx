import Button from "../elements/Button";
import Input from "../elements/Input";
import { Controller, useForm } from "react-hook-form";
import type { ExerciseModel } from "@/app/models/exercise_model";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import type { WorkoutModel } from "@/app/models/workout_model";
import type { EducationModel } from "@/app/models/education_model";

export default function RenameModal({
	data,
	type,
	onSubmit,
	onClose,
}: {
	data: ExerciseModel | PfPlanModel | WorkoutModel | EducationModel;
	type?: "exercise" | "pfplan" | "workout" | "education";
	onSubmit: (data: { name: string }) => void;
	onClose: (callback?: () => void) => void;
}) {
	const form = useForm<{ name: string }>({
		defaultValues: {
			name: ("name" in data && data.name) || ("title" in data && data.title) || "",
		},
	});

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="">
			<div className="flex-1 py-1">
				<div className="space-y-5 mt-5 max-h-[50%] min-h-[50%]  text-neutral-900">
					<p>Set a new name for your content here.</p>
					<div className="flex flex-col space-y-3">
						<div className="flex flex-col space-y-1">
							<span className="font-semibold">New Name</span>
							<Controller
								name="name"
								control={form.control}
								render={({ field }) => (
									<Input type="text" placeholder={"Enter the new name"} value={field.value} onChange={field.onChange} />
								)}
							/>
						</div>
					</div>

					<div className="flex flex-row w-full justify-center items-center gap-y-3">
						<Button label="Cancel" secondary className="mr-3 w-full sm:w-auto" onClick={() => onClose()} />
						<Button label="Save" className="w-full sm:w-auto" type="submit" />
					</div>
				</div>
			</div>
		</form>
	);
}
