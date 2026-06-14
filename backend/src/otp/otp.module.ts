import { Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module";
import { OtpService } from "./otp.service";

@Module({
  imports: [CommonModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
