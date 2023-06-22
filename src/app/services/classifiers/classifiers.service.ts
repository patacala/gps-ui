import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ClassifierService {
    private root: string = `${environment.apiUrl}/classifier`;
    private classifier$: BehaviorSubject<any> = new BehaviorSubject([]);
    private childs$: BehaviorSubject<any> = new BehaviorSubject([]);
    private entityId: string = !!localStorage.getItem('entity') ? JSON.parse(localStorage.getItem('entity') as string).entinuid : null;

    constructor(private http: HttpClient) { }

    getClassifier() {
        this.http.get(`${this.root}/entity/${this.entityId}`).pipe(map(({ response }: any) => response)).subscribe(value => {
            this.classifier$.next({ count: value.length, rows: [...value] })
        });

        return this.classifier$.asObservable();
    }

    getChilds(id: string) {
        this.http.get(`${this.root}/${id}/getChildClassifiers`).pipe(
            map(({ response }: any) => response),
            map(value => value.map((option: any) => {
                return {
                    ...option,
                    underBy: value.find((x: any) => option.clvaunde == x.clvanuid)?.clvadesc || 0
                }
            }))
        ).subscribe(value => {
            value.length > 0 && this.childs$.next({ count: value.length, rows: [...value] })
        });

        return this.childs$.asObservable();
    }

    createClassifier(classifier: string) {
        return this.http.post(`${this.root}/entity/${this.entityId}`, { name: classifier }).pipe(
            tap((val: any) => this.addItem(val.response, 'principal'))
        )
    }

    createChild(child: any) {
        return this.http.post(`${this.root}/createChild`, { ...child });
    }

    updateClassifier(id: string, classifier: any) {
        return this.http.patch(`${this.root}/${id}`, { ...classifier }).pipe(
            tap((val: any) => this.updatedItem(val.response, 'principal'))
        )
    }

    updateChild(id: string, classifier: any) {
        return this.http.patch(`${this.root}/updateChild/${id}`, { ...classifier }).pipe(
            tap((val: any) => this.updatedItem(val.response, 'child'))
        )
    }

    filterByClassifier(classifiers: {}) {
        return this.http.post(`${environment.apiUrl}/location/getDevicePositions/${this.entityId}`, classifiers)
    }

    private updatedItem(value: any, which: 'principal' | 'child') {
        let obs = which == 'principal' ? this.classifier$ : this.childs$
        let list = obs.value;

        let item = which == 'principal' ? list.rows.findIndex(({ clasnuid }: any) => clasnuid == value.clasnuid) : list.rows.findIndex(({ clvanuid }: any) => clvanuid == value.clvanuid)

        list.rows[item] = value;

        obs.next({ ...list });
    }
    private addItem(value: any, which: 'principal' | 'child') {
        let obs = which == 'principal' ? this.classifier$ : this.childs$
        let list = obs.value;

        let newList = { ...list, rows: [value, ...list.rows] }

        obs.next(newList);
    }
    private deleteItem(id: string, which: 'principal' | 'child') {
        let obs = which == 'principal' ? this.classifier$ : this.childs$
        let list = obs.value;

        let newList = list.rows.filter(({ clasnuid, clvanuid }: any) => (clasnuid == id) || (clvanuid == id));

        obs.next({ ...list, rows: newList });
    }
}