import localFont from "next/font/local";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "../../theme";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";
import { MainLayout } from "@/components/layouts/root-layouts";
import { ContextProvider } from "@/context";
const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata = {
	title: "Sao kê MTTQVN ",
	description: "Sao kê MTTQVN | ngtuonghy",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning={true}
			>
				<MantineProvider theme={theme}>
					<ContextProvider>
						<MainLayout>{children}</MainLayout>
					</ContextProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
