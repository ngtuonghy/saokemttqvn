"use client";
import React, { useState, useEffect, useRef } from "react";
import {
	Center,
	Highlight,
	Notification,
	NumberFormatter,
	Stack,
	Table,
	Text,
} from "@mantine/core";
import { format } from "date-fns";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce } from "lodash";
import { getStatement } from "@/actions/get-statement";
import StatementLoading from "./statement-loading";
import { IconError404 } from "@tabler/icons-react";

const formatDate = (date) => {
	return format(new Date(date), "dd/MM/yyyy");
};

export function Statement({ search, setIsLoading, isLoading, date, setDate }) {
	const [statement, setStatement] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isFetching, setIsFetching] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		const fetchData = async () => {
			const statement = await getStatement(1, search.string);
			setStatement(statement);
		};
		fetchData();
		setIsFetching(true);
	}, []);

	const debouncedFetchData = debounce(async (query, date, banksName) => {
		try {
			setIsLoading(true);
			const result = await getStatement(1, query, date, banksName);
			setPage(1);
			if (result.length < 20) {
				setHasMore(false);
			} else {
				setHasMore(true);
			}
			setStatement(result);
			setIsLoading(false);
		} catch (error) {
			setIsLoading(false);
			console.error("Error fetching data:", error);
		}
	}, 1000);

	useEffect(() => {
		debouncedFetchData(search.string, date, search.banksName);
		return () => {
			debouncedFetchData.cancel();
		};
	}, [search.string, date, search.banksName]);

	const fetchMoreData = async () => {
		const newStatement = await getStatement(page + 1);
		setPage(page + 1);
		if (newStatement.length === 0) {
			setHasMore(false);
			return;
		}
		setStatement((prev) => [...prev, ...newStatement]);
	};

	// statement.forEach((element) => console.log(element.date));
	const rows = statement.map((element) => (
		<Table.Tr key={element.id}>
			<Table.Td>{formatDate(element.date)}</Table.Td>
			<Table.Td>
				<NumberFormatter
					thousandSeparator="."
					decimalSeparator=","
					value={element.credit}
					// suffix=" ₫"
				/>
			</Table.Td>
			<Table.Td>
				<Highlight highlight={search.string}>{element.description}</Highlight>
			</Table.Td>
			<Table.Td>
				<Highlight highlight={search.string}>{element.name_bank}</Highlight>
			</Table.Td>
			<Table.Td>
				<Highlight highlight={search.string}>{element.doc_no}</Highlight>
			</Table.Td>
			<Table.Td>{element.page_number}</Table.Td>
		</Table.Tr>
	));

	return (
		<InfiniteScroll
			dataLength={statement.length}
			next={fetchMoreData}
			hasMore={hasMore}
			loader={<StatementLoading />}
		>
			<Stack>
				<Table highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Ngày</Table.Th>
							<Table.Th>Số tiền chuyển (VNĐ)</Table.Th>
							<Table.Th>Nội dung chi tiết</Table.Th>
							<Table.Th>Ngân hàng</Table.Th>
							<Table.Th>Mã giao dịch</Table.Th>
							<Table.Th>Trang</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
				{statement.length === 0 && !isLoading && isFetching && (
					<Center>
						<Notification
							icon={<IconError404 stroke={2} />}
							withBorder
							color="yellow"
							title={<Text size="xl">Không tìm thấy dữ liệu</Text>}
							withCloseButton={false}
						>
							<Text size="lg">coi chừng, bạn đã nhập đúng thông tin chưa?</Text>
						</Notification>
					</Center>
				)}
			</Stack>
		</InfiniteScroll>
	);
}
