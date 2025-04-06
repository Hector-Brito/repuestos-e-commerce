import { Controller, Get, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}


  @Get('diario')
  @Public()
  async getDailyReport(@Res() res:Response){
    const pdf = await this.reportesService.generateDailyReport()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  @Get('mensual')
  @Public()
  async getMonthlyReport(@Res() res:Response){
    const pdf = await this.reportesService.generateMonthlyReport()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  @Get('anual')
  @Public()
  async getYearlyReport(@Res() res:Response){
    const pdf = await this.reportesService.generateYearlyReport()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }
}
