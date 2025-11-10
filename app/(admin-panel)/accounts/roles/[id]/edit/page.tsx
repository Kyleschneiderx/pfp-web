import { getAdminDetails } from "@/app/components/admins/actions";
import AdminForm from "@/app/components/admins/admin-form";

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const response = await getAdminDetails(id);

	return <AdminForm account={response} />;
}
