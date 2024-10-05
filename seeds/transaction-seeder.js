import fs from "fs";
import csv from "csv-parser";
import { formatISO, parse } from "date-fns";
import path from "path";
import pLimit from "p-limit";
import { fileURLToPath } from "url";

function convertToISO(dateString) {
	if (!dateString.includes(":")) {
		dateString += " 00:00:00";
	}
	const parsedDate = parse(dateString, "dd/MM/yyyy HH:mm:ss", new Date());
	return formatISO(parsedDate, { representation: "complete" });
}

function formatFilePath(filePath) {
	const fileName = path.basename(filePath, ".csv");
	const regex = /(.+?)_(\d+)_(\d{2})-(\d{2})_to_(\d{2})-(\d{2})-(\d{4})/;
	const match = fileName.match(regex);

	if (!match) {
		throw new Error("File name format is incorrect");
	}
	const bankName = match[1];
	const accountNumber = match[2];
	const startDate = `${match[3]}/${match[4]}`;
	const endDate = `${match[5]}/${match[6]}/${match[7]}`;

	if (startDate === `${match[5]}/${match[6]}`) {
		return {
			bankName,
			formattedName: `${bankName}: ${accountNumber} ngày ${endDate}`,
			endDay: new Date(endDate).toISOString(),
		};
	}
	return {
		bankName,
		formattedName: `${bankName}: ${accountNumber} từ ngày ${startDate} đến ngày ${endDate}`,
		endDay: new Date(endDate).toISOString(),
	};
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logChange = (filePath) => {
	const changelogDir = path.join(__dirname, "./../public/assets/logs/");
	const changelogPath = path.join(changelogDir, "changelog.json");

	const { bankName, formattedName, endDay } = formatFilePath(filePath);

	const logEntry = {
		file: `Số tiền ủng hộ qua số tài khoản ${formattedName}`,
		date: new Date().toISOString(),
		endDay,
	};

	fs.readFile(changelogPath, "utf8", (err, data) => {
		if (err && err.code === "ENOENT") {
			fs.writeFileSync(changelogPath, JSON.stringify({}), "utf8");
			data = "{}";
		} else if (err) {
			console.error("Error reading changelog:", err);
			return;
		}

		let changelog = {};

		try {
			changelog = JSON.parse(data);
		} catch (parseErr) {
			console.error("Error parsing changelog:", parseErr);
			return;
		}

		if (!changelog[bankName]) {
			changelog[bankName] = [];
		}

		const entryExists = changelog[bankName].some(
			(entry) => entry.file === logEntry.file,
		);

		if (entryExists) {
			console.log(`Changelog already exists for: ${formattedName}`);
			return;
		}

		changelog[bankName].push(logEntry);
		changelog[bankName].sort((a, b) => new Date(b.endDay) - new Date(a.endDay));

		fs.writeFile(changelogPath, JSON.stringify(changelog, null, 2), (err) => {
			if (err) {
				console.error("Error writing to changelog:", err);
			} else {
				console.log(`Changelog updated for bank: ${bankName}`);
			}
		});
	});
};

const transactionSeeder = (csvFile, bankName, prisma) => {
	return new Promise((resolve, reject) => {
		const results = [];

		fs.createReadStream(csvFile)
			.pipe(csv())
			.on("data", (data) => results.push(data))
			.on("end", async () => {
				const transactions = results.map((item) => {
					const credit = item.credit || "";
					const formatCredit = credit.replaceAll(".", "");
					return {
						no: item.no,
						transaction_date: convertToISO(item.dateTime),
						credit_amount: parseFloat(formatCredit) || 0,
						bank_name: bankName,
						transaction_description: item.transactionComment,
						reference_name: item.offsetName,
					};
				});

				try {
					await prisma.statement.createMany({
						data: transactions,
					});
					console.log(`${csvFile} has been inserted successfully`);
					logChange(csvFile, bankName);
					resolve();
				} catch (error) {
					console.error("Error inserting transactions from:", csvFile, error);
					reject(error);
				}
			})
			.on("error", (error) => reject(error));
	});
};

const loadAllCsvFiles = async (directory, bankName, prisma) => {
	try {
		const files = await fs.promises.readdir(directory);

		const csvFiles = files.filter((file) => path.extname(file) === ".csv");

		const limit = pLimit(1);

		const promises = csvFiles.map((file) => {
			const csvFilePath = path.join(directory, file);
			return limit(() => transactionSeeder(csvFilePath, bankName, prisma));
		});

		await Promise.all(promises);

		console.log("All CSV files have been processed.");
	} catch (err) {
		console.error("Error processing files:", err);
	}
};

export { transactionSeeder, loadAllCsvFiles };
