// import { v2 as cloudinary } from "cloudinary";
// import formidable from "formidable";
// import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const form = formidable({});
//     const [fields, files] = await form.parse(req);
    
//     const file = files.file[0];
    
//     const result = await cloudinary.uploader.upload(file.filepath, {
//       resource_type: "auto",
//       folder: "agrocare/profiles",
//     });

//     // Clean up temp file
//     fs.unlinkSync(file.filepath);

//     res.status(200).json({ secure_url: result.secure_url });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ error: "Upload failed" });
//   }
// }



// pages/api/upload.js (updated version)
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    const file = files.file[0];
    const uploadType = fields.type?.[0] || 'profile'; // 'profile' or 'plant'
    
    // Determine folder based on upload type
    const folder = uploadType === 'plant' 
      ? "agrocare/identifications" 
      : "agrocare/profiles";
    
    const result = await cloudinary.uploader.upload(file.filepath, {
      resource_type: "auto",
      folder: folder,
      // Add transformation for plant images to optimize for AI analysis
      ...(uploadType === 'plant' && {
        transformation: [
          { quality: "auto", fetch_format: "auto" },
          { width: 1024, height: 1024, crop: "limit" }
        ]
      })
    });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    res.status(200).json({ 
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
}