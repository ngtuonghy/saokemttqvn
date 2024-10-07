import { bidv } from "./bidv/bidv.js";
import { vietinbank } from "./vietinbank/vietinbank.js";
import { vietcombank } from "./vietcombank/vietcombank.js";
import pLimit from "p-limit";

const limit = pLimit(1);

(async () => {
	try {
		const tasks = [
			// true: move file to archive, false: keep file in the same folder ///|| true: deleteAll Sql data, false: keep Sql data
			() => vietinbank(true, false),
			() => vietcombank(true, false),
			() => bidv(true, false),
		];

		const limitedTasks = tasks.map((task) => limit(task));

		await Promise.all(limitedTasks);

		console.log("All tasks have been executed successfully.");
	} catch (error) {
		console.error("Error executing tasks:", error);
	}
})();
