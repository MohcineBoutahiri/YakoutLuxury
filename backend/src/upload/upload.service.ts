import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

@Injectable()
export class UploadService {
  async uploadProductImage(file?: Express.Multer.File) {
    this.validateCloudinaryConfig();
    this.validateProductImage(file);

    const result = await this.uploadToCloudinary(file);

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  }

  private validateCloudinaryConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        "Cloudinary n'est pas configure. Renseignez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.",
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  private validateProductImage(
    file?: Express.Multer.File,
  ): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException("Aucune image n'a ete envoyee.");
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "Type de fichier invalide. Formats acceptes: JPG, PNG, WEBP, AVIF.",
      );
    }

    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      throw new BadRequestException("L'image ne doit pas depasser 5 Mo.");
    }
  }

  private uploadToCloudinary(file: Express.Multer.File) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "yakout-luxury/products",
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(
              new InternalServerErrorException(
                "Impossible d'uploader l'image sur Cloudinary.",
              ),
            );
            return;
          }

          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
