"use client";

import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

export default function AccessControl({
	required,
	children,
	fallback,
}: { required?: string[]; children: React.ReactNode; fallback?: React.ReactNode }) {
	const { permissions, isAdmin } = useAuth();

	if (isAdmin || !required?.length) return <>{children}</>;

	const hasAccess = required.some((require) => permissions?.includes(require));

	return hasAccess ? <>{children}</> : <>{fallback}</>;
}
