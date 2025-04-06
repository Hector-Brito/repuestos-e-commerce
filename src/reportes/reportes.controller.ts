import { Controller, Get, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}


  @Get('hoy')
  @Public()
  async getDailyReport(@Res() res:Response){
    const pdf = await this.reportesService.generateDailyReport()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }
}
