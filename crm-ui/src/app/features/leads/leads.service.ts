import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lead, LeadRequest, PageResponse, PageRequest } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class LeadsService {
    private apiUrl = `${environment.apiUrl}/leads`;

    constructor(private http: HttpClient) { }

    getLeads(pageRequest: PageRequest): Observable<PageResponse<Lead>> {
        let params = new HttpParams()
            .set('page', pageRequest.page.toString())
            .set('size', pageRequest.size.toString());

        if (pageRequest.sort) {
            params = params.set('sort', pageRequest.sort);
        }

        return this.http.get<PageResponse<Lead>>(this.apiUrl, { params });
    }

    getLead(id: string): Observable<Lead> {
        return this.http.get<Lead>(`${this.apiUrl}/${id}`);
    }

    createLead(lead: LeadRequest): Observable<Lead> {
        return this.http.post<Lead>(this.apiUrl, lead);
    }

    updateLead(id: string, lead: LeadRequest): Observable<Lead> {
        return this.http.put<Lead>(`${this.apiUrl}/${id}`, lead);
    }

    deleteLead(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    assignLead(id: string, userId: string): Observable<Lead> {
        return this.http.post<Lead>(`${this.apiUrl}/${id}/assign`, { userId });
    }

    convertLead(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/convert`, {});
    }
}
