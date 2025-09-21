import Button from "../elements/Button";
import { useModal } from "@/app/contexts/ModalContext";
import Input from "../elements/Input";
import { ClockIcon, PlusIcon, TextQuoteIcon, UserIcon, VideoIcon, XIcon } from "lucide-react";
import SelectCmp from "../elements/SelectCmp";
import Image from "next/image";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import type { Availability, AvailabilityRule } from "@/app/models/availabilities";
import { Controller, type ControllerRenderProps, useController, useForm } from "react-hook-form";
import InputCalendar from "../elements/InputCalendar";
import { DAYS_OF_WEEK } from "@/app/lib/constants";
import { format, set } from "date-fns";
import { timeToDate } from "@/app/lib/utils";
import { useMemo } from "react";
import clsx from "clsx";
import type { Meeting } from "@/app/models/meetings";
import Link from "next/link";

export default function CalendarEventModal({
	meeting,
	onClose,
	onSubmit,
}: { meeting?: Meeting; onClose: (callback?: () => void) => void; onSubmit: (data: Availability) => void }) {
	return (
		<div className="flex-1 overflow-y-auto p-6 w-full h-full sm:max-w-[360px]">
			<div className="flex flex-row items-center text-neutral-900">
				<Image src={ArrowLeft} alt="Arrow left" className="cursor-pointer flex-shrink-0" onClick={() => onClose()} />
				<p className="text-2xl font-semibold ml-2">{meeting?.user?.user_profile.name}</p>
			</div>
			<div className="space-y-3 mt-12 text-neutral-900">
				<div className="flex flex-row space-x-5">
					<ClockIcon className="w-5 h-5 inline-flex items-center mt-1" />
					<div className="flex flex-col items-start space-y-1 font-semibold">
						<div className="flex flex-row items-center space-x-1">
							<p>{format(new Date(meeting?.starts_at ?? ""), "EEEE, MMMM d")}</p>
						</div>
						<div className="flex flex-row items-center space-x-3">
							<p>{format(new Date(meeting?.starts_at ?? ""), "hh:mm aa")}</p>
							<p>{"-"}</p>
							<p>{format(new Date(meeting?.ends_at ?? ""), "hh:mm aa")}</p>
						</div>
					</div>
				</div>
				<div className="flex flex-col space-y-3 mt-12">
					<div className="flex flex-row items-center space-x-5">
						<UserIcon className="w-5 h-5 flex-shrink-0" />
						<Link href={`/patients/${meeting?.user?.id}/edit`} className="hover:text-neutral-700" target="_blank">
							{meeting?.user?.email}
						</Link>
					</div>
					<div className="flex flex-row items-center space-x-5 break-all">
						<TextQuoteIcon className="w-5 h-5 flex-shrink-0" />
						<p>{meeting?.schedule?.description}</p>
					</div>
					{/* <div className="flex flex-row w-full justify-center break-all items-center space-x-5">
						<Link
							href={`/patients/${meeting?.user?.id}/edit`}
							className="hover:text-neutral-700 text-blue-500"
							target="_blank"
						>
							https://app.pelvicfloorpro.com/meetings/123-456-789/room
						</Link>
					</div> */}
					<Button label="Visit" className="w-full !mt-10" />
				</div>

				{/* <div className="flex flex-col-reverse sm:flex-row gap-y-3">
					<Button label="Cancel" secondary className="ml-auto mr-3 w-full sm:w-auto" onClick={() => onClose()} />
					<Button label="Save" className="w-full sm:w-auto" type="submit" />
				</div> */}
			</div>
		</div>
	);
}
