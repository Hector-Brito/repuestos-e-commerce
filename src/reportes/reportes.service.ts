import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { PedidosService } from 'src/pedidos/pedidos.service';
import { DateParameters } from './types/dateParameter.type';


@Injectable()
export class ReportesService {

    constructor(
      private pedidosService:PedidosService
    ){}

    async getTemplate(name:string){
        const templateHtml = fs.readFileSync(path.join(process.cwd(),'src','reportes','reportes-templates',`${name}.html`),'utf-8')
        const template = handlebars.compile(templateHtml)
        return template
    }
    async getTotalValues(dateParameters:DateParameters){
      const valoresTotales = await this.pedidosService.getTotalValuesFromSales(dateParameters)
      const data = {
          periodoInicial:new Date(dateParameters.fromYear,dateParameters.fromMonth,dateParameters.fromDay).toLocaleDateString('es-ES'),
          periodoFinal:new Date(dateParameters.untilYear,dateParameters.untilMonth,dateParameters.untilDay).toLocaleDateString('es-ES'),
          empresa:'AUTOPARTES-MATURIN',
          valor_total_ventas:valoresTotales.valorTotal,
          total_ventas_tienda:valoresTotales.ventasTienda.ventasTotales,
          total_ventas_online:valoresTotales.enviosOnline.enviosTotales,
          valor_total_ventas_tienda:valoresTotales.ventasTienda.valorTotalVentasTienda,
          valor_total_ventas_online:valoresTotales.enviosOnline.valorTotalEnviosOnline,
          mejor_vendedor_nombre:valoresTotales.mayoresVendedores[0]?.vendedor_username ?? undefined,
          mejor_vendedor_pedidos:valoresTotales.mayoresVendedores[0]?.ventasTotales ?? undefined,
          mejor_vendedor_valor:valoresTotales.mejor_vendedor_valor,
          mejores_vendedores:valoresTotales.mayoresVendedores,
      }
      return data
    }

    async generateSalesReport(dateParameters:DateParameters){
        const data = await this.getTotalValues(dateParameters) 
        const template = await this.getTemplate('daily-report')
        const html = template(data)
        const browser = await puppeteer.launch({headless:true,args:['--no-sandbox']})
        const page = await browser.newPage()
        await page.setContent(html)
        const buffer = await page.pdf(
          {
            printBackground:true,
            format:'A4'
          }
        )
        await browser.close()
        return buffer
    }

    async generateCategoryReport(){}

    async generateProductHistoryReport(){}

    async generateMostSoldProductsReport(){}

    async generateLeastSoldProductsReport(){}

    async generateZeroExistenceProductsReport(){}
}
