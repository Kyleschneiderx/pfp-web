"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import type { ErrorModel } from "@/app/models/error_model";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Card from "../elements/Card";
import Loader from "../elements/Loader";
import { useModal } from "@/app/contexts/ModalContext";
import Button from "../elements/Button";
import IconAddButton from "../elements/mobile/IconAddButton";
import ManageAvailabilityModal from "../modals/manage-availability-modal";
import type { Availability } from "@/app/models/availabilities";
import type { List, PaginationModel } from "@/app/models/global_model";
import { deleteAvailability, saveAvailability } from "@/app/services/client_side/availabilities";
import { DAYS_OF_WEEK, PAGE_ITEMS } from "@/app/lib/constants";
import { getAvailabilityList } from "./actions";
import clsx from "clsx";
import type { AvailabilitySearchQuery } from "@/app/services/server_side/availabilities";
import { useDebouncedCallback } from "use-debounce";
import dynamic from "next/dynamic";
import FilterList from "../elements/FilterList";
import { timeToDate } from "@/app/lib/utils";

const ResponsiveActionMenu = dynamic(() => import("../elements/ResponsiveActionMenu"), {
	ssr: false,
});

export default function AvailabilityList({ availabilityList }: { availabilityList: List<Availability> }) {
	const modal = useModal();
	const [availabilities, setAvailabilities] = useState<Availability[]>(availabilityList.data);
	const [pagination, setPagination] = useState<PaginationModel>(() => {
		const { data, ...metadata } = availabilityList;

		return metadata;
	});
	const [ref, inView] = useInView();

	const { showSnackBar } = useSnackBar();

	const getList = async (filter?: AvailabilitySearchQuery) => {
		const { data: list, ...metadata } = await getAvailabilityList({
			...filter,
			page: "1",
			page_items: `${PAGE_ITEMS}`,
		});

		setAvailabilities(list);
		setPagination(metadata);
	};

	const loadMore = useCallback(async () => {
		try {
			const response = await getAvailabilityList({
				page: String(Number(pagination.page) + 1),
				page_items: `${PAGE_ITEMS}`,
			});

			const { data, ...metadata } = response;

			setAvailabilities((prev) => [...(prev ?? []), ...data]);

			setPagination(metadata);
		} catch (error) {
			const apiError = error as ErrorModel;
		}
	}, [pagination]);

	const handleFilter = useDebouncedCallback((key: keyof AvailabilitySearchQuery, value: string) => {
		getList({
			[key]: value,
		});
	}, 500);

	useEffect(() => {
		return () => {
			modal.closeAll();
		};
	}, []);

	useEffect(() => {
		if (inView && Number(pagination?.page ?? 0) < (pagination?.max_page ?? 0)) {
			loadMore();
		}
	}, [inView]);

	useEffect(() => {
		const { data, ...metadata } = availabilityList;
		setAvailabilities(data);
		setPagination(metadata);
	}, [availabilityList]);

	const handleSaveAvailability = (data: Availability) => {
		modal.open({
			type: "confirm",
			title: "Save Availability",
			message: "Are you sure you want to save this availability?",
			onConfirm: async ({ toggleProcessing }) => {
				try {
					const response = await saveAvailability({
						method: data?.id ? "PUT" : "POST",
						id: data?.id,
						body: data,
					});

					if (data?.id) {
						setAvailabilities((prev) => {
							return prev?.map((p) => (p.id === response.id ? response : p));
						});
					} else {
						getList();
					}

					modal.closeAll();
				} catch (error) {
					const err = error as ErrorModel;

					showSnackBar({
						message: err.msg,
						success: false,
					});
				}
			},
		});
	};

	const handleOpenPanel = (availability?: Availability) => {
		modal.open({
			type: "panel",
			overlay: false,
			component: ({ close }) => (
				<ManageAvailabilityModal onSubmit={handleSaveAvailability} onClose={close} availability={availability} />
			),
		});
	};

	const handleRemoveAvaialbility = (availability?: Availability) => {
		modal.open({
			type: "confirm",
			title: "Delete Availability",
			message: "Are you sure you want to delete this availability?",
			onConfirm: async () => {
				if (!availability?.id) return;

				try {
					await deleteAvailability(availability?.id);

					showSnackBar({
						message: "Availability deleted successfully",
						success: true,
					});

					setAvailabilities((prev) => {
						return prev?.filter((p) => p.id !== availability.id);
					});

					modal.close();
				} catch (error) {
					const err = error as ErrorModel;

					modal.open({
						type: "alert",
						title: "Error",
						message: err.msg,
					});
				}
			},
		});
	};

	return (
		<>
			<div className="grid">
				<div className="flex flex-row mb-8 items-center gap-x-3">
					<FilterList
						onSearch={(string) => handleFilter("name", string)}
						searchPlaceholder="Search availability"
						searchWrapperClassName="w-full sm:w-[540px]"
					/>
					<div onClick={() => handleOpenPanel()} onKeyDown={undefined} className="ml-0 w-auto sm:ml-auto">
						<Button showIcon label="Add Availability" className="hidden sm:flex" />
						<IconAddButton className="sm:hidden" />
					</div>
				</div>
				{availabilities.length <= 0 ? (
					<p className="text-center w-full mx-auto mt-[270px]">No records found.</p>
				) : (
					<div className="grid grid-cols-12 gap-5">
						{availabilities?.map((availability) => {
							return (
								<Card
									key={availability.id}
									className="p-4 pr-3 text-neutral-900 col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-3"
								>
									<div className="">
										<div className="flex flex-row items-center mb-3">
											<div className="flex flex-col mr-auto mb-1 gap-y-1">
												<p className="text-lg font-semibold">{availability.name}</p>
												<div className="flex flex-row text-neutral-500 gap-x-5 items-center">
													<p className="text-sm ">{availability.timezone}</p>
												</div>
											</div>
											<div className="flex text-end">
												<ResponsiveActionMenu
													onEdit={() => handleOpenPanel(availability)}
													onDelete={() => handleRemoveAvaialbility(availability)}
													title={availability.name}
												/>
											</div>
										</div>

										<div className="flex flex-col gap-y-3">
											{availability.rules.map((rule) => {
												return (
													<div key={rule.id} className="flex flex-row text-sm mb-1 items-center gap-x-5">
														<div
															className={clsx(
																"w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium  text-white",
																!rule.starts_at && !rule.ends_at ? "bg-neutral-300" : "bg-primary-500",
															)}
														>
															{DAYS_OF_WEEK[rule.day - 1]}
														</div>
														<div className="flex flex-row flex-grow text-neutral-700">
															{!rule.starts_at && !rule.ends_at ? (
																<div className="flex flex-row justify-evenly w-full">Unavailable</div>
															) : (
																<div className="flex flex-row flex-grow w-full justify-evenly">
																	<p>{`${timeToDate((rule.starts_at ?? "").toString(), "hh:mm aa")}`}</p>
																	<p>-</p>
																	<p>{`${timeToDate((rule.ends_at ?? "").toString(), "hh:mm aa")}`}</p>
																</div>
															)}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</Card>
							);
						})}
						{pagination && Number(pagination.page) < pagination.max_page && (
							<div ref={ref} className="flex justify-center mt-5">
								<Loader />
								<span>Loading...</span>
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}
