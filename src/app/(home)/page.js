"use client";
import Search from "@/features/search/search";
import { Statement } from "@/features/statement/statement";
import { useState, Suspense } from "react";

export default function Home() {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<>
			<Suspense>
				<Search isLoading={isLoading} />
				<Statement setIsLoading={setIsLoading} isLoading={isLoading} />
			</Suspense>
		</>
	);
}
