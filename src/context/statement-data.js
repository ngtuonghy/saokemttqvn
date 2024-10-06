"use client";
import { getStatement } from "@/actions/get-statement";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";

const context = createContext();

function StatementProvider({ children }) {
	const [data, setData] = useState([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [error, setError] = useState(null);
	const searchParams = useSearchParams();
	const fetchData = async () => {
		try {
			setData([]);
			setLoading(true);
			setHasMore(true);
			const date = searchParams.get("from")
				? [new Date(searchParams.get("from")), new Date(searchParams.get("to"))]
				: null;
			const banks = searchParams.get("bank")
				? searchParams.get("bank").split(",")
				: null;
			const data = await getStatement(1, searchParams.get("q"), date, banks);

			setData(data);
			if (data.length < 20) {
				setHasMore(false);
			}

			setPage(1);
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchData();
	}, []);

	const fetchMoreData = async () => {
		setLoading(true);
		try {
			const date = searchParams.get("from")
				? [new Date(searchParams.get("from")), new Date(searchParams.get("to"))]
				: null;
			const banks = searchParams.get("bank")
				? searchParams.get("bank").split(",")
				: null;
			const data = await getStatement(
				page + 1,
				searchParams.get("q"),
				date,
				banks,
			);
			setPage((prevPage) => prevPage + 1);
			if (data.length === 0) {
				setHasMore(false);
				return;
			}
			setData((prevData) => [...prevData, ...data]);
		} catch (error) {
			setError(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<context.Provider
			value={{
				setData,
				setPage,
				data,
				loading,
				error,
				fetchMoreData,
				fetchData,
				hasMore,
			}}
		>
			{children}
		</context.Provider>
	);
}
function useStatement() {
	const contextValue = useContext(context);
	if (!contextValue) {
		throw new Error("useAppShell must be used within a AppShellProvider");
	}
	return contextValue;
}

export { StatementProvider, useStatement };
