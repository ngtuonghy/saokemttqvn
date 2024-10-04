"use server";
import fs from "fs";
import path from "path";
import logs from "@/assets/logs/changelog.json";

const readJsonFile = async () => {
	const filePath = path.join(
		process.cwd(),
		"public",
		"assets",
		"logs",
		"changelog.json",
	);

	try {
		const data = await fs.promises.readFile(filePath, "utf8");
		return JSON.parse(data); // Parse the JSON file and return the content
	} catch (err) {
		throw new Error(`Error reading or parsing file: ${err.message}`);
	}
};

export { readJsonFile };
