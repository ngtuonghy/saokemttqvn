"use server";
import { promises as fs } from "fs";

const readJsonFile = async () => {
	try {
		const data = await fs.readFile(
			process.cwd() + "/logs/changelog.json",
			"utf8",
		);
		return JSON.parse(data);
	} catch (err) {
		throw new Error(`Error reading or parsing file: ${err.message}`);
	}
};
export { readJsonFile };
