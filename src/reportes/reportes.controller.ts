import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { Response } from 'express';
import { DateParameters } from './types/dateParameter.type';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('reporte-ventas')
  @Public()
  async getSalesReport(
    @Res() res:Response,
    @Query('fromDay') fromDay?:number,
    @Query('fromMonth') fromMonth?:number,
    @Query('fromYear') fromYear?:number,
    @Query('untilDay') untilDay?:number,
    @Query('untilMonth') untilMonth?:number,
    @Query('untilYear') untilYear?:number
  ){
    const now = new Date()
    now.setHours(0,0,0,0)
    const dateParameters:DateParameters = {
      fromDay:fromDay ?? now.getDate(),
      fromMonth:fromMonth ?? now.getMonth(), 
      fromYear:fromYear ?? now.getFullYear(), 
      untilDay:untilDay ?? now.getDate()+1, 
      untilMonth:untilMonth ?? now.getMonth(),
      untilYear:untilYear ?? now.getFullYear() 
    }
    const pdf = await this.reportesService.generateSalesReport(dateParameters)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  @Get('reporte-ventas/categorias')
  @Public()
  async getCategoryReport(
    @Res() res:Response,
    @Query('fromDay') fromDay?:number,
    @Query('fromMonth') fromMonth?:number,
    @Query('fromYear') fromYear?:number,
    @Query('untilDay') untilDay?:number,
    @Query('untilMonth') untilMonth?:number,
    @Query('untilYear') untilYear?:number
  ){
    const now = new Date()
    now.setHours(0,0,0,0)
    const dateParameters:DateParameters = {
      fromDay:fromDay ?? now.getDate(),
      fromMonth:fromMonth ?? now.getMonth(), 
      fromYear:fromYear ?? now.getFullYear(), 
      untilDay:untilDay ?? now.getDate()+1, 
      untilMonth:untilMonth ?? now.getMonth(),
      untilYear:untilYear ?? now.getFullYear() 
    }
    //revisar colocando mas productos vendidos y probar que esta bien
    const pdf = await this.reportesService.generateCategoryReport(dateParameters)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  @Get('reporte-ventas/productos')
  @Public()
  async getZeroExistenceProductsReport(
    @Res() res:Response,
  ){
    const pdf = await this.reportesService.generateZeroExistenceProductsReport()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

}
