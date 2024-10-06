"use client";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
	ActionIcon,
	Anchor,
	AppShell,
	Burger,
	Center,
	Drawer,
	Group,
	Indicator,
	List,
	ScrollArea,
	Spoiler,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconBrandGithub, IconEyeCode } from "@tabler/icons-react";
import Navbar from "./navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconMoonStars } from "@tabler/icons-react";
import {
	BidvWordmark,
	MttqvnLogo,
	SunIcon,
	VietcombankWordmark,
	VietinbankWordmark,
} from "@/components/svgs";
import logs from "@/assets/logs/changelog.json";
import { useAppShell } from "@/context/app-shell";

export const MainLayout = ({ children }) => {
	const { opened, toggle } = useAppShell();
	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 200,
				breakpoint: "sm",
				collapsed: { mobile: !opened },
			}}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md" justify="space-between">
					<Group h="100%">
						<Burger
							opened={opened}
							onClick={toggle}
							hiddenFrom="sm"
							size="sm"
							lineSize={2}
						/>
						<Link href="/">
							<Title order={1} size="h2">
								Sao kê MTTQVN
							</Title>
						</Link>
						<SourceData />
					</Group>
					<Group>
						<Group className="mantine-visible-from-md">
							<HeaderInfo />
						</Group>
						<ColorSchemeToggle />
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Navbar
				p="md"
				// onClick={() => {
				// 	opened
				// }}
			>
				<AppShell.Section grow component={ScrollArea}>
					<Navbar />
				</AppShell.Section>
				<AppShell.Section hiddenFrom="sm">
					<Group justify="center" className="mantine-hidden-from-md">
						<HeaderInfo />
					</Group>
				</AppShell.Section>
			</AppShell.Navbar>

			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
};

function SourceData() {
	const [opened, { open, close }] = useDisclosure(false);
	const [data, setData] = useState([]);

	useEffect(() => {
		setData(logs);
	}, []);

	const bankWorkmark = {
		vietcombank: VietcombankWordmark,
		vietinbank: VietinbankWordmark,
		bidv: BidvWordmark,
	};

	const isWorkMark = (bankName) => {
		const LogoComponent = bankWorkmark[bankName];
		if (LogoComponent) {
			return <LogoComponent />;
		}
		return bankName;
	};

	return (
		<>
			<Drawer
				position="bottom"
				opened={opened}
				onClose={close}
				size="md"
				title={
					<Group onClick={open} className="cursor-pointer text-pink-500">
						<Title order={4}>
							Nguồn dữ liệu (
							{Object.keys(data).reduce(
								(acc, key) => acc + data[key].length,
								0,
							)}
							)
						</Title>
					</Group>
				}
				transitionProps={{
					transition: "slide-up",
					duration: 150,
					timingFunction: "linear",
				}}
			>
				{/* <MttqvnLogo className="w-11 h-11" /> */}
				<Center>
					<List size="lg">
						{Object.keys(data).map((key, index) => (
							<List.Item className="p-2" key={index}>
								<List size="lg">
									<Spoiler
										maxHeight={122}
										showLabel="Hiển thị thêm"
										hideLabel="Ẩn bớt"
									>
										<Title order={5}>
											<Group>
												{isWorkMark(key)}({data[key].length})
											</Group>
										</Title>
										{data[key].map((item, index) => (
											<List.Item key={index}>{item.file}</List.Item>
										))}
									</Spoiler>
								</List>
							</List.Item>
						))}
					</List>
				</Center>
			</Drawer>
			<Group onClick={open} className="cursor-pointer text-pink-500">
				<Indicator label="new" inline processing color="red" size={12}>
					<IconEyeCode stroke={2} size={30} />
				</Indicator>
				<Title order={5} className="mantine-visible-from-md">
					Xem nguồn dữ liệu (
					{Object.keys(data).reduce((acc, key) => acc + data[key].length, 0)})
				</Title>
			</Group>
		</>
	);
}

function ColorSchemeToggle() {
	const { setColorScheme, clearColorScheme } = useMantineColorScheme();
	const [scheme, setScheme] = useLocalStorage({
		key: "color-scheme",
		defaultValue: "light",
	});
	useEffect(() => {
		setColorScheme(scheme);
	}, [scheme]);

	const toggleColorScheme = () => {
		setScheme((current) => (current === "dark" ? "light" : "dark"));
		// setColorScheme(scheme);
	};

	return (
		<ActionIcon variant="transparent" onClick={toggleColorScheme}>
			{scheme === "dark" ? (
				<IconMoonStars />
			) : (
				<SunIcon className="animate-spin-slow" />
			)}
		</ActionIcon>
	);
}

export const HeaderInfo = () => {
	return (
		<>
			<Anchor
				variant="gradient"
				gradient={{ from: "yellow", to: "pink" }}
				fw={600}
			>
				bởi ngtuonghy
			</Anchor>
			<ActionIcon
				variant="transparent"
				color="dark"
				component="a"
				href="https://github.com/ngtuonghy"
				target="_blank"
				aria-label="Open in a new tab"
			>
				<IconBrandGithub />
			</ActionIcon>
		</>
	);
};
