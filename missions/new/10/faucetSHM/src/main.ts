import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions = {
    origin: true,
    methods: "POST",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: "Content-Type, Accept, Authorization",
  };
  app.enableCors(corsOptions);

  const config = new DocumentBuilder()
    .setTitle("Capstone Team 4 Encode Bootcamp")
    .setDescription("API description for Capstone Team 4 Encode")
    .setVersion("1.0")
    .addTag("Capstone Project")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
