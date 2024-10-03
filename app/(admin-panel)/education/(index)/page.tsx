import CommonSort from "@/app/components/common-sort";
import { fetchEducations } from "@/app/components/educations/actions";
import EducationList from "@/app/components/educations/education-list";
import Button from "@/app/components/elements/Button";
import SearchCmp from "@/app/components/elements/SearchCmp";
import { EducationModel } from "@/app/models/education_model";
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
  const sort = searchParams?.sort || "title:ASC";

  let educations: EducationModel[] = [];
  let maxPage: number = 0;
  let errorMessage: string = "";

  const displayNoRecord = (msg: string) => {
    return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
  };

  try {
    const { educationList, max_page } = await fetchEducations({
      name,
      sort,
    });
    educations = educationList;
    maxPage = max_page;
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <>
      <div className="flex items-center mb-8">
        <SearchCmp placeholder="Search educations" />
        <CommonSort field="title" />
        <Link href="/educations/create" className="ml-auto">
          <Button label="Add education" showIcon />
        </Link>
      </div>
      <div>
        {errorMessage ? (
          displayNoRecord(errorMessage)
        ) : (
          <EducationList
            initialList={educations}
            name={name}
            sort={sort}
            maxPage={maxPage}
          />
        )}
      </div>
    </>
  );
}
