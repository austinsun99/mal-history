/** @import { DataSet, ChartInfo } from "./chart.js" */

/** @typedef {object} EntryInfo
 * @property {string} name
 * @property {{date: Date, score: number}[]} points
 */

/** @typedef {object} JsonEntry
 * @property {string} name
 * @property {{date: number, score: number}[]} points
 */

/** Parses the json object into an array of EntryInfo
 * @returns {Promise<EntryInfo[]>}
 */
async function parseData() {

	const file = await fetch("http://127.0.0.1:8080/data/scores.json");

	/** @type {Array.<JsonEntry>} */
	const data = await file.json();

	const convertJsonEntryToEntryInfo = function(/** @type {JsonEntry} */ jsonEntry) {

		/** @type {Array.{date: Date, score: number}} */
		const entryInfoPoints = Array();

		jsonEntry.points.forEach(point => {
			entryInfoPoints.push({
				date: new Date(point.date),
				score: point.score,
			});
		});

		/** @type {EntryInfo} */
		const entryInfo = {
			name: jsonEntry.name,
			points: entryInfoPoints,
		}

		return entryInfo;
	}

	return new Promise((resolve, _) => {
		resolve(data.map(convertJsonEntryToEntryInfo));
	});
}

/**
 * @async
 * @returns {Promise<ChartInfo>}
 */
async function getChartInfo() {

	const entryInfos = await parseData();

	/** @type {DataSet[]} */
	const dataSets = Array();

	/** @type {Date} */
	let oldestDate = entryInfos[0].points[0].date;

	/** @type {Date} */
	let newestDate = entryInfos[0].points[entryInfos[0].points.length - 1].date;

	entryInfos.forEach((entryInfo) => {
		const earliest = entryInfo.points[0].date;
		const latest = entryInfo.points[entryInfo.points.length - 1].date;
		if (earliest < oldestDate) oldestDate = earliest;
		if (latest > newestDate) newestDate = latest;
	})

	const dateDifference = newestDate - oldestDate;

	//TODO: Currently normalizes score to be between 9 and 10. Should normalize between lowest score and 10
	console.log("TODO");

	for (const entryInfo of entryInfos) {

		/** @type {{normalizedTime: number, normalizedScore: number}} */
		const normalizedPoints = Array();

		for (const point of entryInfo.points) {
			normalizedPoints.push(
				{
					x: (point.date - oldestDate) / dateDifference,
					y: point.score - 9,
				});
		}

		/** @type {DataSet} */
		const dataSet = {
			name: entryInfo.name,
			points: normalizedPoints,
		}

		dataSets.push(dataSet);

	}

	//TODO: Dynamic
	console.log("TODO");

	const xAxisStartingDate = new Date(oldestDate.getUTCFullYear(), oldestDate.getUTCMonth());

	/** @type {{position: number, text: string}[]} */
	const yAxisText = [
		{ position: 0.00, text: "9" },
		{ position: 0.25, text: "9.25" },
		{ position: 0.50, text: "9.5" },
		{ position: 0.75, text: "9.75" },
		{ position: 1.00, text: "10" },
	]

	/** @type {{position: number, text: string}[]} */
	const xAxisText = Array();

	const now = new Date(Date.now());

	for (let i = xAxisStartingDate; i < now; i.setUTCMonth(i.getUTCMonth() + 1)) {
		xAxisText.push({ position: (i - xAxisStartingDate) / (now - xAxisStartingDate), text: i.toDateString() });
	}

	const axesWidth = 5;
	const axesTextPadding = 10;

	/** @type {ChartInfo} */
	const chartInfo = {
		name: "MAL History",
		xAxisText: xAxisText,
		yAxisText: yAxisText,
		axesWidth: axesWidth,
		axesTextPadding: axesTextPadding,
		maxDataSetsToShow: 10,
		dataSets: dataSets,
	}

	return new Promise((resolve, _) => resolve(chartInfo));

}

export { getChartInfo };
