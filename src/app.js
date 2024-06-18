const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

require("dotenv").config();

const middlewares = require("./middlewares");
const api = require("./api");

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

app.get("/", async (req, res) => {
  // try {
  //   const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  //   const targetUrl = "http://deslux.pl/";

  //   const response = await axios.get(`${proxyUrl}${targetUrl}`, {
  //     headers: {
  //       'origin': 'https://ladyfinanse.vercel.app',  // Use your development or production domain
  //       'x-requested-with': 'XMLHttpRequest',
  //     }
  //   });

  //   const html = response.data;
  //   const $ = cheerio.load(html);

  //   const data = [];

  //   $("div.post-media").each((index, element) => {
  //     const imageSrc = $(element).find("img").attr("src");
  //     data.push({ imageSrc });
  //   });

  //   res.status(200).json({
  //     message: "Scraped data",
  //     data,
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: "Error occurred during web scraping", error: error.message });
  // }
  try {
    // const response = await axios.get(
    //   "https://rynekpierwotny.pl/s/nowe-mieszkania-i-domy-warszawa/"
    // );
    const response = await axios.get("http://deslux.pl/");
    const html = response.data;
    const $ = cheerio.load(html);

    const data = [];
    console.log("siema");

    // $("div.rp-trzvq1").each((index, element) => {
    //   const imageSrc = $(element).find("img").attr("src");
    //   const title = $(element).find("h2.post-title a").text();
    //   const link = $(element).find("h2.post-title a").attr("href");
    $("div.post-media").each((index, element) => {
      const imageSrc = $(element).find("img").attr("src");

      data.push({ imageSrc });
    });

    // });

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
