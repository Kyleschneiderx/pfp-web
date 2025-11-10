export default function DataList<T>({
	children,
	data,
	header,
}: { children: React.ReactNode; header?: React.ReactNode; data?: T[] }) {
	return (
		<>
			{header}
			{!data?.length ? <p className="text-center mx-auto mt-[300px]">No result found</p> : children}
		</>
	);
}
