import { select } from "d3-selection";

const runApp = () => {
  select(".js-d3").append("h1").attr("id", "title").text("Hello D3");
};

export default runApp;
