import dynamic from "next/dynamic";

const ProfileForm = dynamic(() => import("../../../components/profile"), {
	ssr: false,
});

export default function Page() {
	return <ProfileForm />;
}
