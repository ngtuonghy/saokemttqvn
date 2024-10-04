"use server";
import { prisma } from "@/libs/prisma";

const getStatement = async (offSet = 1, search = "", date, banksName = "") => {
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
		if (startDate && endDate) {
			dateFilter = { gte: startDate, lte: endDate };
		} else if (startDate) {
			dateFilter = { equals: startDate };
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
				banksName.length > 0 ? { bank_name: { in: banksName } } : undefined,
			].filter(Boolean),
		},
	});

	prisma.$disconnect();
	return JSON.parse(JSON.stringify(data));
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
	prisma.$connect;
	const totals = await prisma.$queryRaw`
    SELECT 
        DATE(transaction_date) AS transaction_date, 
        SUM(credit_amount) AS total_credit_amount 
    FROM 
        "Statement"  
    GROUP BY 
        DATE(transaction_date)
    ORDER BY 
        transaction_date ASC; 
`;

	return totals;
}

export { getStatement, getBanks, getTotalTransactionsByDate };
