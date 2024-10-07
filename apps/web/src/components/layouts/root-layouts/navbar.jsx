import {
	ActionIcon,
	Stack,
	Title,
	Affix,
	Button,
	Transition,
	rem,
} from "@mantine/core";
import {
	IconArrowUp,
	IconChartDonut,
	IconFileInvoice,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { usePathname } from "next/navigation";
import { useWindowScroll } from "@mantine/hooks";
import { useAppShell } from "@/context/app-shell";
const Navbar = () => {
	const { opened, toggle } = useAppShell();
	const pathname = usePathname();
	const [scroll, scrollTo] = useWindowScroll();
	const list = [
		{
			name: "Sao kê",
			url: "/",
			icon: (
				<IconFileInvoice style={{ width: "70%", height: "70%" }} stroke={1.5} />
			),
		},
		{
			name: "Thống kê",
			icon: (
				<IconChartDonut style={{ width: "70%", height: "70%" }} stroke={1.5} />
			),
			url: "/statistic",
		},
	];
	return (
		<Stack h="full" justify="space-between">
			<Stack>
				{list.map((item, index) => (
					<Link
						key={index}
						className={`cursor-pointer items-center flex gap-2 p-1
bord ${pathname === item.url ? "border-[var(--mantine-color-blue-6)] border-b-4" : null} anmation duration-300`}
						component="a"
						href={item.url}
						onClick={() => {
							opened && toggle();
						}}
					>
						<ActionIcon size="xl" variant="light">
							{item.icon}
						</ActionIcon>
						<Title order={2} size="h5">
							{item.name}
						</Title>
					</Link>
				))}
			</Stack>
			<Affix position={{ bottom: 20, right: 20 }}>
				<Transition transition="slide-up" mounted={scroll.y > 0}>
					{(transitionStyles) => (
						<Button
							leftSection={
								<IconArrowUp style={{ width: rem(16), height: rem(16) }} />
							}
							style={transitionStyles}
							onClick={() => scrollTo({ y: 0 })}
						>
							Cuộn lên đầu trang
						</Button>
					)}
				</Transition>
			</Affix>
		</Stack>
	);
};

export default Navbar;
