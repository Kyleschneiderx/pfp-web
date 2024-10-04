"use client";

import Card from "@/app/components/elements/Card";
import { EducationModel } from "@/app/models/education_model";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import Loader from "../elements/Loader";
import StatusBadge from "../elements/StatusBadge";
import { fetchEducations } from "./actions";
import EducationAction from "./education-action";

interface Props {
  name: string;
  sort: string;
  initialList: EducationModel[] | [];
  maxPage: number;
}

export default function EducationList({
  name,
  sort,
  initialList,
  maxPage,
}: Props) {
  const [educations, setEducations] = useState(initialList);
  const [page, setPage] = useState(1);
  const [ref, inView] = useInView();

  const loadMoreEducations = async () => {
    const next = page + 1;
    const { educationList } = await fetchEducations({
      page: next,
      name,
      sort,
    });
    if (educationList.length) {
      setPage(next);
      setEducations((prev: EducationModel[]) => [
        ...(prev?.length ? prev : []),
        ...educationList,
      ]);
    }
  };

  useEffect(() => {
    if (inView && page < maxPage) {
      loadMoreEducations();
    }
  }, [inView]);

  useEffect(() => {
    setEducations(initialList);
    setPage(1);
  }, [sort, name, initialList]);

  return (
    <>
      <div className="flex flex-wrap">
        {educations.map((education) => (
          <div
            key={education.id}
            className="w-[351px] mr-7 mb-7 text-neutral-900"
          >
            <CardBanner url={education.photo} />
            <Card className="min-h-[158px] rounded-t-none py-4 px-5">
              <div className="flex">
                <StatusBadge label={education.status.value} />
                <EducationAction education={education} />
              </div>
              <p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">
                {education.title}
              </p>
              <p className="text-sm text-neutral-700 mt-1">
                {education.description}
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
