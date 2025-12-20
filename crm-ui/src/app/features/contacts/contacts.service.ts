import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contact, ContactRequest, PageResponse, PageRequest } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class ContactsService {
    private apiUrl = `${environment.apiUrl}/contacts`;

    constructor(private http: HttpClient) { }

    getContacts(pageRequest: PageRequest): Observable<PageResponse<Contact>> {
        let params = new HttpParams()
            .set('page', pageRequest.page.toString())
            .set('size', pageRequest.size.toString());

        if (pageRequest.sort) {
            params = params.set('sort', pageRequest.sort);
        }

        return this.http.get<PageResponse<Contact>>(this.apiUrl, { params });
    }

    getContact(id: string): Observable<Contact> {
        return this.http.get<Contact>(`${this.apiUrl}/${id}`);
    }

    createContact(contact: ContactRequest): Observable<Contact> {
        return this.http.post<Contact>(this.apiUrl, contact);
    }

    updateContact(id: string, contact: ContactRequest): Observable<Contact> {
        return this.http.put<Contact>(`${this.apiUrl}/${id}`, contact);
    }

    deleteContact(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
