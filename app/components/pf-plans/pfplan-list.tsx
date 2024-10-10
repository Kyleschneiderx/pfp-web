"use client";

import Card from "@/app/components/elements/Card";
import { PfPlanModel } from "@/app/models/pfplan_model";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import Loader from "../elements/Loader";
import StatusBadge from "../elements/StatusBadge";
import { fetchPfPlans } from "./action";
import PfPlanAction from "./pfplan-action";

interface Props {
  name: string;
  sort: string;
  initialList: PfPlanModel[] | [];
  maxPage: number;
}

export default function PfPlanList({
  name,
  sort,
  initialList,
  maxPage,
}: Props) {
  const [pfPlans, setPfPlans] = useState(initialList);
  const [page, setPage] = useState(1);
  const [ref, inView] = useInView();

  const loadMorePfPlans = async () => {
    const next = page + 1;
    const { pfPlanList } = await fetchPfPlans({
      page: next,
      name,
      sort,
    });
    if (pfPlanList.length) {
      setPage(next);
      setPfPlans((prev: PfPlanModel[]) => [
        ...(prev?.length ? prev : []),
        ...pfPlanList,
      ]);
    }
  };

  useEffect(() => {
    if (inView && page < maxPage) {
      loadMorePfPlans();
    }
  }, [inView]);

  useEffect(() => {
    setPfPlans(initialList);
    setPage(1);
  }, [sort, name, initialList]);

  return (
    <>
      <div className="flex flex-wrap">
        {pfPlans.map((pfplan) => (
          <div
            key={pfplan.id}
            className="w-[351px] mr-7 mb-7 text-neutral-900"
          >
            <CardBanner url={pfplan.photo} />
            <Card className="min-h-[158px] rounded-t-none py-4 px-5">
              <div className="flex">
                <StatusBadge label={pfplan.status.value} />
                <PfPlanAction pfplan={pfplan} />
              </div>
              <p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">
                {pfplan.name}
              </p>
              <p className="text-sm text-neutral-700 mt-1">
                {pfplan.description}
              </p>
            </Card>
          </div>
        ))}
      </div>
      {page < maxPage && (
        <div ref={ref} className="flex justify-center mt-5">
          <Loader />
          <span>Loading...</span>
        </div>
      )}
    </>
  );
}
