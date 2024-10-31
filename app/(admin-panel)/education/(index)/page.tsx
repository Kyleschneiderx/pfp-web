import CommonSort from "@/app/components/common-sort";
import { fetchEducations } from "@/app/components/education/actions";
import EducationList from "@/app/components/education/education-list";
import Button from "@/app/components/elements/Button";
import IconAddButton from "@/app/components/elements/mobile/IconAddButton";
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
        <SearchCmp placeholder="Search educations" className="mr-4 sm:mr-0" />
        <CommonSort field="title" />
        <Link href="/education/create" className="ml-auto">
          <Button label="Add Education" showIcon className="hidden sm:flex" />
          <IconAddButton className="sm:hidden" />
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
