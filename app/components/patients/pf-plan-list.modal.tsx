import ModalCmp from "../elements/ModalCmp";
import { getPfPlans } from "@/app/services/client_side/pfplans";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "../elements/Button";

export function PfPlanListModal({
	onClose,
}: {
	onClose: () => void;
	className?: string;
}) {
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
		<ModalCmp isOpen={true} handleClose={onClose} showCloseBtn>
			<div className="text-center w-[300px] sm:w-[450px] sm:py-5 sm:px-3">
				<p className="text-2xl font-semibold mb-2">All PF Plans</p>
				<ul className="border border-neutral-300 rounded-lg text-start overflow-auto h-[200px]">
					{pfPlans.map((item) => (
						<Link href={`pf-plan/${item.id}`} key={item.id}>
							<li
								key={item.name}
								className="flex w-full py-2 px-4 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 group"
							>
								<span>{item.name}</span>
							</li>
						</Link>
					))}
				</ul>
				<div className="flex justify-center mt-3">
					<Link href="pf-plan">
						<Button label="Skip" />
					</Link>
				</div>
			</div>
		</ModalCmp>
	);
}
