import { Router } from "express";
import UrlModel from "../database/urlModel.js";
import { nanoid } from "nanoid";
import validateUrl from "./validUrl.js"
const urlRouter = Router();


urlRouter.post("/short", async (req, res) => {
  const { origUrl } = req.body;

  const urlId = nanoid();
  if (validateUrl(origUrl)) {
console.log( nanoid());
console.log("hello")
  try {
    let url = await UrlModel.findOne({ origUrl });

    if (url) {
      res.json(url);
    } else {
      const shortUrl = `http://localhost:5173/rd/${urlId}`;

      url = new UrlModel({
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
urlRouter.post("/sh", async (req, res) =>{

  const {origUrl} = req.body;

  const url = new UrlModel ({ origUrl})
await url.save()
})
// urlRouter.post("/sh", async (req, res) => {
//   const { origUrl } = req.body;
//   try{
//     const url = new UrlModel ({ origUrl }); 
//     await url.save();
//     res.status(200).json({message:"Success", data:""})
//   }catch(err)
// {
//   console.error(err)
// }
// });

// urlRouter.get("/short/:urlId", async (req, res) => {
//   const { urlId } = req.params;
//   const url = await UrlModel.findOne({urlId:urlId })
 
// try{
//  res.status(200).json({UrlData:url});

// if (url) {
// url.clicks+=1
// await url.save();
// // console.log(url)
// res.status(200).json({UrlData:url})
//   return res.redirect(url.origUrl);
// } 
// } catch (err) {
// if(!url){
//   res.status(404).json("Not found");
//   console.log(err);
// }
// }
// })
// urlRouter.get("/short", async (req, res) => {
//   const url = await UrlModel.find({})
 
// try{
//  res.status(200).json({UrlData:url});

// if (url) {

// res.status(200).json({UrlData:url})
// } 
// } catch (err) {
// if(!url){
//   res.status(404).json("Not found");
//   console.log(err);
  
// }
// }
// })



export default urlRouter;
