"use client";
import React, { useEffect } from "react";
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
import StatementLoading from "./statement-loading";
import { IconError404 } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { BidvLogo, VietcombankLogo, VietinbankLogo } from "@/components/svgs";
import { useStatement } from "@/context/statement-data";
import Search from "@/features/search/search";

const formatDate = (date) => {
	return format(new Date(date), "dd/MM/yyyy");
};

export function Statement() {
	const { data, fetchData, loading, fetchMoreData, hasMore } = useStatement();
	const searchParams = useSearchParams();
	const search = searchParams.get("q") || "";

	useEffect(() => {
		fetchData();
	}, [
		search,
		searchParams.get("from"),
		searchParams.get("bank"),
		searchParams.get("currency"),
	]);

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

	const rows = data.map((element, index) => (
		<Table.Tr key={index}>
			<Table.Td>
				<Highlight maw={110} truncate highlight={search}>
					{element.no}
				</Highlight>
			</Table.Td>
			<Table.Td>{formatDate(element.transaction_date)}</Table.Td>
			<Table.Td>
				{element.currency === "USD" ? (
					<NumberFormatter
						thousandSeparator="."
						decimalSeparator=","
						value={element.credit_amount}
						suffix=" $"
					/>
				) : (
					<NumberFormatter
						thousandSeparator="."
						decimalSeparator=","
						value={element.credit_amount}
						suffix=" ₫"
					/>
				)}
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
		<>
			<Search />

			<InfiniteScroll
				dataLength={data.length}
				next={fetchMoreData}
				hasMore={hasMore}
				loader={<StatementLoading />}
			>
				<Stack>
					<Table highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th vars={"1"}>Mã giao dịch</Table.Th>
								<Table.Th>Ngày</Table.Th>
								<Table.Th>Số tiền chuyển (VNĐ)</Table.Th>
								<Table.Th>Nội dung chi tiết</Table.Th>
								<Table.Th>Tên đối chiếu</Table.Th>
								<Table.Th>Ngân hàng</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>{rows}</Table.Tbody>
					</Table>
					{data.length === 0 && !loading && (
						<Center>
							<Notification
								icon={<IconError404 stroke={2} />}
								withBorder
								color="yellow"
								title={<Text size="xl">Không tìm thấy dữ liệu</Text>}
								withCloseButton={false}
							>
								<Text size="lg">
									coi chừng, bạn đã nhập đúng thông tin chưa?
								</Text>
							</Notification>
						</Center>
					)}
				</Stack>
			</InfiniteScroll>
		</>
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
