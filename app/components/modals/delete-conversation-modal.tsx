import type { PatientModel } from "@/app/models/patient_model";
import { useEffect, useState } from "react";
import { fetchPatients } from "../patients/actions";
import clsx from "clsx";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";
import Button from "../elements/Button";
import { useModal } from "@/app/contexts/ModalContext";
import { deleteAiCoachConversation } from "@/app/services/client_side/settings";

export default function DeleteConversationModal() {
	const modal = useModal();
	const [ref, inView] = useInView();
	const [patients, setPatients] = useState<PatientModel[]>();
	const [selectedPatient, setSelectedPatient] = useState<PatientModel>();
	const [page, setPage] = useState<number>(1);
	const [maxPage, setMaxPage] = useState<number>(2);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const getPatients = async () => {
		const { patientList, max_page } = await fetchPatients({
			page: page,
			name: "",
			sort: "name:ASC",
			status_id: "",
		});
		if (patientList.length) {
			setMaxPage(max_page);
			setPage((prev) => prev + 1);
			setPatients((prev) => [...(prev?.length ? prev : []), ...patientList]);
		}
	};

	useEffect(() => {
		if (inView && page <= maxPage) {
			getPatients();
		}
	}, [inView]);

	const handleDelete = async () => {
		if (selectedPatient) {
			setIsProcessing(true);

			await deleteAiCoachConversation(selectedPatient.id);

			setIsProcessing(false);

			modal.close();
		}
	};

	return (
		<div className="text-center w-[300px] sm:w-[450px] sm:py-5 sm:px-3">
			<p className="text-2xl font-semibold mb-2">All Patients</p>
			<p className="text-neutral-600 mb-[40px]">
				Select the patient that you want to delete the conversation with AI coach
			</p>
			<ul className="border border-neutral-300 rounded-lg text-start overflow-auto h-[200px]">
				{patients?.map((patient, index) => (
					<li
						key={index}
						onClick={() => setSelectedPatient(patient)}
						onKeyDown={() => {}}
						className={clsx(
							"flex w-full py-2 px-4  hover:bg-primary-50 hover:text-primary-500 group cursor-pointer",
							selectedPatient?.id === patient.id ? "text-primary-500 bg-primary-50" : "text-neutral-600",
						)}
					>
						<span>
							{patient.user_profile.name} - {patient.email}
						</span>
					</li>
				))}
				{page <= maxPage && (
					<div ref={ref} className="flex justify-center mt-5">
						<Loader />
						<span>Loading...</span>
					</div>
				)}
			</ul>
			<div className="flex justify-center space-x-3 mt-9">
				<Button label="Cancel" secondary onClick={() => modal.close()} className="sm:px-[50px]" />
				<Button
					label={"Delete"}
					onClick={handleDelete}
					className="sm:px-[50px]"
					isProcessing={isProcessing}
					disabled={!selectedPatient}
				/>
			</div>
		</div>
	);
}
