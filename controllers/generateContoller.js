import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import db from "../utils/db-server.js";

const replicate = new Replicate({
  auth: "r8_IIUXxJmBaYiGyVIfiR94pxlJ1BQlO4q4SuTt6",
});

cloudinary.config({
  cloud_name: "dldlrp6ta",
  api_key: "249798923551299",
  api_secret: "AgGJs1lYRM3Za9LKTX6wCoo5lgA",
  secure: true,
});

export const generateImage = async (req, res) => {
  const { prompt, negativeprompt, height, width, engineModel, email } =
    await req.body;

  const userFromdb = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!userFromdb)
    return res.status(404).json({
      message: "Sign in First",
    });

  try {
    let output = await replicate.run(engineModel, {
      input: {
        prompt,
        negative_prompt: negativeprompt,
        height,
        width,
      },
    });
    console.log(output[0]);
    await cloudinary.uploader.upload(output[0]).then(async (result) => {
      const image = await db.image.create({
        data: {
          height,
          width,
          url: result.url,
          userId: userFromdb.id,
          prompt,
        },
      });
      const user = await db.user.update({
        where: { id: userFromdb.id },
        data: {
          token: userFromdb.token - 10,
        },
      });

      res.json(image);
    });
  } catch (error) {
    console.log(error);
  }
};
