export const CONFIRM_SAVE_DESCRIPTION =
	"Please confirm that you want to save this. You can always edit them later if needed.";

export const CONFIRM_DELETE_DESCRIPTION =
	"Are you sure you want to delete this? This action is permanent and cannot be undone.";

export const CREATE_PATIENT_DESCRIPTION =
	"Fill out the form below to create a new patient profile with the required details.";

export const UPDATE_DESCRIPTION =
	"Update the details of the existing information below. Make sure to review all changes before saving.";

export const CONFIRM_INVITE_DESCRIPTION =
	"Please confirm that you want to send this invitation. Once sent, the recipient will be notified.";

export const CREATE_EXERCISE_DESCRIPTION =
	"Fill out the form below to create a new exercise. Ensure all relevant details are provided to get started.";

export const LIST_CATEGORIES_DESCRIPTION =
	"Browse through the list of available categories below. Select a category to edit or delete it.";

export const CREATE_WORKOUT_DESCRIPTION =
	"Fill out the form below to create a new workout. Include all necessary details to customize your routine.";

export const CREATE_PFPLAN_DESCRIPTION =
	"Design personalized fitness plan by adding days and including specific exercises and educational content for each day.";

export const CREATE_EDUCATION_DESCRIPTION =
	"Compose an education on health or exercise below. Share valuable insights and information to educate your readers effectively.";

export const FIRESTORE_LIMIT = 10;

export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const PAGE_ITEMS = 15;

export const DEFAULT_LIST = { data: [], page: 1, page_items: PAGE_ITEMS, max_page: 2 };

export const DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

export const STATUSES = {
	UPCOMING: 6,
	INCOMPLETE: 7,
	COMPLETE: 8,
	CANCELLED: 9,
};

export const ROLES = {
	ADMIN: 1,
	USER: 2,
	PROVIDER: 3,
};

export const PERMISSIONS = {
	STATS_USERS: "users_stats",
	STATS_APP_PAGES: "app_page_stats",
	STATS_DAILY_SIGNUPS: "daily_signup_stats",
	STATS_AI_PROMPTS: "ai_prompt_stats",
	STATS_INVITED: "invite_stats",
	STATS_VISIT_PAYMENT: "visit_payment_stats",
	PATIENT_VIEW: "view_patient",
	PATIENT_CREATE: "add_patient",
	PATIENT_EDIT: "edit_patient",
	PATIENT_DELETE: "delete_patient",
	PATIENT_INVITE: "invite_patient",
	PATIENT_ASSIGN_PFPLAN: "assign_patient_pfplan",
	EXERCISE_VIEW: "view_exercise",
	EXERCISE_CREATE: "add_exercise",
	EXERCISE_EDIT: "edit_exercise",
	EXERCISE_DELETE: "delete_exercise",
	WORKOUT_VIEW: "view_workout",
	WORKOUT_CREATE: "add_workout",
	WORKOUT_EDIT: "edit_workout",
	WORKOUT_DELETE: "delete_workout",
	EDUCATION_VIEW: "view_education",
	EDUCATION_CREATE: "add_education",
	EDUCATION_EDIT: "edit_education",
	EDUCATION_DELETE: "delete_education",
	PFPLAN_VIEW: "view_pfplan",
	PFPLAN_CREATE: "add_pfplan",
	PFPLAN_EDIT: "edit_pfplan",
	PFPLAN_DELETE: "delete_pfplan",
	PFPLAN_DUPLICATE: "duplicate_pfplan",
	CHAT_PROVIDER: "provider_chat",
	CHAT_GROUP: "group_chat",
	VISIT_VIEW: "view_visit",
	VISIT_NOTE_VIEW: "view_visit_note",
	VISIT_NOTE_GENERATE: "generate_visit_note",
	VISIT_TRANSCRIPTION_VIEW: "view_visit_transcription",
	VISIT_TRANSCRIPTION_GENERATE: "generate_visit_transcription",
	VISIT_CANCEL: "cancel_visit",
	VISIT_COMPLETE: "complete_visit",
	VISIT_DRAFT: "draft_visit",
};

