import { select } from "d3-selection";
import { scaleLinear, scaleTime } from "d3-scale";
import { json } from "d3-fetch";
import { min, max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import apiResponse from "../data/data";

import "./app.scss";

const dataUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
const svgW = 800;
const svgH = 400;
const svgP = 16;

const fetchData = async () => {
  let data = null;

  try {
    const res = await json(dataUrl);
    data = res.data;
  } catch (e) {
    console.error(e.message);
  }

  return data;
};

const runApp = async () => {
  select(".js-d3").html("");

  const svgElem = select(".js-d3")
    .append("svg")
    .attr("width", svgW + 96)
    .attr("height", svgH + 64);

  // const dataset = await fetchData();
  // if (!dataset) return;

  const dataset = apiResponse.data;

  const yearDates = dataset.map((item) => new Date(item[0]));
  const xMin = new Date(min(yearDates));
  const xMax = new Date(max(yearDates));

  select(".js-title").text(
    `United States GDP (${xMin.getFullYear()} - ${xMax.getFullYear()})`
  );

  xMax.setMonth(xMax.getMonth() + 3);

  const xScale = scaleTime()
    .domain([min(yearDates), xMax])
    .range([0, svgW]);

  const xAxis = axisBottom(xScale);

  // xAxisGroup
  svgElem
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(64, ${svgH + svgP})`);

  const GDP = dataset.map((item) => item[1]);

  const gdpMax = max(GDP);
  const yAxisScale = scaleLinear().domain([0, gdpMax]).range([svgH, 0]);
  const yAxis = axisLeft(yAxisScale);

  // yAxisGroup
  svgElem
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", `translate(64, ${svgP})`);

  // yLabel
  svgElem
    .append("text")
    .attr("class", "c-yLabel")
    .attr("transform", "rotate(-90)")
    .attr("x", -332)
    .attr("y", 80)
    .text("Gross Domestic Product (Billion)");
};

export default runApp;
