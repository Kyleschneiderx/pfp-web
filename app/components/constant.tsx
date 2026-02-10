import { PERMISSIONS } from "../lib/constants";
import ChatIcon from "./icons/chat_icon";
import ContentIcon from "./icons/content_icon";
import DashboardIcon from "./icons/dashboard_icon";
import PatientIcon from "./icons/patient_icon";
import SettingsIcon from "./icons/settings";
import StaffIcon from "./icons/staffs_icon";
import TelehealthIcon from "./icons/telehealth_icon";

export const NAVIGATIONS = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: <DashboardIcon activeUrl="/dashboard" />,
	},
	{
		title: "Patients",
		url: "/patients",
		permissions: [PERMISSIONS.PATIENT_VIEW],
		icon: <PatientIcon activeUrl="/patients" />,
	},
	// {
	// 	title: "Practices",
	// 	url: "/practices",
	// 	icon: <ProviderIcon activeUrl="/practices" />,
	// },
	{
		title: "Accounts",
		url: "/accounts",
		permissions: [],
		icon: <StaffIcon activeUrl="/accounts" />,
		subItems: [
			{
				title: "Admins",
				permissions: [],
				url: "/accounts/admins",
			},
			{
				title: "Providers",
				permissions: [],
				url: "/accounts/providers",
			},
			{
				title: "Roles",
				permissions: [],
				url: "/accounts/roles",
			},
		],
	},
	{
		title: "Contents",
		url: "/contents",
		permissions: [
			PERMISSIONS.EXERCISE_VIEW,
			PERMISSIONS.WORKOUT_VIEW,
			PERMISSIONS.EDUCATION_VIEW,
			PERMISSIONS.PFPLAN_VIEW,
		],
		icon: <ContentIcon activeUrl="/contents" />,
		subItems: [
			{
				title: "Execises",
				permissions: [PERMISSIONS.EXERCISE_VIEW],
				url: "/contents/exercises",
			},
			{
				title: "Workouts",
				permissions: [PERMISSIONS.WORKOUT_VIEW],
				url: "/contents/workouts",
			},
			{
				title: "Educations",
				permissions: [PERMISSIONS.EDUCATION_VIEW],
				url: "/contents/education",
			},
			{
				title: "PF Plans",
				permissions: [PERMISSIONS.PFPLAN_VIEW],
				url: "/contents/pf-plans",
			},
		],
	},
	{
		title: "Telehealth",
		url: "/telehealth",
		permissions: [PERMISSIONS.VISIT_VIEW],
		icon: <TelehealthIcon activeUrl="/telehealth" />,
	},
	{
		title: "Support Chat",
		url: "/support-chat",
		permissions: [PERMISSIONS.CHAT_PROVIDER, PERMISSIONS.CHAT_GROUP],
		icon: <ChatIcon activeUrl="/support-chat" />,
	},
	{
		title: "Settings",
		url: "/settings",
		permissions: [],
		icon: <SettingsIcon activeUrl="/settings" />,
		subItems: [
			{
				title: "AI Coach",
				permissions: [],
				url: "/settings/ai-coach",
			},
			{
				title: "Promo Codes",
				permissions: [],
				url: "/settings/promo-codes",
			},
			{
				title: "Form Builder",
				permissions: [],
				url: "/settings/form-builder",
			},
		],
	},
];
