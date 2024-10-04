import fs from "fs";
import csv from "csv-parser";
import { formatISO, parse } from "date-fns";
import path from "path";
import pLimit from "p-limit";

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

	return `${bankName}: ${accountNumber} ${startDate} - ${endDate}`;
}

const logChange = (filePath) => {
	const changelogPath = path.join(process.cwd(), "../logs/", "changelog.json");
	const formattedFileName = formatFilePath(filePath);
	const logEntry = {
		file: `Số tiền ủng hộ qua số tài khoản ${formattedFileName}`,
		date: new Date().toISOString(),
	};

	if (!fs.existsSync(changelogPath)) {
		fs.writeFileSync(changelogPath, JSON.stringify([]), "utf8");
	}

	fs.readFile(changelogPath, "utf8", (err, data) => {
		if (err) {
			console.error("Error reading changelog:", err);
			return;
		}

		let changelog = [];

		if (data) {
			try {
				changelog = JSON.parse(data);
			} catch (parseErr) {
				console.error("Error parsing changelog:", parseErr);
				return;
			}
		}

		const entryExists = changelog.some((entry) => entry.file === logEntry.file);

		if (entryExists) {
			console.log(`Changelog already: ${formattedFileName}`);
			return;
		}

		// Thêm logEntry vào đầu danh sách
		changelog.unshift(logEntry);

		// Ghi lại file JSON
		fs.writeFile(changelogPath, JSON.stringify(changelog, null, 2), (err) => {
			if (err) {
				console.error("Error writing to changelog:", err);
			} else {
				console.log(`Changelog updated: ${formattedFileName}`);
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
					logChange(csvFile);
					resolve(); // Resolve after processing
				} catch (error) {
					console.error("Error inserting transactions from:", csvFile, error);
					reject(error); // Reject on error
				}
			})
			.on("error", (error) => reject(error)); // Handle file read errors
	});
};

// Function to load all CSV files with a concurrency limit
const loadAllCsvFiles = async (directory, bankName, prisma) => {
	try {
		// Read all files in the directory
		const files = await fs.promises.readdir(directory);

		// Filter only .csv files
		const csvFiles = files.filter((file) => path.extname(file) === ".csv");

		// Limit concurrency to 2 files at a time
		const limit = pLimit(2);

		// Process each CSV file with concurrency control
		const promises = csvFiles.map((file) => {
			const csvFilePath = path.join(directory, file);
			// Limit ensures only 2 files are processed at once
			return limit(() => transactionSeeder(csvFilePath, bankName, prisma));
		});

		// Wait for all files to finish processing
		await Promise.all(promises);

		console.log("All CSV files have been processed.");
	} catch (err) {
		console.error("Error processing files:", err);
	}
};

export { transactionSeeder, loadAllCsvFiles };
