"use client";
import Search from "@/features/search/search";
import { Statement } from "@/features/statement/statement";
import { Suspense } from "react";

export default function Home() {
	return (
		<>
			<Suspense>
				<Statement />
			</Suspense>
		</>
	);
}
