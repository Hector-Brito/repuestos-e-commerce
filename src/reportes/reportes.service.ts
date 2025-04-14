import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { PedidosService } from 'src/pedidos/pedidos.service';


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
    async getTotalValues(fromDay:number,ToDay:number,fromMonth:number,ToMonth:number,fromYear:number,ToYear:number){
      const valoresTotales = await this.pedidosService.getTotalValuesFromSales(fromDay,ToDay,fromMonth,ToMonth,fromYear,ToYear)

      return valoresTotales
      
    }

    async generateDailyReport(){
        const valoresTotales = await this.getTotalValues(1,28,1,1,2025,2025)
        const data = {
            titulo:'REPORTE DE VENTAS',
            empresa:'AUTOPARTES-MATURIN',
            valor_total_ventas:valoresTotales.valorTotal,
            total_ventas_tienda:valoresTotales.ventasTienda.ventasTotales,
            valor_total_ventas_tienda:valoresTotales.ventasTienda.valorTotalVentasTienda,
            total_pedidos:valoresTotales.enviosOnline.enviosTotales,
            mejor_vendedor_nombre:valoresTotales.mayoresVendedores[0].vendedor_username,
            mejor_vendedor_pedidos:valoresTotales.mayoresVendedores[0].ventasTotales,
            mejor_vendedor_valor:valoresTotales.mejor_vendedor_valor,
            mejores_vendedores:valoresTotales.mayoresVendedores,
        }
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

    async generateMonthlyReport(){
        const data = {
            titulo:'REPORTE DE VENTAS',
            empresa:'AUTOPARTES-MATURIN'
        }
        const template = await this.getTemplate('monthly-report')
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

    async generateYearlyReport(){
        const data = {
            titulo:'REPORTE DE VENTAS',
            empresa:'AUTOPARTES-MATURIN'
        }
        const template = await this.getTemplate('yearly-report')
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
