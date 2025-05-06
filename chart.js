export {drawLineChart}

/**
 * @typedef DataSet - A set of points and its associated information
 * @type {object}
 * @property {string} name
 * @property {Array.<{x: number, y: number}>} points - The set of points, 0 <= x, y <= 1, represents
 * the location along the axes as a percentage
 */

/** 
 * @typedef ChartInfo
 * @type {object}
 * @property {string} name
 * @property {Array.<{position: Number, text: String}>} xAxisText - position of text on the x axis, position
 * is a value between 0 and 1.
 * @property {Array.<{position: Number, text: String}>} yAxisText - position of text on the y axis, position
 * is a value between 0 and 1.
 * @property {number} axesWidth - width of axes lines
 * @property {number} axesTextPadding - space between the axes lines and the text
 * @property {Array.<DataSet>} dataSets
 * @property {int} maxDataSetsToShow - The max number of data sets the chart can show
 */

/**
 * @typedef BoundingBox - (xMin, yMin) represents (0, 0) on the coordinate planes
 * @type {object}
 * @property {number} xMin
 * @property {number} xMax
 * @property {number} yMin
 * @property {number} yMax
 */

/** 
 * Draws the line chart
 * @param {ChartInfo} chartInfo 
 * @param {HTMLCanvasElement} chartCanvas
 * */
function drawLineChart(chartInfo, chartCanvas) {

	/** @type {BoundingBox} */
	const boundingBox = drawChartGrid(chartInfo, chartCanvas);

	for (let i = 0; i < Math.min(chartInfo.dataSets.length, chartInfo.maxDataSetsToShow); i++) {
		DrawDataSet(boundingBox, chartInfo.dataSets[i], chartCanvas);
	}

}

/**
 * Draws the axes for the chart and labels them. Returns the box for which the graph can be drawn
 * @param {ChartInfo} chartInfo
 * @param {HTMLCanvasElement} canvas Canvas element
 * @returns {BoundingBox} Bounding box for graph
 */
function drawChartGrid(chartInfo, canvas) {

	/** @type {CanvasRenderingContext2D} */
	const ctx = canvas.getContext("2d");

	/** @constant {Array.<{{position: number, text: string}}>} */
	const yAxisText = chartInfo.yAxisText;
	/** @constant {Array.<{{position: number, text: string}}>} */
	const xAxisText = chartInfo.xAxisText;

	/** @type {number} */
	let yAxisMaxWidth = 0;
	/** @type {number} */
	let xAxisMaxHeight = 0;

	yAxisText.forEach((textInfo) => {
		/** @constant {number} */
		const textWidth = ctx.measureText(textInfo.text).width;
		if (textWidth > yAxisMaxWidth) yAxisMaxWidth = textWidth;
	})

	xAxisText.forEach((textInfo) => {
		/** @constant {number} */
		const textHeight = Math.abs(ctx.measureText(textInfo.text)["fontBoundingBoxAscent"]);
		if (textHeight > xAxisMaxHeight) xAxisMaxHeight = textHeight;
	})

	/** @type {BoundingBox} */
	const boundingBox = {
		xMin: yAxisMaxWidth + chartInfo.axesTextPadding,
		xMax: canvas.width - ctx.measureText(xAxisText[xAxisText.length - 1].text).width,
		yMin: canvas.height - xAxisMaxHeight - chartInfo.axesTextPadding,
		yMax: Math.abs(ctx.measureText(yAxisText[yAxisText.length - 1].text)["fontBoundingBoxAscent"]),
	}

	for (let i = 0; i < yAxisText.length; i++) {
		ctx.strokeText(yAxisText[i].text, 0, GetCoordinatesOnPlane(boundingBox, { x: 0, y: yAxisText[i].position }).y);
	}

	for (let i = 0; i < xAxisText.length; i++) {
		ctx.strokeText(xAxisText[i].text, GetCoordinatesOnPlane(boundingBox, { x: xAxisText[i].position, y: 0 }).x, canvas.height);
	}

	ctx.moveTo(boundingBox.xMin, boundingBox.yMax);
	ctx.lineTo(boundingBox.xMin, boundingBox.yMin);
	ctx.lineTo(boundingBox.xMax, boundingBox.yMin);
	ctx.lineWidth = chartInfo.axesWidth;
	ctx.stroke();

	return boundingBox;

}

/**
 * Draws the points on a data set, and connects the lines
 * @param {BoundingBox} boundingBox 
 * @param {DataSet} dataSet 
 * @param {HTMLCanvasElement} canvas Canvas element
 * @returns {BoundingBox} Bounding box for graph
 */
function DrawDataSet(boundingBox, dataSet, canvas) {

	const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "rgba(255, 0, 0, 1)";
	dataSet.points.forEach((point) => {
		ctx.beginPath();
		const circleLocation = GetCoordinatesOnPlane(boundingBox, point);
		ctx.arc(circleLocation.x, circleLocation.y, 1, 0, 2 * Math.PI);
		ctx.stroke();
	})

    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
	if (!(dataSet.points.length <= 1)) {
		ctx.beginPath();

		const startingPoint = GetCoordinatesOnPlane(boundingBox, dataSet.points[0]);
		ctx.moveTo(startingPoint.x, startingPoint.y);
		for (let i = 1; i < dataSet.points.length; i++) {
			const lineLocation = GetCoordinatesOnPlane(boundingBox, dataSet.points[i]);
			ctx.lineTo(lineLocation.x, lineLocation.y);
		}
		ctx.lineWidth = 2;
		ctx.stroke();
	}

}

/** 
 * Returns the coordinates on the coordinate plane
 * @param {BoundingBox} boundingBox - The bounds of the coordinate plane on the canvas
 * @param {{x: number, y: number}} point - 0 <= x, y <= 1, x and y represents the percentage
 * along the coordinate axes
 * @returns {{x: number, y: number}} point on the coordinate plane as pixel on canvas
 * */
function GetCoordinatesOnPlane(boundingBox, point) {
	return {
		x: boundingBox.xMin + point.x * (boundingBox.xMax - boundingBox.xMin),
		y: boundingBox.yMin + point.y * (boundingBox.yMax - boundingBox.yMin),
	}
}
