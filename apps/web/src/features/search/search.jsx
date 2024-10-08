"use client";
import {
	ActionIcon,
	CloseButton,
	Group,
	Tooltip,
	rem,
	Modal,
	Stack,
	MultiSelect,
	Loader,
	TextInput,
	Button,
	Checkbox,
} from "@mantine/core";
import "dayjs/locale/vi";
import React, { useEffect } from "react";
import { IconSearch, IconCalendar } from "@tabler/icons-react";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { getDateRange } from "@/actions/get-statement";
import { useStatement } from "@/context/statement-data";
import logs from "@/assets/logs/changelog.json";
import { useState } from "react";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { IconCoins } from "@tabler/icons-react";

const Search = () => {
	const { loading } = useStatement();
	const [opened, { toggle, close }] = useDisclosure(false);
	const [date, setDate] = React.useState([null, null]);
	const [banks, setBanks] = React.useState([]);
	const [currency, setCurrency] = React.useState([]);
	const [dateRange, setDateRange] = React.useState({
		minDate: null,
		maxDate: null,
	});
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [search, setSearch] = useInputState({
		string: "",
		banksName: "",
		currency: "",
	});

	const fetchUniqueCurrencies = () => {
		const currenciesSet = new Set();
		Object.values(logs).forEach((bankEntries) => {
			bankEntries.forEach((entry) => currenciesSet.add(entry.currency));
		});
		return Array.from(currenciesSet);
	};

	useEffect(() => {
		const uniqueCurrencies = fetchUniqueCurrencies();
		const banks = Object.keys(logs);
		setBanks(banks);
		setCurrency(uniqueCurrencies);
	}, []);

	const params = new URLSearchParams(searchParams.toString());
	useEffect(() => {
		if (search.currency && search.currency.length) {
			params.set("currency", search.currency.join(","));
		} else {
			params.delete("currency");
		}
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
	}, [date, search.banksName, search.currency]);

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
			if (dateRange) {
				setDateRange(dateRange);
			}
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

		if (searchParams.get("from") && searchParams.get("to")) {
			setDate([
				new Date(searchParams.get("from")),
				new Date(searchParams.get("to")),
			]);
		}
	}, [
		searchParams.get("q"),
		searchParams.get("bank"),
		searchParams.get("from"),
		searchParams.get("to"),
	]);
	const [focused, setFocused] = useState(false);

	return (
		<Stack className="sticky top-[60px] p={2}">
			<Group grow gap="sm" preventGrowOverflow={false} wrap="nowrap">
				<TextInput
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					onKeyDown={handleKeyPress}
					color={loading ? "gray" : "blue"}
					w="100%"
					placeholder="Tìm kiếm: Số tiền, Nội dung, Mã giao dịch, Ngân hàng"
					inputContainer={(children) => (
						<Tooltip
							label="Nhấn Enter để tìm kiếm"
							position="top-start"
							opened={focused}
						>
							{children}
						</Tooltip>
					)}
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

				<Tooltip label={"Lọc tìm kiếm"}>
					<ActionIcon
						onClick={toggle}
						size={"md"}
						bg={
							search.banksName.length !== 0 ||
							date[0] ||
							search.currency.length !== 0
								? "yellow"
								: "blue"
						}
					>
						<IconAdjustmentsHorizontal stroke={2} />
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
								<IconCoins
									style={{ width: rem(18), height: rem(18) }}
									stroke={1.5}
								/>
							}
							label="Loại tiền tệ"
							value={search.currency || []}
							onChange={(value) =>
								setSearch((v) => ({ ...v, currency: value }))
							}
							data={currency}
							hidePickedOptions
						/>
						<Checkbox.Group
							label="Ngân hàng"
							value={search.banksName || []}
							onChange={(value) =>
								setSearch((va) => ({ ...va, banksName: value }))
							}
						>
							<Group mt="xs">
								{banks.map((bank, index) => (
									<Checkbox key={index} value={bank} label={bank} />
								))}
							</Group>
						</Checkbox.Group>
						<Group justify="flex-end">
							<Button
								color="gray"
								onClick={() => {
									setSearch(() => ({ banksName: [], string: "" }));
									setDate([null, null]);
								}}
							>
								Đặt lại
							</Button>
							<Button onClick={toggle}>Đóng</Button>
						</Group>
					</Stack>
				</Modal>
			</Group>
		</Stack>
	);
};

export default Search;
