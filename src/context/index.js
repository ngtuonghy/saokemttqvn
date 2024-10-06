import { AppShellProvider } from "./app-shell";
import { StatementProvider } from "./statement-data";
import { Suspense } from "react";

export function ContextProvider({ children }) {
	return (
		<Suspense>
			<AppShellProvider>
				<StatementProvider>{children}</StatementProvider>
			</AppShellProvider>
		</Suspense>
	);
}