export const STATES = [
	{
		name: "Alabama",
		abbreviation: "AL",
	},
	{
		name: "Alaska",
		abbreviation: "AK",
	},
	{
		name: "American Samoa",
		abbreviation: "AS",
	},
	{
		name: "Arizona",
		abbreviation: "AZ",
	},
	{
		name: "Arkansas",
		abbreviation: "AR",
	},
	{
		name: "California",
		abbreviation: "CA",
	},
	{
		name: "Colorado",
		abbreviation: "CO",
	},
	{
		name: "Connecticut",
		abbreviation: "CT",
	},
	{
		name: "Delaware",
		abbreviation: "DE",
	},
	{
		name: "District Of Columbia",
		abbreviation: "DC",
	},
	{
		name: "Federated States Of Micronesia",
		abbreviation: "FM",
	},
	{
		name: "Florida",
		abbreviation: "FL",
	},
	{
		name: "Georgia",
		abbreviation: "GA",
	},
	{
		name: "Guam",
		abbreviation: "GU",
	},
	{
		name: "Hawaii",
		abbreviation: "HI",
	},
	{
		name: "Idaho",
		abbreviation: "ID",
	},
	{
		name: "Illinois",
		abbreviation: "IL",
	},
	{
		name: "Indiana",
		abbreviation: "IN",
	},
	{
		name: "Iowa",
		abbreviation: "IA",
	},
	{
		name: "Kansas",
		abbreviation: "KS",
	},
	{
		name: "Kentucky",
		abbreviation: "KY",
	},
	{
		name: "Louisiana",
		abbreviation: "LA",
	},
	{
		name: "Maine",
		abbreviation: "ME",
	},
	{
		name: "Marshall Islands",
		abbreviation: "MH",
	},
	{
		name: "Maryland",
		abbreviation: "MD",
	},
	{
		name: "Massachusetts",
		abbreviation: "MA",
	},
	{
		name: "Michigan",
		abbreviation: "MI",
	},
	{
		name: "Minnesota",
		abbreviation: "MN",
	},
	{
		name: "Mississippi",
		abbreviation: "MS",
	},
	{
		name: "Missouri",
		abbreviation: "MO",
	},
	{
		name: "Montana",
		abbreviation: "MT",
	},
	{
		name: "Nebraska",
		abbreviation: "NE",
	},
	{
		name: "Nevada",
		abbreviation: "NV",
	},
	{
		name: "New Hampshire",
		abbreviation: "NH",
	},
	{
		name: "New Jersey",
		abbreviation: "NJ",
	},
	{
		name: "New Mexico",
		abbreviation: "NM",
	},
	{
		name: "New York",
		abbreviation: "NY",
	},
	{
		name: "North Carolina",
		abbreviation: "NC",
	},
	{
		name: "North Dakota",
		abbreviation: "ND",
	},
	{
		name: "Northern Mariana Islands",
		abbreviation: "MP",
	},
	{
		name: "Ohio",
		abbreviation: "OH",
	},
	{
		name: "Oklahoma",
		abbreviation: "OK",
	},
	{
		name: "Oregon",
		abbreviation: "OR",
	},
	{
		name: "Palau",
		abbreviation: "PW",
	},
	{
		name: "Pennsylvania",
		abbreviation: "PA",
	},
	{
		name: "Puerto Rico",
		abbreviation: "PR",
	},
	{
		name: "Rhode Island",
		abbreviation: "RI",
	},
	{
		name: "South Carolina",
		abbreviation: "SC",
	},
	{
		name: "South Dakota",
		abbreviation: "SD",
	},
	{
		name: "Tennessee",
		abbreviation: "TN",
	},
	{
		name: "Texas",
		abbreviation: "TX",
	},
	{
		name: "Utah",
		abbreviation: "UT",
	},
	{
		name: "Vermont",
		abbreviation: "VT",
	},
	{
		name: "Virgin Islands",
		abbreviation: "VI",
	},
	{
		name: "Virginia",
		abbreviation: "VA",
	},
	{
		name: "Washington",
		abbreviation: "WA",
	},
	{
		name: "West Virginia",
		abbreviation: "WV",
	},
	{
		name: "Wisconsin",
		abbreviation: "WI",
	},
	{
		name: "Wyoming",
		abbreviation: "WY",
	},
];
