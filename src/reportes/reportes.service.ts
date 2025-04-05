import { Injectable } from '@nestjs/common';



@Injectable()
export class ReportesService {

    constructor(){}


    async generateDailyReport(){

    }

    async generateMonthlyReport(){}

    async generateYearlyReport(){}

    async generateCategoryReport(){}

    async generateProductHistoryReport(){}

    async generateMostSoldProductsReport(){}

    async generateLeastSoldProductsReport(){}

    async generateZeroExistenceProductsReport(){}
}
