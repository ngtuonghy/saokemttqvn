"use client";
import { createContext, useContext, useState } from "react";

const context = createContext();

function AppShellProvider({ children }) {
	const [opened, setOpened] = useState(false);
	const toggle = () => {
		setOpened((prevState) => !prevState);
	};

	return (
		<context.Provider value={{ opened, toggle }}>{children}</context.Provider>
	);
}
function useAppShell() {
	const contextValue = useContext(context);
	if (!contextValue) {
		throw new Error("useAppShell must be used within a AppShellProvider");
	}
	return contextValue;
}

export { AppShellProvider, useAppShell };
