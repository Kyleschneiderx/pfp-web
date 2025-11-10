import PfPlanForm from "@/app/components/pf-plans/pfplan-form";
import { getPfPlanDetails } from "@/app/services/server_side/pfplans";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const response = await getPfPlanDetails(id);
  return <PfPlanForm action="Edit" pfPlan={response} />;
}
