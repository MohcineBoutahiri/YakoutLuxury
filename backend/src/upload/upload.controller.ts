import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { UploadService } from "./upload.service";

const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

@Controller("admin/upload")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("product-image")
  @UseInterceptors(
    FileInterceptor("image", {
      limits: {
        fileSize: MAX_PRODUCT_IMAGE_SIZE,
        files: 1,
      },
    }),
  )
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PRODUCT_IMAGE_SIZE }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp|avif)$/,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadService.uploadProductImage(file);
  }
}
