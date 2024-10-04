"use client";
import React, { useState, useEffect } from "react";
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
import { useSearchParams } from "next/navigation";

import { BidvLogo, VietcombankLogo, VietinbankLogo } from "@/components/svgs";

const formatDate = (date) => {
	return format(new Date(date), "dd/MM/yyyy");
};

export function Statement({ setIsLoading, isLoading }) {
	const [statement, setStatement] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isFetching, setIsFetching] = useState(false);
	const searchParams = useSearchParams();

	useEffect(() => {
		setIsLoading(true);
		const fetchData = async () => {
			const statement = await getStatement(1, searchParams.get("q"));
			setStatement(statement);
		};
		fetchData();
		setIsFetching(true);
	}, []);

	const debouncedFetchData = debounce(async (query, date, banksName) => {
		try {
			setStatement([]);
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
	}, 500);

	const search = useSearchParams().get("q") || "";
	const date = searchParams.get("from")
		? [new Date(searchParams.get("from")), new Date(searchParams.get("to"))]
		: [null, null];
	const banks = searchParams.get("bank")
		? searchParams.get("bank").split(",")
		: [];

	useEffect(() => {
		debouncedFetchData(searchParams.get("q"), date, banks);
		return () => {
			debouncedFetchData.cancel();
		};
	}, [search, searchParams.get("from"), searchParams.get("bank")]);

	const fetchMoreData = async () => {
		let newStatement;
		if (search || date || banks) {
			// setStatement([]);
			newStatement = await getStatement(page + 1, search, date, banks);
		} else {
			newStatement = await getStatement(page + 1);
		}
		setPage(page + 1);
		if (newStatement.length === 0) {
			setHasMore(false);
			return;
		}

		setStatement((prev) => [...prev, ...newStatement]);
	};

	const bankLogos = {
		vietcombank: VietcombankLogo,
		vietinbank: VietinbankLogo,
		bidv: BidvLogo,
	};

	const isLogo = (bankName) => {
		const LogoComponent = bankLogos[bankName];
		if (LogoComponent) {
			return <LogoComponent className="w-8 h-8" />;
		}
		return bankName;
	};

	const rows = statement.map((element) => (
		<Table.Tr key={element.id}>
			<Table.Td>
				<Highlight highlight={search}>{element.no}</Highlight>
			</Table.Td>
			<Table.Td>{formatDate(element.transaction_date)}</Table.Td>
			<Table.Td>
				<NumberFormatter
					thousandSeparator="."
					decimalSeparator=","
					value={element.credit_amount}
					suffix=" ₫"
				/>
			</Table.Td>
			<Table.Td>
				<Highlight highlight={search}>
					{element.transaction_description}
				</Highlight>
			</Table.Td>

			<Table.Td>
				<Highlight highlight={search}>{element.reference_name}</Highlight>
			</Table.Td>
			<Table.Td>{isLogo(element.bank_name)}</Table.Td>
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
							<Table.Th>Mã giao dịch</Table.Th>
							<Table.Th>Ngày</Table.Th>
							<Table.Th>Số tiền chuyển (VNĐ)</Table.Th>
							<Table.Th>Nội dung chi tiết</Table.Th>
							<Table.Th>Tên đối chiếu</Table.Th>
							<Table.Th>Ngân hàng</Table.Th>
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

// function Th({ children, reversed, sorted, onSort }) {
// 	const Icon = sorted
// 		? reversed
// 			? IconChevronUp
// 			: IconChevronDown
// 		: IconSelector;
// 	return (
// 		<Table.Th>
// 			<UnstyledButton onClick={onSort}>
// 				<Group justify="space-between">
// 					<Text fw={500} fz="sm">
// 						{children}
// 					</Text>
// 					<Center>
// 						<Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
// 					</Center>
// 				</Group>
// 			</UnstyledButton>
// 		</Table.Th>
// 	);
// }
