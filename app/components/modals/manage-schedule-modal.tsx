"use client";

import ScheduleForm from "@/app/components/schedules/schedule-form";
import useAuth from "@/app/hooks/useAuth";
import type { Schedule } from "@/app/models/schedules";
import { getAccountSchedule } from "@/app/services/client_side/accounts";
import { useEffect, useState } from "react";

export default function ManageScheduleModal({
	onClose,
}: {
	onClose: (callback?: () => void) => void;
}) {
	const { user } = useAuth();
	const [defaultSchedule, setDefaultSchedule] = useState<Partial<Schedule>>();

	useEffect(() => {
		const load = async () => {
			if (!user) return;
			const schedule = await getAccountSchedule(user.id);
			setDefaultSchedule(schedule ?? undefined);
		};
		void load();
	}, [user]);

	return (
		<ScheduleForm
			variant="modal"
			defaultSchedule={defaultSchedule}
			onCancel={() => onClose()}
			onSuccess={() => onClose()}
		/>
	);
}
