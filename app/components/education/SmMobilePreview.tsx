import { convertDraftjsToHtml, getFileContentType } from "@/app/lib/utils";
import { EditorState } from "draft-js";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Clock3,
  Heart,
  Search,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../elements/Card";
import CardBanner from "../elements/CardBanner";

interface Props {
  title?: string;
  description?: string;
  banner?: File | string | null;
  media?: File | string | null;
  content?: EditorState;
  closePreview?: () => void;
}

export default function SmMobilePreview({
  title,
  description,
  banner,
  media,
  content,
  closePreview,
}: Props) {
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [educContent, setEducContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    if (banner) {
      if (banner instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(banner);
      } else {
        setBannerPreview(banner);
      }
    }
  }, [banner]);

  useEffect(() => {
    if (media) {
      if (media instanceof File) {
        if (getFileContentType(media).startsWith("video/")) {
          setIsVideo(true);
          const videoURL = URL.createObjectURL(media);
          setMediaPreview(videoURL);
        } else {
          setIsVideo(false);
          const reader = new FileReader();
          reader.onload = () => {
            setMediaPreview(reader.result as string);
          };
          reader.readAsDataURL(media);
        }
      } else if (typeof media === "string") {
        const is_video = [".mp4"].some((extension) =>
          media.endsWith(extension)
        );
        setIsVideo(is_video);
        setMediaPreview(media);
      }
    }
  }, [media]);

  useEffect(() => {
    if (content) {
      const htmlContent = convertDraftjsToHtml(content);
      setEducContent(htmlContent);
    }
  }, [content]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === 0 ? 1 : prev));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 1 ? 0 : prev));
  };

  return (
    <div className="sm:hidden">
      <div className="">
        <div className="flex transition-transform duration-500">
          {/* First Page */}
          {currentIndex === 0 ? (
            <div className="w-full">
              <div
                className="flex items-center cursor-pointer mb-2"
                onClick={closePreview}
              >
                <ChevronLeft size={18} />
                <span className="text-sm">Go Back to Editing</span>
              </div>
              <div className="flex items-center">
                <p className="text-2xl font-semibold">Education</p>
                <div className="flex items-center space-x-3 border rounded-lg border-neutral-200 py-1 px-3 text-sm text-neutral-300 ml-auto mr-2">
                  <span>Search Education</span>
                  <Search size={18} fill="#c9c9c9" />
                </div>
                <Clock3 fill="#c9c9c9" stroke="white" />
              </div>
              <div className="mt-4">
                {!banner ? (
                  <div className="h-[200px] bg-neutral-200"></div>
                ) : (
                  bannerPreview && (
                    <CardBanner
                      url={bannerPreview ?? ""}
                      width={410}
                      className="mx-auto"
                    />
                  )
                )}
                <Card className="mx-auto rounded-t-none py-2 px-2">
                  <p className="text-sm font-medium truncate">
                    {title || "[Your title here]"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {description || "[Your description here]"}
                  </p>
                </Card>
              </div>
              <div className="mt-4">
                <div className="h-[200px] bg-neutral-300"></div>
                <Card className="mx-auto rounded-t-none py-2 px-2">
                  <div className="h-[20px] bg-neutral-300"></div>
                  <div className="h-[40px] bg-neutral-200 mt-1"></div>
                </Card>
              </div>
            </div>
          ) : (
            // {/* Second Page */}
            <div className="w-full">
              <div
                className="flex items-center cursor-pointer mb-2"
                onClick={closePreview}
              >
                <ChevronLeft size={18} />
                <span className="text-sm">Go Back to Editing</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-2xl mt-1 font-semibold truncate">
                  {title || "[Your title here]"}
                </p>
                <div className="flex space-x-2">
                  <Heart size={18} fill="#c9c9c9" stroke="#c9c9c9" />
                  <Share2 size={18} fill="#c9c9c9" stroke="#c9c9c9" />
                </div>
              </div>
              {!media ? (
                <div className="h-[200px] bg-neutral-200"></div>
              ) : mediaPreview && isVideo ? (
                <video src={mediaPreview} controls className="w-full h-auto" />
              ) : (
                <CardBanner
                  url={mediaPreview ?? ""}
                  width={410}
                  className="mx-auto mt-3 !rounded-none"
                />
              )}
              <div
                dangerouslySetInnerHTML={{ __html: educContent }}
                className="prose prose-li:marker:text-black mt-6 overflow-auto content-preview"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-4">
        <div
          className="p-3 rounded-full bg-white border border-neutral-200 cursor-pointer"
          onClick={handlePrev}
        >
          <ArrowLeft size={28} />
        </div>
        <div
          className="p-3 rounded-full bg-white border border-neutral-200 cursor-pointer"
          onClick={handleNext}
        >
          <ArrowRight size={28} />
        </div>
      </div>
    </div>
  );
}
