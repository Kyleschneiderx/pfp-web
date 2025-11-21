import { getPromoCodeDetails } from "@/app/components/promo-codes/actions";
import PromoCodeForm from "@/app/components/promo-codes/promo-code-form";

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const response = await getPromoCodeDetails(id);

	return <PromoCodeForm promoCode={response} />;
}
