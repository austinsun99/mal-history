import { drawLineChart } from "./chart.js";
import { getChartInfo } from "./parseData.js";
/** @import { ChartInfo } from "./chart" */

window.onload = async _ => {

	/** @type {ChartInfo} */
	const chartInfoData = {
		name: "History",
		xAxisText: [
			{ position: 0.00, text: "2020" },
			{ position: 0.25, text: "2021" },
			{ position: 0.50, text: "2022" },
			{ position: 0.75, text: "2023" },
			{ position: 1.00, text: "2024" },
		],
		yAxisText: [
			{ position: 0.00, text: "9" },
			{ position: 0.25, text: "9.25" },
			{ position: 0.50, text: "9.5" },
			{ position: 0.75, text: "9.75" },
			{ position: 1.00, text: "10" },
		],
		axesWidth: 5,
		axesTextPadding: 10,
		dataSets: [
			{
				name: "AT",
				points: [{ x: 0, y: 0 }, { x: 0.2, y: 0.4 }, { x: 0.3, y: 0.5 }, { x: 1, y: 0.2 }]
			}
		]
	}

	/** @constant {HTMLCanvasElement} */
	const chart = document.getElementById("ranking-canvas");

	const chartInfo = await getChartInfo();
	console.log(chartInfo);
	drawLineChart(chartInfo, chart);
	
}

