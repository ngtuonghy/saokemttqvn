"use client";
import {
	ActionIcon,
	CloseButton,
	Group,
	Input,
	Tooltip,
	rem,
	Modal,
	Stack,
	MultiSelect,
	Loader,
} from "@mantine/core";
import "dayjs/locale/vi";
import React, { useEffect } from "react";
import {
	IconSearch,
	IconFilter,
	IconCalendar,
	IconBuildingBank,
} from "@tabler/icons-react";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { getBanks, getDateRange } from "@/actions/get-statement";
import { useStatement } from "@/context/statement-data";
import logs from "@/assets/logs/changelog.json";

const Search = () => {
	const { loading } = useStatement();
	const [opened, { toggle, close }] = useDisclosure(false);
	const [date, setDate] = React.useState([null, null]);
	const [banks, setBanks] = React.useState(Object.keys(logs));
	const [dateRange, setDateRange] = React.useState({});
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [search, setSearch] = useInputState({
		string: "",
		banksName: "",
	});
	const params = new URLSearchParams(searchParams.toString());
	useEffect(() => {
		if (date[0] && date[1]) {
			params.set("from", date[0].toISOString());
			params.set("to", date[1].toISOString());
		} else {
			params.delete("from");
			params.delete("to");
		}

		if (search.banksName && search.banksName.length) {
			params.set("bank", search.banksName.join(","));
		} else {
			params.delete("bank");
		}

		router.replace(pathname + "?" + params.toString());
	}, [date, search.banksName]);

	const handleKeyPress = async (event) => {
		if (event.key === "Enter") {
			const params = new URLSearchParams(searchParams.toString());
			if (search.string) {
				params.set("q", search.string);
			} else {
				params.delete("q");
			}
			router.replace(pathname + "?" + params.toString());
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			const dateRange = await getDateRange();
			setDateRange(dateRange);
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (searchParams.get("q"))
			setSearch((va) => ({ ...va, string: searchParams.get("q") || "" }));
		if (searchParams.get("bank"))
			setSearch((va) => ({
				...va,
				banksName: searchParams.get("bank").split(",") || [],
			}));
	}, [searchParams.get("q"), searchParams.get("bank")]);

	return (
		<Group
			grow
			gap="sm"
			className="sticky top-[62px]"
			preventGrowOverflow={false}
			wrap="nowrap"
		>
			<Input
				onKeyDown={handleKeyPress}
				color={loading ? "gray" : "blue"}
				w="100%"
				placeholder="Tìm kiếm: Số tiền, Nội dung, Mã giao dịch, Ngân hàng"
				leftSection={
					loading ? (
						<Loader color="blue" type="dots" size="sm" />
					) : (
						<IconSearch stroke={2} />
					)
				}
				value={search.string}
				onChange={(event) =>
					setSearch((va) => ({ ...va, string: event.target.value }))
				}
				rightSectionPointerEvents="all"
				rightSection={
					<CloseButton
						aria-label="Clear input"
						onClick={() => {
							setSearch((va) => ({ ...va, string: "" }));
							params.delete("q");
							router.replace(pathname + "?" + params.toString());
						}}
						style={{ display: search.string ? undefined : "none" }}
					/>
				}
			/>
			<Tooltip label="lọc tìm kiếm">
				<ActionIcon variant="subtle" onClick={toggle}>
					<IconFilter stroke={2} />
				</ActionIcon>
			</Tooltip>
			<Modal opened={opened} onClose={close} title="Lọc tìm kiếm" centered>
				<Stack>
					<DatesProvider
						settings={{
							locale: "vi",
							firstDayOfWeek: 1,
							weekendDays: [0],
							timezone: "Asia/Ho_Chi_Minh",
						}}
					>
						<DatePickerInput
							type="range"
							allowSingleDateInRange
							leftSection={
								<IconCalendar
									style={{ width: rem(18), height: rem(18) }}
									stroke={1.5}
								/>
							}
							clearable
							label="Chọn ngày"
							value={date}
							onChange={setDate}
							minDate={dateRange.minDate}
							maxDate={dateRange.maxDate}
						/>
					</DatesProvider>
					<MultiSelect
						leftSection={
							<IconBuildingBank
								style={{ width: rem(18), height: rem(18) }}
								stroke={1.5}
							/>
						}
						label="Ngân hàng"
						value={search.banksName || []}
						onChange={(value) =>
							setSearch((va) => ({ ...va, banksName: value }))
						}
						data={banks}
						hidePickedOptions
					/>
				</Stack>
			</Modal>
		</Group>
	);
};

export default Search;
