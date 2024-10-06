import { Skeleton, Stack } from "@mantine/core";
import React from "react";
const count = 1;
const StatisticLoading = () => {
	return (
		<Stack className="flex-1">
			{Array.from({ length: count }).map((_, index) => (
				<Skeleton key={index} height={400} />
			))}
		</Stack>
	);
};

export default StatisticLoading;
