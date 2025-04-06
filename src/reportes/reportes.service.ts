import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import puppeteer from 'puppeteer';


@Injectable()
export class ReportesService {

    constructor(){}

    async getTemplate(name:string){
        const templateHtml = fs.readFileSync(path.join(process.cwd(),'src','reportes','reportes-templates',`${name}.html`),'utf-8')
        const template = handlebars.compile(templateHtml)
        return template
    }

    async generateDailyReport(){
        const data = {
            titulo:'REPORTE DE VENTAS',
            empresa:'AUTOPARTES-MATURIN'
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
