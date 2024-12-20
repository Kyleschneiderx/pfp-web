import ModalCmp from "@/app/components/elements/ModalCmp";
import { capitalizeFirstLetter } from "@/app/lib/utils";
import { PatientSurveyModel } from "@/app/models/patient_model";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientSurvey: PatientSurveyModel[];
}

export default function PatientSurveyModal({
  isOpen,
  onClose,
  patientSurvey,
}: Props) {
  return (
    <ModalCmp
      isOpen={isOpen}
      handleClose={onClose}
      showCloseBtn
      title="Patient's Survey"
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
                <span className="font-semibold">
                  {capitalizeFirstLetter(
                    item.user_survey_question_answer?.yes_no
                  )}
                </span>
              </div>

              {item.user_survey_question_answer?.yes_no === "yes" && (
                <div className="space-x-2">
                  <span className="sm:ml-[50px]">
                    How much does it bother you?:{" "}
                  </span>
                  <span className="font-semibold">
                    {item.user_survey_question_answer?.if_yes_how_much_bother}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ModalCmp>
  );
}
