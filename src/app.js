const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

require("dotenv").config();

const middlewares = require("./middlewares");
const api = require("./api");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://deslux.pl/");
    const html = response.data;
    const $ = cheerio.load(html);

    const data = [];

    $("li.blog-grid-style").each((index, element) => {
      const imageSrc = $(element).find("div.post-media img").attr("src");
      const title = $(element).find("h2.post-title a").text();
      const link = $(element).find("h2.post-title a").attr("href");

      data.push({ imageSrc, title, link });
    });

    res.json({
      message: "Scraped data",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during web scraping" });
  }
});

app.use("/api", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
