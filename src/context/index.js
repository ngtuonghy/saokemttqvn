import { AppShellProvider } from "./app-shell";
import { StatementProvider } from "./statement-data";

export function ContextProvider({ children }) {
	return (
		<AppShellProvider>
			<StatementProvider>{children}</StatementProvider>
		</AppShellProvider>
	);
}
