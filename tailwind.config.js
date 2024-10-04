/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			animation: {
				"spin-slow": "spin 10s linear infinite",
			},
		},
	},
	plugins: [],
};
