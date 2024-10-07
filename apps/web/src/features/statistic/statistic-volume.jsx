"use client";
import React, { useEffect } from "react";
import { LineChart } from "@mantine/charts";
import { Container, LoadingOverlay, Text } from "@mantine/core";
import { format } from "date-fns";
import StatisticLoading from "./statistic-loading";
import { getTotalTransactionsByDate } from "@/actions/get-statement";

function StatisticVolume() {
	const [totalTransactions, setTotalTransactions] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			await getTotalTransactionsByDate()
				.then((res) => {
					const formattedData = res.map((transaction) => ({
						transaction_date: format(
							new Date(transaction.transaction_date),
							"dd/MM/yyyy",
						),
						"Tổng số tiền": parseFloat(transaction.total_credit_amount),
					}));

					setTotalTransactions(formattedData);
				})
				.finally(() => setLoading(false));
		};
		fetchData();
	}, []);

	const error = console.error;
	console.error = (...args) => {
		if (/defaultProps/.test(args[0])) return;
		error(...args);
	};
	return (
		<>
			<Container>
				<Text align="center" weight={700} size="xl">
					{" "}
					Thống kê số tiền giao dịch theo ngày (VNĐ)
				</Text>
				{loading ? (
					<StatisticLoading />
				) : (
					<LineChart
						m={10}
						h={400}
						data={totalTransactions}
						dataKey="transaction_date"
						type="gradient"
						gradientStops={[
							{ offset: 0, color: "red.6" },
							{ offset: 20, color: "orange.6" },
							{ offset: 40, color: "yellow.5" },
							{ offset: 70, color: "lime.5" },
							{ offset: 80, color: "cyan.5" },
							{ offset: 100, color: "blue.5" },
						]}
						// withYAxis={false}
						strokeWidth={5}
						curveType="natural"
						series={[{ name: "Tổng số tiền", color: "blue.6" }]}
						valueFormatter={(value) =>
							new Intl.NumberFormat("vi-VN").format(value)
						}
					/>
				)}
			</Container>
		</>
	);
}

export default StatisticVolume;
