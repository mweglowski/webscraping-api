const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require('path');

require("dotenv").config();

const middlewares = require("./middlewares");
const api = require("./api");

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

const downloadImage = async (url, filepath) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream(filepath))
      .on('finish', () => resolve())
      .on('error', e => reject(e));
  });
};

app.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://deslux.pl/");
    const html = response.data;
    const $ = cheerio.load(html);

    const data = [];
    const imageDir = path.join(__dirname, 'images');

    // Create images directory if it doesn't exist
    if (!fs.existsSync(imageDir)){
      fs.mkdirSync(imageDir);
    }

    const downloadPromises = $("div.post-media").map(async (index, element) => {
      const imageSrc = $(element).find("img").attr("src");
      const imageUrl = imageSrc.startsWith('http') ? imageSrc : `http://deslux.pl${imageSrc}`;
      const imagePath = path.join(imageDir, path.basename(imageUrl));
      
      await downloadImage(imageUrl, imagePath);
      data.push({ imageSrc: `/images/${path.basename(imageUrl)}` });
    }).get(); // .get() is necessary to convert the cheerio object to an array

    await Promise.all(downloadPromises);

    res.status(200).json({
      message: "Scraped data",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during web scraping", error: error.message });
  }
  // try {
  //   // const response = await axios.get(
  //   //   "https://rynekpierwotny.pl/s/nowe-mieszkania-i-domy-warszawa/"
  //   // );
  //   const response = await axios.get("http://deslux.pl/");
  //   const html = response.data;
  //   const $ = cheerio.load(html);

  //   const data = [];
  //   console.log("siema");

  //   // $("div.rp-trzvq1").each((index, element) => {
  //   //   const imageSrc = $(element).find("img").attr("src");
  //   //   const title = $(element).find("h2.post-title a").text();
  //   //   const link = $(element).find("h2.post-title a").attr("href");
  //   $("div.post-media").each((index, element) => {
  //     const imageSrc = $(element).find("img").attr("src");

  //     data.push({ imageSrc });
  //   });

  //   // });

  //   res.json({
  //     message: "Scraped data",
  //     data,
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: "Error occurred during web scraping" });
  // }
});

app.use("/images", express.static(path.join(__dirname, 'images')));

app.use("/api", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
