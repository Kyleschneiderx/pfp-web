import { getCustomFormDetails } from "@/app/components/form-builder/actions";
import FormBuilderForm from "@/app/components/form-builder/form-builder-form";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
	const idOrSlug = params.id;
	const form = await getCustomFormDetails(idOrSlug);
	if (!form) notFound();
	return <FormBuilderForm customForm={form} />;
}
