export default function FormBuilderFormLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="-mx-5 -mb-5 -mt-5 flex flex-col bg-neutral-50">{children}</div>;
}
