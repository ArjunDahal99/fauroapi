import Replicate from "replicate";
import got from 'got' // if you don't have "got" - install it with "npm install got"
import { v2 as cloudinary } from "cloudinary";
import db from "../utils/db-server.js";

const replicate = new Replicate({
  auth: "r8_W6J9Mh7LCdUqR00xue5tRdyaNkbnsKJ0msq3q",
});

cloudinary.config({
  cloud_name: "dldlrp6ta",
  api_key: "249798923551299",
  api_secret: "AgGJs1lYRM3Za9LKTX6wCoo5lgA",
  secure: true,
});



const apiKey = 'acc_e00fb21ec8b4b69';
const apiSecret = '2bc6a4f3eaec6383a9b966d6a5f8ce0a';





export const generateImage = async (req, res) =>
{
  const { prompt, height, width, engineModel, email, isFeatured } = await req.body;
  const userFromdb = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!userFromdb)
    return res.status(404).json({
      message: "Sign in First",
    });




  //generate image from replicate
  try
  {
    var tagNames;
    var colorData;
    let output = await replicate.run(engineModel, {
      input: {
        prompt,
        height,
        width,
      },
    });


    // get tags from imagga

    const imageUrl = output[0];
    const url = 'https://api.imagga.com/v2/tags?image_url=' + encodeURIComponent(imageUrl);

    (async () =>
    {
      try
      {
        const response = await got(url, { username: apiKey, password: apiSecret });

        const data = await JSON.parse(response.body);
        const tagsWithHighConfidence = data.result.tags
          .filter((tag) => tag.confidence > 20)
          .map((tag) => tag.tag.en);
        tagNames = await tagsWithHighConfidence.map((tagName) => tagName);


      } catch (error)
      {
        console.log(error);
      }
    })();
    //get color data from the image
    const urlforColor = 'https://api.imagga.com/v2/colors?image_url=' + encodeURIComponent(imageUrl);
    (async () =>
    {
      try
      {
        const response = await got(urlforColor, { username: apiKey, password: apiSecret });
        const data = await JSON.parse(response.body);
        const newData = await data.result.colors.background_colors;
        colorData = await newData.map((i) => ({
          color: i.closest_palette_color,
          colorCode: i.html_code,
          percentage: i.percent,
        }));

      } catch (error)
      {
        console.log(error);
      }
    })();


    //finally upload to cloud and the cloudurl is saved to the database

    await cloudinary.uploader.upload(output[0]).then(async (result) =>
    {

      const image = await db.image.create({
        data: {
          height,
          width,
          url: result.url,
          userId: userFromdb.id,
          prompt,
          isFeatured,
          tags: tagNames.map((t) => t),
          BackgroundColor: {
            create: colorData,
          },
        },
      });

      //reduce the token from the user
      const user = await db.user.update({
        where: { id: userFromdb.id },
        data: {
          token: userFromdb.token - 10,
        },
      });

      res.json(image);
    });
  } catch (error)
  {
    console.log(error);
  }
};
