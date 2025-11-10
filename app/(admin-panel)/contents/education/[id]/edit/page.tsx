import EducationForm from "@/app/components/education/education-form";
import { getEducationDetails } from "@/app/services/server_side/education";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const response = await getEducationDetails(id);
  return <EducationForm action="Edit" education={response} />;
}
