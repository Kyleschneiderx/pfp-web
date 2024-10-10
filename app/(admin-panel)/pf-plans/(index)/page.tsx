import CommonSort from "@/app/components/common-sort";
import Button from "@/app/components/elements/Button";
import SearchCmp from "@/app/components/elements/SearchCmp";
import { fetchPfPlans } from "@/app/components/pf-plans/action";
import PfPlanList from "@/app/components/pf-plans/pfplan-list";
import { PfPlanModel } from "@/app/models/pfplan_model";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page: string;
    name?: string;
    sort?: string;
  };
}) {
  const name = searchParams?.name || "";
  const sort = searchParams?.sort || "name:ASC";

  let pfPlans: PfPlanModel[] = [];
  let maxPage: number = 0;
  let errorMessage: string = "";

  const displayNoRecord = (msg: string) => {
    return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
  };

  try {
    const { pfPlanList, max_page } = await fetchPfPlans({
      name,
      sort,
    });
    pfPlans = pfPlanList;
    maxPage = max_page;
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <>
      <div className="flex items-center mb-8">
        <SearchCmp placeholder="Search PF Plan" />
        <CommonSort field="name" />
        <Link href="/pf-plans/create" className="ml-auto">
          <Button label="Add Plan" showIcon />
        </Link>
      </div>
      <div>
        {errorMessage ? (
          displayNoRecord(errorMessage)
        ) : (
          <PfPlanList
            initialList={pfPlans}
            name={name}
            sort={sort}
            maxPage={maxPage}
          />
        )}
      </div>
    </>
  );
}
