"use server";
import { prisma } from "@/libs/prisma";
import { redis } from "@/libs/redis";

const getStatement = async (
	offSet = 1,
	search = "",
	date,
	banksName,
	currency,
) => {
	prisma.$connect();
	const p = 20;
	const conditions = [];

	if (search) {
		conditions.push(
			{
				no: {
					contains: search,
					mode: "insensitive",
				},
			},
			{
				transaction_description: {
					contains: search,
					mode: "insensitive",
				},
			},
			{
				reference_name: {
					contains: search,
					mode: "insensitive",
				},
			},
		);

		if (!isNaN(parseInt(search))) {
			conditions.push({
				OR: [
					{ credit_amount: { equals: parseInt(search) } },
					{ balance_amount: { equals: parseInt(search) } },
				],
			});
		}
	}

	let dateFilter = {};
	if (date) {
		const [startDate, endDate] = date;
		const startDateObj = new Date(startDate);
		const endDateObj = new Date(endDate);

		if (startDateObj.getTime() === endDateObj.getTime()) {
			dateFilter = { equals: startDateObj };
		} else {
			dateFilter = { gte: startDateObj, lte: endDateObj };
		}
	}

	let orderBy = [];
	if (search) {
		orderBy = [
			{
				credit_amount: "desc",
			},
			{
				transaction_description: "asc",
			},
		];
	} else {
		orderBy = [
			{
				transaction_date: "desc",
				// credit_amount: "asc",
			},
		];
	}

	const cacheKey = `statement:${offSet}:${search}:${JSON.stringify(
		date,
	)}:${JSON.stringify(banksName)}:${JSON.stringify(currency)}`;

	const cachedData = await redis.get(cacheKey);
	if (cachedData) {
		// console.log("Cache hit:", JSON.parse(cachedData));
		return JSON.parse(cachedData);
	}

	// console.log("Cache miss, fetching from database:", cacheKey);

	try {
		const data = await prisma.statement.findMany({
			skip: (offSet - 1) * p,
			take: p,
			orderBy,
			where: {
				AND: [
					conditions.length > 0 ? { OR: conditions } : undefined,
					Object.keys(dateFilter).length > 0
						? { transaction_date: dateFilter }
						: undefined,
					banksName ? { bank_name: { in: banksName } } : undefined,
					currency ? { currency: { in: currency } } : undefined,
				].filter(Boolean),
			},
		});

		prisma.$disconnect();
		await redis.set(cacheKey, JSON.stringify(data), { EX: 60 * 60 * 24 });
		return JSON.parse(JSON.stringify(data));
	} catch (error) {
		console.error(error);
	}
};

const getBanks = async () => {
	prisma.$connect();
	const banks = await prisma.statement.findMany({
		select: {
			bank_name: true,
		},
		distinct: ["bank_name"],
	});
	return banks;
};

async function getTotalTransactionsByDate() {
	try {
		await prisma.$connect();

		const totals = await prisma.$queryRaw`
        SELECT 
            DATE(transaction_date) AS transaction_date, 
            SUM(
                CASE 
                    WHEN currency = 'USD' THEN credit_amount * 24000
                    ELSE credit_amount
                END
            ) AS total_credit_amount 
        FROM 
            "Statement"  
        GROUP BY 
            DATE(transaction_date)
        ORDER BY 
            transaction_date ASC;
    `;

		prisma.$disconnect();
		return totals;
	} catch (error) {
		console.error(error);
	}
}

async function getDateRange() {
	try {
		prisma.$connect();
		const transactionDates = await prisma.statement.aggregate({
			_min: {
				transaction_date: true,
			},
			_max: {
				transaction_date: true,
			},
		});
		prisma.$disconnect();
		return {
			minDate: transactionDates._min.transaction_date,
			maxDate: transactionDates._max.transaction_date,
		};
	} catch (error) {
		console.error(error);
	}
}

export { getStatement, getBanks, getTotalTransactionsByDate, getDateRange };
