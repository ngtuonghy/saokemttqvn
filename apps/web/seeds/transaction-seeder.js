import fs from "fs";
import csv from "csv-parser";
import { formatISO, parse } from "date-fns";
import path from "path";
import pLimit from "p-limit";
import { fileURLToPath } from "url";

function convertToISO(dateString) {
	try {
		let [datePart, timePart] = dateString.split(" ");
		if (!timePart) {
			timePart = "00:00:00";
		} else {
			const timeParts = timePart.split(":");
			while (timeParts.length < 3) {
				timeParts.push("00");
			}
			timePart = timeParts.join(":");
		}
		const fullDateString = `${datePart} ${timePart}`;
		const parsedDate = parse(fullDateString, "dd/MM/yyyy HH:mm:ss", new Date());
		return formatISO(parsedDate, { representation: "complete" });
	} catch (error) {
		console.error("Error converting date:", error);
	}
}

function formatFilePath(filePath) {
	const fileName = path.basename(filePath, ".csv");
	const regex =
		/(.+?)_(?:([A-Z]+)_)?(\d+)_(\d{2})-(\d{2})_to_(\d{2})-(\d{2})-(\d{4})/;
	const match = fileName.match(regex);

	if (!match) {
		throw new Error("File name format is incorrect");
	}
	const bankName = match[1];
	const accountNumber = match[3];
	let startDate = `${match[4]}/${match[5]}`;
	const endDate = `${match[6]}/${match[7]}/${match[8]}`;

	if (startDate.split("/").length === 2) {
		startDate = `${startDate}/${match[8]}`;
	}
	return {
		bankName,
		currency: match[2] || "VND",
		accountNumber: accountNumber,
		startDate: new Date(`${startDate}`).toISOString(),
		endDate: new Date(endDate).toISOString(),
	};
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logChange = (formatFile) => {
	const changelogDir = path.join(__dirname, "./../public/assets/logs/");
	const changelogPath = path.join(changelogDir, "changelog.json");

	const { bankName, endDate, startDate, accountNumber, currency } = formatFile;

	const logEntry = {
		date: new Date().toISOString(),
		currency,
		endDate,
		startDate,
		accountNumber,
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
			(entry) =>
				entry.startDate === logEntry.startDate &&
				entry.endDate === logEntry.endDate,
		);

		if (entryExists) {
			console.log(`Changelog already exists for: ${bankName}`);
			return;
		}

		changelog[bankName].push(logEntry);
		changelog[bankName].sort(
			(a, b) => new Date(b.endDate) - new Date(a.endDate),
		);
		changelog[bankName].sort((a, b) => a.accountNumber - b.accountNumber);

		fs.writeFile(changelogPath, JSON.stringify(changelog, null, 2), (err) => {
			if (err) {
				console.error("Error writing to changelog:", err);
			} else {
				console.log(`Changelog updated for bank: ${bankName}`);
			}
		});
	});
};

const transactionSeeder = (csvFile, bankName, prisma, moveFile, formatFile) => {
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
						currency: formatFile.currency,
					};
				});

				try {
					await prisma.statement.createMany({
						data: transactions,
					});
					console.log(`${csvFile} has been inserted successfully`);
					logChange(formatFile);

					if (moveFile) {
						const doneDir = path.join(path.dirname(csvFile), "done");
						await fs.mkdirSync(doneDir, { recursive: true });

						const destinationPath = path.join(doneDir, path.basename(csvFile));
						await fs.renameSync(csvFile, destinationPath);
					}

					resolve();
				} catch (error) {
					console.error("Error inserting transactions from:", csvFile, error);
					reject(error);
				}
			})
			.on("error", (error) => reject(error));
	});
};

const loadAllCsvFiles = async (directory, bankName, prisma, moveFile) => {
	try {
		const files = await fs.promises.readdir(directory);

		const csvFiles = files.filter((file) => path.extname(file) === ".csv");

		const limit = pLimit(1);

		const promises = csvFiles.map((file) => {
			const csvFilePath = path.join(directory, file);
			const formatFile = formatFilePath(csvFilePath);
			return limit(() =>
				transactionSeeder(csvFilePath, bankName, prisma, moveFile, formatFile),
			);
		});

		await Promise.all(promises);

		console.log("All CSV files have been processed.");
	} catch (err) {
		console.error("Error processing files:", err);
	}
};

export { transactionSeeder, loadAllCsvFiles };
