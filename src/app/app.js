import { select } from "d3-selection";
import { scaleLinear, scaleTime } from "d3-scale";
import { json } from "d3-fetch";
import { min, max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import apiData from "../data/data";

import "./app.scss";

const dataUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
const svgW = 800;
const svgH = 450;
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

  let dataset = await fetchData();
  if (!dataset) dataset = apiData.data;

  const dataW = svgW / dataset.length;

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

  const linearScale = scaleLinear().domain([0, gdpMax]).range([0, svgH]);

  const scaledGDP = GDP.map((item) => linearScale(item));

  const tooltipYears = dataset.map((item) => {
    let quarter;
    const month = item[0].substring(5, 7);

    if (month === "01") {
      quarter = "Q1";
    } else if (month === "04") {
      quarter = "Q2";
    } else if (month === "07") {
      quarter = "Q3";
    } else if (month === "10") {
      quarter = "Q4";
    }

    return `${item[0].substring(0, 4)} ${quarter}`;
  });

  const tooltip = select(".js-d3")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  select("svg")
    .selectAll("rect")
    .data(scaledGDP)
    .enter()
    .append("rect")
    .attr("data-date", (d, i) => dataset[i][0])
    .attr("data-gdp", (d, i) => dataset[i][1])
    .attr("class", "bar")
    .attr("x", (d, i) => xScale(yearDates[i]))
    .attr("y", (d) => svgH - d)
    .attr("width", dataW)
    .attr("height", (d) => d)
    .attr("transform", `translate(64, ${svgP})`)
    .on("mouseover", function showTooltip(d, i) {
      const svgPos = document.querySelector("svg").getBoundingClientRect().x;
      const dataPos = parseInt(this.x.animVal.value, 10) + svgPos;
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          `${tooltipYears[i]} <br> $${GDP[i]
            .toFixed(1)
            .replace(/(\d)(?=(\d{3})+\.)/g, "$1,")} Billion`
        )
        .attr("data-date", dataset[i][0])
        .style("left", `${dataPos + 32}px`)
        .style("top", `${svgH + 16}px`)
        .style("transform", "translateX(60px)");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
};

export default runApp;
