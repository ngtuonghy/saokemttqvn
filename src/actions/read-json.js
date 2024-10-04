"use server";
import fs from "fs";
import path from "path";

const readJsonFile = async () => {
	const filePath = path.join(process.cwd(), "logs", "changelog.json");
	console.log(process.cwd());

	try {
		const data = await fs.promises.readFile(filePath, "utf8");
		return JSON.parse(data);
	} catch (err) {
		throw new Error(`Error reading or parsing file: ${err.message}`);
	}
};
export { readJsonFile };
