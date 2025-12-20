import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Deal, DealRequest, PageResponse, PageRequest } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class DealsService {
    private apiUrl = `${environment.apiUrl}/deals`;

    constructor(private http: HttpClient) { }

    getDeals(pageRequest: PageRequest): Observable<PageResponse<Deal>> {
        let params = new HttpParams()
            .set('page', pageRequest.page.toString())
            .set('size', pageRequest.size.toString());

        if (pageRequest.sort) {
            params = params.set('sort', pageRequest.sort);
        }

        return this.http.get<PageResponse<Deal>>(this.apiUrl, { params });
    }

    getDeal(id: string): Observable<Deal> {
        return this.http.get<Deal>(`${this.apiUrl}/${id}`);
    }

    createDeal(deal: DealRequest): Observable<Deal> {
        return this.http.post<Deal>(this.apiUrl, deal);
    }

    updateDeal(id: string, deal: DealRequest): Observable<Deal> {
        return this.http.put<Deal>(`${this.apiUrl}/${id}`, deal);
    }

    deleteDeal(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
