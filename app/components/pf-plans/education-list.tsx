import { EducationModel } from "@/app/models/education_model";
import { ErrorModel } from "@/app/models/error_model";
import { getEducations } from "@/app/services/client_side/educations";
import clsx from "clsx";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";

interface Props {
  title?: string;
  onSelect: (education: EducationModel) => void;
  isOpen: boolean,
}

export default function EducationList({ title = "", onSelect, isOpen }: Props) {
  const [educations, setEducations] = useState<EducationModel[]>([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [ref, inView] = useInView();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchEducations = async (resetPage = false) => {
    try {
      setIsLoading(true);
      const currentPage = resetPage ? 1 : page;
      const params = `title=${title}&sort[]=title:ASC&page=${currentPage}&page_items=20`;
      const { data, max_page } = await getEducations(params);
      setMaxPage(max_page);
      if (currentPage < max_page) {
        setPage(currentPage + 1);
      }
      setEducations((prev: EducationModel[]) => {
        return resetPage ? data : [...prev, ...data];
      });
      setErrorMessage("");
    } catch (error) {
      const apiError = error as ErrorModel;
      setErrorMessage(apiError.msg || "Failed to fetch education list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchEducations(true);
  }, [title]);

  useEffect(() => {
    if (inView && page <= maxPage && !isLoading) {
      fetchEducations();
    }
  }, [inView, page]);

  const truncatedText = (text: string, max: number) => {
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const pClass =
    "truncate max-w-xs overflow-hidden text-ellipsis whitespace-nowrap";

  return (
    <div className={clsx("space-y-3 mt-2", !isOpen && "hidden")}>
      {errorMessage ? (
        <p className="text-center mt-[200px]">{errorMessage}</p>
      ) : (
        educations.map((item) => (
          <div key={item.id} className="flex items-center">
            <div className="flex items-center shadow-bottom w-full p-2">
              <Image
                src={item.photo || "/images/exercise-banner.jpg"}
                width={80}
                height={56}
                alt="Banner"
                placeholder="blur"
                blurDataURL="/images/placeholder.jpg"
                className="w-[80px] h-[56px]"
              />
              <div className="ml-3">
                <p
                  className={clsx(
                    pClass,
                    "text-sm font-medium text-neutral-800 mb-1"
                  )}
                >
                  {truncatedText(item.title, 35)}
                </p>
                <p className={clsx(pClass, "text-xs text-neutral-500")}>
                  {truncatedText(item.description ?? "", 45)}
                </p>
              </div>
              <Plus
                className="ml-auto cursor-pointer"
                onClick={() => onSelect(item)}
              />
            </div>
          </div>
        ))
      )}
      {page < maxPage && (
        <div ref={ref} className="flex justify-center mt-5">
          <Loader />
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
}
