"use client";
import Search from "@/features/search/search";
import { Statement } from "@/features/statement/statement";
import { useState } from "react";

export default function Home() {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<>
			<Search isLoading={isLoading} />
			<Statement setIsLoading={setIsLoading} isLoading={isLoading} />
		</>
	);
}
