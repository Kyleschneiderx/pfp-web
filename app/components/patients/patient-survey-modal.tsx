import ModalCmp from "@/app/components/elements/ModalCmp";
import { capitalizeFirstLetter, formatDateToLocal } from "@/app/lib/utils";
import type { PatientSurveyModel } from "@/app/models/patient_model";
import { parseISO } from "date-fns";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	patientSurvey: PatientSurveyModel[];
}

export default function PatientSurveyModal({ isOpen, onClose, patientSurvey }: Props) {
	const lastSurvey = patientSurvey[patientSurvey.length - 1];
	const lastUpdatedAt = lastSurvey?.updated_at || lastSurvey?.created_at;
	const displayDate = lastUpdatedAt ? formatDateToLocal(parseISO(lastUpdatedAt)) : "";

	return (
		<ModalCmp
			isOpen={isOpen}
			handleClose={onClose}
			showCloseBtn
			title={`Patient's Survey ${displayDate ? `(${displayDate})` : ""}`}
		>
			<div className="space-y-[20px] max-h-[80vh] max-w-[80vw] overflow-y-auto">
				{patientSurvey.map((surveyResponse, surveyIndex) => (
					<div key={surveyResponse.id || surveyIndex} className="pb-4 border-b last:border-b-0 border-neutral-200">
						{surveyResponse.survey_questions && surveyResponse.survey_questions.length > 0 ? (
							<div className="space-y-[20px]">
								{surveyResponse.survey_questions.map((question, questionIndex) => (
									<div key={question.id || questionIndex}>
										<div className="flex mb-2">
											<span>{questionIndex + 1}.&nbsp;</span>
											<p>{question.question}</p>
										</div>
										<div className="text-sm ml-4 sm:flex">
											<div className="space-x-2">
												<span>Answer:</span>
												<span className="font-semibold">
													{capitalizeFirstLetter(question.user_survey_question_answer?.yes_no)}
												</span>
											</div>

											{question.user_survey_question_answer?.yes_no === "yes" && (
												<div className="space-x-2">
													<span className="sm:ml-[50px]">How much does it bother you?: </span>
													<span className="font-semibold">
														{question.user_survey_question_answer?.if_yes_how_much_bother}
													</span>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-neutral-600">No questions available for this survey.</p>
						)}
					</div>
				))}
			</div>
		</ModalCmp>
	);
}
