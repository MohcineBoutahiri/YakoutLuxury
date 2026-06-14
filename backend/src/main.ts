import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { SecurityConfigService } from "./common/services/security-config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 4000;
  const logger = new Logger("Bootstrap");
  const securityConfigService = app.get(SecurityConfigService);

  app.setGlobalPrefix("api");
  app.use(helmet());

  app.enableCors({
    origin: securityConfigService.getCorsOrigins(),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  logger.log(`API running on http://localhost:${port}/api`);
}

void bootstrap();
