import { getProviderDetails } from "@/app/components/providers/actions";
import ProviderForm from "@/app/components/providers/provider-form";

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const response = await getProviderDetails(id);

	return <ProviderForm account={response} />;
}
