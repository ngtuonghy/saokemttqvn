import { bidv } from "./bidv/bidv.js";
import { vietinbank } from "./vietinbank/vietinbank.js";
import { vietcombank } from "./vietcombank/vietcombank.js";
import pLimit from "p-limit";
import { agribank } from "./agribank/agribank.js";
import { redis } from "../src/libs/redis/index.js";

const limit = pLimit(1);

(async () => {
	try {
		const tasks = [
			// true: move file to archive, false: keep file in the same folder ///|| true: deleteAll Sql data, false: keep Sql data
			() => vietinbank(true, false),
			() => vietcombank(true, false),
			() => bidv(true, false),
			() => agribank(true, false),
		];

		const limitedTasks = tasks.map((task) => limit(task));

		await Promise.all(limitedTasks);

		console.log("All tasks have been executed successfully.");
		await redis.FLUSHALL();
		console.log("Redis FLUSHALL completed.");
		await redis.quit();
	} catch (error) {
		console.error("Error executing tasks:", error);
	}
})();
