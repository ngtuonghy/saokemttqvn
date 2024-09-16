"use client";
import Search from "@/features/search/search";
import { Statement } from "@/features/statement/statement";
import { useInputState } from "@mantine/hooks";
import { useState } from "react";

export default function Home() {
	const [search, setSearch] = useInputState({
		string: "",
		banksName: "",
	});
	const [date, setDate] = useState([null, null]);
	const [isLoading, setIsLoading] = useState(false);

	return (
		<>
			<Search
				setSearch={setSearch}
				search={search}
				isLoading={isLoading}
				setDate={setDate}
				date={date}
			/>
			<Statement
				setDate={setDate}
				date={date}
				setSearch={setSearch}
				search={search}
				setIsLoading={setIsLoading}
				isLoading={isLoading}
			/>
		</>
	);
}
