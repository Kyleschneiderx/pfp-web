"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { PERMISSIONS } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import type { EducationModel } from "@/app/models/education_model";
import type { ErrorModel } from "@/app/models/error_model";
import { deleteEducation, saveEducation } from "@/app/services/client_side/educations";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import Loader from "../elements/Loader";
import StatusBadge from "../elements/StatusBadge";
import { fetchEducations } from "./actions";
import DataList from "../data-list";
import SearchCmp from "../elements/SearchCmp";
import CommonSort from "../common-sort";
import Link from "next/link";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";
import { useModal } from "@/app/contexts/ModalContext";
import useAuth from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { IconTransfer } from "@tabler/icons-react";
import RenameModal from "../modals/rename-modal";
import { toFormData } from "@/app/lib/utils";

interface Props {
	name: string;
	sort: string;
	initialList: EducationModel[] | [];
	maxPage: number;
}

export default function EducationList({ name, sort, initialList, maxPage }: Props) {
	const modal = useModal();
	const { hasPermission } = useAuth();
	const router = useRouter();

	const [educations, setEducations] = useState(initialList);
	const [page, setPage] = useState(1);
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();

	const loadMoreEducations = async () => {
		const next = page + 1;
		const { educationList } = await fetchEducations({
			page: next,
			name,
			sort,
		});
		if (educationList.length) {
			setPage(next);
			setEducations((prev: EducationModel[]) => [...(prev?.length ? prev : []), ...educationList]);
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

	const handleDelete = async (education: EducationModel) => {
		modal.open({
			type: "confirm",
			title: "Delete Education",
			message: "Are you you want to delete this education?",
			onConfirm: async () => {
				try {
					await deleteEducation(education!.id);
					await revalidatePage("/contents/education");
					showSnackBar({
						message: "Education successfully deleted.",
						success: true,
					});
					modal.closeAll();
				} catch (error) {
					const apiError = error as ErrorModel;

					if (apiError?.msg) {
						showSnackBar({ message: apiError.msg, success: false });
					}
				}
			},
		});
	};

	const handleRename = async (education: EducationModel) => {
		modal.open({
			type: "default",
			title: "Rename Workout",
			component: ({ close }) => {
				return (
					<RenameModal
						data={education}
						type={"education"}
						onClose={close}
						onSubmit={async ({ name }) => {
							try {
								const formData = toFormData({ title: name });
								await saveEducation({ method: "PUT", id: education!.id, body: formData });
								await revalidatePage("/contents/education");
								showSnackBar({
									message: "Education successfully renamed.",
									success: true,
								});
								modal.closeAll();
							} catch (error) {
								const apiError = error as ErrorModel;

								if (apiError?.msg) {
									showSnackBar({ message: apiError.msg, success: false });
								}
							}
						}}
					/>
				);
			},
		});
	};

	return (
		<DataList
			data={educations}
			header={
				<div className="flex items-center mb-8">
					<SearchCmp placeholder="Search educations" className="mr-4 sm:mr-0" />
					<CommonSort field="title" />
					{hasPermission(PERMISSIONS.EDUCATION_CREATE) && (
						<Link href="/contents/education/create" className="ml-auto">
							<Button label="Add Education" showIcon className="hidden sm:flex" />
							<IconAddButton className="sm:hidden" />
						</Link>
					)}
				</div>
			}
		>
			<div className="flex flex-wrap">
				{educations.map((education) => (
					<div key={education.id} className="w-[351px] mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900">
						<CardBanner url={education.photo} />
						<Card className="min-h-[158px] rounded-t-none py-4 px-5">
							<div className="flex">
								<StatusBadge label={education.status.value} />
								{hasPermission([PERMISSIONS.EDUCATION_EDIT, PERMISSIONS.EDUCATION_DELETE]) && (
									<ResponsiveActionMenu
										title={education.title}
										className="cursor-pointer ml-auto"
										onEdit={
											hasPermission(PERMISSIONS.EDUCATION_EDIT)
												? () => router.push(`/contents/education/${education.id}/edit`)
												: undefined
										}
										onDelete={hasPermission(PERMISSIONS.EDUCATION_DELETE) ? () => handleDelete(education) : undefined}
										customActions={[
											...(hasPermission(PERMISSIONS.EDUCATION_EDIT)
												? [
														{
															label: "Rename",
															icon: <IconTransfer size={16} />,
															onClick: () => handleRename(education),
														},
													]
												: []),
										]}
									/>
								)}
							</div>
							<p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">{education.title}</p>
							<p className="text-sm text-neutral-700 mt-1 line-clamp-5" title={education.description}>
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
		</DataList>
	);
}
