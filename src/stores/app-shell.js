import { create } from "zustand";

const useAppShell = create((set) => ({
	opened: false,
	toggle: () => set((state) => ({ opened: !state.opened })),
}));

export { useAppShell };
