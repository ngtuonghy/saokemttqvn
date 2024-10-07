import { Skeleton, Stack } from "@mantine/core";
import React from "react";
const count = 8;
const StatementLoading = () => {
	return (
		<Stack className="flex-1">
			{Array.from({ length: count }).map((_, index) => (
				<Skeleton key={index} height={30} />
			))}
		</Stack>
	);
};

export default StatementLoading;
