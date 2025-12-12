import ModalCmp from "@/app/components/elements/ModalCmp";
import { capitalizeFirstLetter, formatDateToLocal } from "@/app/lib/utils";
import { PatientSurveyModel } from "@/app/models/patient_model";
import { parseISO } from "date-fns";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	patientSurvey: PatientSurveyModel[];
}

export default function PatientSurveyModal({ isOpen, onClose, patientSurvey }: Props) {
	const lastUpdatedAt = patientSurvey[patientSurvey.length - 1]?.user_survey_question_answer?.updated_at;
	return (
		<ModalCmp
			isOpen={isOpen}
			handleClose={onClose}
			showCloseBtn
			title={`Patient's Survey ${lastUpdatedAt ? `(${formatDateToLocal(parseISO(lastUpdatedAt))})` : ""}`}
		>
			<div className="space-y-[20px] max-h-[80vh] max-w-[80vw] overflow-y-auto">
				{patientSurvey.map((item, index) => (
					<div>
						<div className="flex mb-2">
							<span>{index + 1}.&nbsp;</span>
							<p>{item.question}</p>
						</div>
						<div className="text-sm ml-4 sm:flex">
							<div className="space-x-2">
								<span>Answer:</span>
								<span className="font-semibold">{capitalizeFirstLetter(item.user_survey_question_answer?.yes_no)}</span>
							</div>

							{item.user_survey_question_answer?.yes_no === "yes" && (
								<div className="space-x-2">
									<span className="sm:ml-[50px]">How much does it bother you?: </span>
									<span className="font-semibold">{item.user_survey_question_answer?.if_yes_how_much_bother}</span>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</ModalCmp>
	);
}
