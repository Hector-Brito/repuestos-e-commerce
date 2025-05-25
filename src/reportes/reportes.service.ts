import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { PedidosService } from 'src/pedidos/pedidos.service';
import { DateParameters } from './types/dateParameter.type';
import { ProductosService } from 'src/productos/productos.service';


@Injectable()
export class ReportesService {

    constructor(
      private pedidosService:PedidosService,
      private productosService:ProductosService
    ){}

    async getTemplate(name:string){
        const templateHtml = fs.readFileSync(path.join(process.cwd(),'src','reportes','reportes-templates',`${name}.html`),'utf-8')
        const template = handlebars.compile(templateHtml)
        return template
    }

    async getTotalValues(dateParameters:DateParameters){
      await this.pedidosService.getTotalValuesSales(dateParameters)
      console.log('Executed')
      //
      const valoresTotales = await this.pedidosService.getTotalValuesFromSales(dateParameters)
      const data = {
          año:new Date().getFullYear(),
          periodoInicial:new Date(dateParameters.fromYear,dateParameters.fromMonth,dateParameters.fromDay).toLocaleDateString('es-ES'),
          periodoFinal:new Date(dateParameters.untilYear,dateParameters.untilMonth,dateParameters.untilDay).toLocaleDateString('es-ES'),
          empresa:'AUTOPARTES-MATURIN',
          valor_total_ventas:valoresTotales.valorTotal,
          //total_ventas_tienda:valoresTotales.ventasTienda.ventasTotales,
          //total_ventas_online:valoresTotales.enviosOnline.enviosTotales,
          //valor_total_ventas_tienda:valoresTotales.ventasTienda.valorTotalVentasTienda,
          //valor_total_ventas_online:valoresTotales.enviosOnline.valorTotalEnviosOnline,
          mejor_vendedor_nombre:valoresTotales.mayoresVendedores[0]?.vendedor_username ?? undefined,
          mejor_vendedor_pedidos:valoresTotales.mayoresVendedores[0]?.ventasTotales ?? undefined,
          mejor_vendedor_valor:valoresTotales.mejor_vendedor_valor,
          mejores_vendedores:valoresTotales.mayoresVendedores,
      }
      //Englobar las ventas en tienda y ventas online
      //filtar por vendedor
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
            format:'A4',
            landscape:true
          }
        )
        await browser.close()
        return buffer
    }

    async getCategoryValues(dateParameters:DateParameters){
      const totalProductoPorCategoria = await this.pedidosService.getTotalSalesFromCategory(dateParameters)
      let data:{
        categoria_id:string,
        categoria_nombre:string,
        productos:{
          producto_nombre:string,
          producto_cantidad: number
        }[],
        totalProductoPorCategoria:number

      }[] = []
      for( const key of Object.keys(totalProductoPorCategoria)){
        data.push(totalProductoPorCategoria[key])
      }
      return data
    }

    async generateCategoryReport(dateParameters:DateParameters){
        const totalProductoPorCategoria = await this.getCategoryValues(dateParameters)
        const data = {
          año:new Date().getFullYear(),
          fecha_inicio:new Date(dateParameters.fromYear,dateParameters.fromMonth,dateParameters.fromDay).toLocaleDateString('es-ES'),
          fecha_fin:new Date(dateParameters.untilYear,dateParameters.untilMonth,dateParameters.untilDay).toLocaleDateString('es-ES'),
          empresa:'AUTOPARTES-MATURIN',
          total_categorias:totalProductoPorCategoria.length,
          categorias:totalProductoPorCategoria
        }
        const template = await this.getTemplate('category-report')
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

    async generateZeroExistenceProductsReport(){
      const zeroProducts = await this.productosService.getZeroExistenceProducts()
      const data = {
        empresa:'AUTOPARTES-MATURIN',
        fecha_actual:new Date().toLocaleDateString('es-ES'),
        año:new Date().getFullYear(),
        productos:zeroProducts
      }
      const template = await this.getTemplate('zeroProducts-report')
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

    async generateMostSoldProductsReport(){
      const mostSoldProducts = await this.pedidosService.getSoldProductsReport('DESC')
      const data = {
        empresa:'AUTOPARTES-MATURIN',
        fecha_actual:new Date().toLocaleDateString('es-ES'),
        año:new Date().getFullYear(),
        productos:mostSoldProducts
      }
      const template = await this.getTemplate('mostSoldProducts-report')
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

    async generateLeastSoldProductsReport(){
      const lessSoldProducts = await this.pedidosService.getSoldProductsReport('ASC')
      const data = {
        empresa:'AUTOPARTES-MATURIN',
        fecha_actual:new Date().toLocaleDateString('es-ES'),
        año:new Date().getFullYear(),
        productos:lessSoldProducts
      }
      const template = await this.getTemplate('lessSoldProducts-report')
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
    
}
