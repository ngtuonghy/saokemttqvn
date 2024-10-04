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
import { getBanks } from "@/actions/get-statement";

const Search = ({ isLoading }) => {
	const [opened, { toggle, close }] = useDisclosure(false);
	const [date, setDate] = React.useState([null, null]);
	const [banks, setBanks] = React.useState(["t"]);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [search, setSearch] = useInputState({
		string: "",
		banksName: "",
	});
	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		if (search.string) {
			params.set("q", search.string);
		} else {
			params.delete("q");
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
	}, [search, date]);

	useEffect(() => {
		getBanks().then((data) => {
			setBanks(data.map((item) => item.bank_name));
		});
	}, []);

	return (
		<Group
			grow
			gap="sm"
			className="sticky top-[62px]"
			preventGrowOverflow={false}
			wrap="nowrap"
		>
			<Input
				color={isLoading ? "gray" : "blue"}
				w="100%"
				placeholder="Tìm kiếm: Số tiền, Nội dung, Mã giao dịch, Ngân hàng"
				leftSection={
					isLoading ? (
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
						onClick={() => setSearch((va) => ({ ...va, string: "" }))}
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
							minDate={new Date(2024, 8, 1)}
							maxDate={new Date(2024, 8, 12)}
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
