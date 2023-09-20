import { Router } from "express";
import URL from "../database/urlModel.js";
import express from "express";
import { nanoid } from "nanoid";
import validateUrl from "./validUrl.js"
const urlRouter = express.Router();

urlRouter.post("/short", async (req, res) => {
  const { origUrl } = req.body;

  // Check if the provided URL is valid


  const urlId = nanoid();
  if (validateUrl(origUrl)) {

  try {
    let url = await URL.findOne({ origUrl });

    if (url) {
      res.json(url);
    } else {
      const shortUrl = `http://localhost:5173/rd/${urlId}`;

      url = new URL({
        origUrl,
        shortUrl,
        urlId,
        date: new Date(),
      });

      await url.save();
      res.status(200).json(url);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
}else {
  res.status(400).json({message:'Invalid Original Url', code:0});
}
});
urlRouter.get("/short/:urlId", async (req, res) => {
  const { urlId } = req.params;
  const url = await URL.findOne({urlId:urlId })
 
try{
 res.status(200).json({UrlData:url});

if (url) {
url.clicks+=1
await url.save();
// console.log(url)
res.status(200).json({UrlData:url})
  return res.redirect(url.origUrl);
} 
} catch (err) {
if(!url){
  res.status(404).json("Not found");
  console.log(err);
}
}
})
urlRouter.get("/short", async (req, res) => {
  const url = await URL.find({})
 
try{
 res.status(200).json({UrlData:url});

if (url) {

res.status(200).json({UrlData:url})
} 
} catch (err) {
if(!url){
  res.status(404).json("Not found");
  console.log(err);
}
}
})



export default urlRouter;
