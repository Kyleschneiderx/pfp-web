import { getPracticeDetails } from "@/app/components/practices/actions";
import PracticeForm from "@/app/components/practices/practice-form";

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const response = await getPracticeDetails(id);

	return <PracticeForm practice={response} />;
}
