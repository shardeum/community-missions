import { Controller, Post, Query } from "@nestjs/common";
import { AppService } from "./app.service";

interface IQuery {
  success: boolean;
  message: string;
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post("sendSHM")
  sendSHM(@Query("address") _address: string): Promise<IQuery> {
    return this.appService.sendSHM(_address);
  }
}
