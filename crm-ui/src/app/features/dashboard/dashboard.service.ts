import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats } from '../../shared/models';
import { LeadsService } from '../leads/leads.service';
import { DealsService } from '../deals/deals.service';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    constructor(
        private http: HttpClient,
        private leadsService: LeadsService,
        private dealsService: DealsService
    ) { }

    getDashboardStats(): Observable<DashboardStats> {
        return forkJoin({
            leads: this.leadsService.getLeads({ page: 0, size: 1 }),
            deals: this.dealsService.getDeals({ page: 0, size: 1000 })
        }).pipe(
            map(({ leads, deals }) => {
                const openDeals = deals.content.filter(d => d.stage === 'OPEN').length;
                const wonDeals = deals.content.filter(d => d.stage === 'WON').length;
                const totalRevenue = deals.content
                    .filter(d => d.stage === 'WON')
                    .reduce((sum, d) => sum + d.amount, 0);

                return {
                    totalLeads: leads.totalElements,
                    openDeals,
                    wonDeals,
                    totalRevenue
                };
            })
        );
    }
}
