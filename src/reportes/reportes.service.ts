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


private async _generatePdf(htmlContent: string): Promise<Buffer> {
    let browser: any;
    try {
        const launchOptions: any = {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const buffer = await page.pdf({
            printBackground: true,
            format: 'A4'
        });
        return buffer;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

    async getTotalValues(dateParameters:DateParameters){
      
      const [ventasTotales,tasabcv] = await this.pedidosService.getTotalValuesSales(dateParameters)
      console.log(ventasTotales)
      const subTotales = {
        total_monto_dolares:0,
        total_monto_bs:0,
        total_pagomovil_bs:0,
        total_transferencia_bs:0,
        total_zelle_dolares:0,
        total_efectivo_bs:0,
        total_efectivo_dolares:0,
      }
      ventasTotales.map((venta)=>{
        subTotales.total_monto_dolares += venta.MONTO
        subTotales.total_monto_bs += venta.MONTOBS
        subTotales.total_pagomovil_bs += venta.PAGOMOVIL
        subTotales.total_transferencia_bs += venta.TRANSFERENCIA
        subTotales.total_zelle_dolares += venta.ZELLE
        subTotales.total_efectivo_dolares += venta.EFECTIVO
        subTotales.total_efectivo_bs += venta.EFECTIVOBS
      })
      //SOLO FALTA CALCULAR EL SUBTOTAL, tiene que haber una fila que sume todos los pagomovil, zelle, transferencia, efectivo y monto.
      const data = {
          año:new Date().getFullYear(),
          periodoInicial:new Date(dateParameters.fromYear,dateParameters.fromMonth,dateParameters.fromDay).toLocaleDateString('es-ES'),
          periodoFinal:new Date(dateParameters.untilYear,dateParameters.untilMonth,dateParameters.untilDay).toLocaleDateString('es-ES'),
          empresa:'AUTOPARTES-MATURIN',
          ventasTotales:ventasTotales,
          subtotales:subTotales,
          tasabcv:tasabcv
      }
      //Englobar las ventas en tienda y ventas online
      //filtar por vendedor
      return data
    }

    async generateSalesReport(dateParameters:DateParameters){
        const data = await this.getTotalValues(dateParameters) 
        const template = await this.getTemplate('daily-report')
        const html = template(data)
        return this._generatePdf(html)
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
        return this._generatePdf(html)
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
      return this._generatePdf(html)
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
      return this._generatePdf(html)
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
      return this._generatePdf(html)
    }
    
}
