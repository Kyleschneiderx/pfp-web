import type { PfPlanModel } from "@/app/models/pfplan_model";
import { getPfPlans } from "@/app/services/client_side/pfplans";
import { useEffect, useState } from "react";
import Button from "../elements/Button";

export default function CustomizePfPlanListModal({
	onSelect,
	onSkip,
}: { onSelect: (pfPlan: PfPlanModel) => void; onSkip: () => void }) {
	const [pfPlans, setPfPlans] = useState<PfPlanModel[]>([]);

	const fetchPfPlans = async () => {
		const params = "sort[]=name:ASC&page=1&page_items=1000";
		const { data } = await getPfPlans(params);
		setPfPlans(data);
	};

	useEffect(() => {
		fetchPfPlans();
	}, []);

	return (
		<div className="text-center w-[300px] sm:w-[450px] sm:py-5 sm:px-3">
			<p className="text-2xl font-semibold mb-2">Select Template</p>
			<p className="text-md mb-2 text-neutral-700">
				You can select an existing PF Plan as a template for the customize PF Plan that you will create for the patient
			</p>
			<ul className="border border-neutral-300 rounded-lg text-start overflow-auto h-[200px]">
				{pfPlans.map((item) => (
					<li
						key={item.id}
						onClick={() => onSelect(item)}
						onKeyDown={undefined}
						className="flex w-full py-2 px-4 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 group cursor-pointer"
					>
						<span>{item.name}</span>
					</li>
				))}
			</ul>
			<div className="flex justify-center mt-3">
				<Button onClick={onSkip} label="Skip" />
			</div>
		</div>
	);
}
