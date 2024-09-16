"use client";
import { useDisclosure } from "@mantine/hooks";
import {
	ActionIcon,
	Anchor,
	AppShell,
	Burger,
	Group,
	ScrollArea,
	Title,
} from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import Navbar from "./navbar";
import Link from "next/link";
export const HeaderInfo = () => {
	return (
		<>
			<Anchor
				variant="gradient"
				gradient={{ from: "pink", to: "yellow" }}
				fw={500}
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
export const MainLayout = ({ children }) => {
	const [opened, { toggle }] = useDisclosure();
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
					</Group>
					<Group className="mantine-visible-from-md">
						<HeaderInfo />
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Navbar
				p="md"
				onClick={() => {
					opened && toggle();
				}}
			>
				<AppShell.Section component={ScrollArea}>
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
