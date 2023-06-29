import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    map!: google.maps.Map;
    private vehicule$: Subject<any> = new Subject();
    private root: string = `${environment.apiUrl}`;
    private entityId: string = !!localStorage.getItem('entity') ? JSON.parse(localStorage.getItem('entity') as string).entinuid : null;
    private mapDevices: Map<string, google.maps.Marker> = new Map();
    private routeOfMarkers: Map<string, google.maps.Marker[]> = new Map();
    private rtOfLineH: Map<string, google.maps.Polyline[]> = new Map(); 
    private rtOfMarkersH: Map<string, google.maps.Marker[]> = new Map(); 
    constructor(private http: HttpClient) {}

    drawMap(idElement: string) {
        const element = document.getElementById(idElement) as HTMLElement;
        this.map = new google.maps.Map(element, {
            center: { lat: 11.0041, lng: -74.8070 },
            zoom: 5,
            disableDefaultUI: true,
            gestureHandling: 'greedy',
        });
    }

    drawMarker({ lat, lng, id }: { lat: number, lng: number, id: string }): void {
        let referenceSubj = this.vehicule$;

        if (this.mapDevices.has(id)) return this.mapDevices.get(id)?.setPosition(new google.maps.LatLng(lat, lng));

        let marker = new google.maps.Marker({
            map: this.map,
            position: new google.maps.LatLng(lat, lng),
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(20, 40)
            },
            title: id
        })

        marker.addListener('click', function (e) {
            console.log('HOLAAA? ')
            referenceSubj.next(this.getTitle());
        })

        this.mapDevices.set(id, marker);
        this.centerMapOnMarkers();
    }

    resetMapToInitial() {
        for(let key of this.routeOfMarkers.keys()){
            // @ts-ignore
            if(!this.routeOfMarkers.get(key)?.at(0).getMap()) continue;
            this.routeOfMarkers.get(key)?.map(m => m.setMap(null))
        }

        this.mapDevices.forEach(m => {
            m.setMap(this.map)
        })
    }

    drawALotOfMarkers(positions: Array<any>, id: string) {
        let markers: any[] = [];

        positions.map(p => {
            let marker = new google.maps.Marker({
                map: this.map,
                position: p
            })
            markers.push(marker)
        })

        this.routeOfMarkers.set(id, markers)
        this.centerMapOnMarkers();
    }

    filterMarkers(devices: any[]) {
        this.mapDevices.forEach(m => {
            m.setMap(null)
        });

        devices.map(device => {
            this.mapDevices.get(device.devinuid.toString())?.setMap(this.map)
        })
    }

    drawRoute(key: string, points: Array<any>) {
        const stringKey = key.toString();
        let waypoints = [];
        for (let position of points) {
            let wayp = new google.maps.LatLng(Number(position.delolati), Number(position.delolong));
            waypoints.push(wayp);
        }
        
        // Trazar lineas entre localizaciones
        const polyline = new google.maps.Polyline({
            path: waypoints,
            geodesic: true,
            strokeColor: '#3498DB',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        polyline.setMap(this.map);
        this.rtOfLineH.set(stringKey, [polyline]);

        const markers = [];
        // Colocar icono en cada punto de ubicación
        for (const [index, waypoint] of waypoints.entries()) {
            const marker = new google.maps.Marker({
                position: waypoint,
                map: this.map,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new google.maps.Size(40, 40),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(20, 40)
                },
            });

            const pointRow = `
                <b>Lat:</b> ${points[index].delolati}, <b>Long:</b> ${points[index].delolong}<br> 
                <b>Vel:</b> ${points[index].delospee} KM/H,<br>
                <b>F.GPS:</b> ${points[index].delotime},<br>
                <b>F.SIST:</b> ${points[index].delofesi}
            `;
            const infoWindow = new google.maps.InfoWindow({
                content: pointRow
            });
        
            marker.addListener('mouseover', () => {
                infoWindow.open(this.map, marker);
            });
        
            marker.addListener('mouseout', () => {
                infoWindow.close();
            });

            markers.push(marker);
            this.rtOfMarkersH.set(stringKey, markers);

            // Crear un límite para ajustar el zoom
            const bounds = new google.maps.LatLngBounds();
            for (const waypoint of waypoints) {
                bounds.extend(waypoint);
            }

            // Ajustar el zoom para mostrar la ruta y los marcadores
            this.map.fitBounds(bounds);

            // Aplicar factor de ampliación al límite
            const zoomFactor = 2; // Factor de ampliación
            const extendedBounds = this.applyZoomFactorToBounds(bounds, zoomFactor);

            // Ajustar el zoom para mostrar la ruta y los marcadores
            this.map.fitBounds(extendedBounds);
        }
    }

    applyZoomFactorToBounds(bounds: google.maps.LatLngBounds, factor: number): google.maps.LatLngBounds {
        const center = bounds.getCenter();
        const newBounds = new google.maps.LatLngBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const dx = ne.lng() - center.lng();
        const dy = ne.lat() - center.lat();
        const newNe = new google.maps.LatLng(center.lat() + dy * factor, center.lng() + dx * factor);
        const newSw = new google.maps.LatLng(center.lat() - dy * factor, center.lng() - dx * factor);
        newBounds.extend(newNe);
        newBounds.extend(newSw);
        return newBounds;
    }

    resetMap(key: string) {
        const stringKey = key.toString();

        const polylineToDelete = this.rtOfLineH.get(stringKey);
        if (polylineToDelete) {
            for (const polyline of polylineToDelete) {
                polyline.setMap(null); // Eliminar la polyline del mapa
            }
            this.rtOfLineH.delete(stringKey); // Eliminar la polyline del Map
        }

        const markersToDelete = this.rtOfMarkersH.get(stringKey);
        if (markersToDelete) {
            for (const marker of markersToDelete) {
                marker.setMap(null); // Eliminar el marcador del mapa
            }
            this.rtOfMarkersH.delete(stringKey); // Eliminar el marcador del Map
        }
    }

    centerMapOnMarkers() {
        let bounds = new google.maps.LatLngBounds();
        this.mapDevices.forEach(marker => {
            bounds.extend(marker.getPosition() as google.maps.LatLng);
        })
        this.map.fitBounds(bounds);
    }

    getLocationDevices() {
        return this.http.get(`${this.root}/device/entity/${this.entityId}`);
    }

    getVehiculeObs() {
        return this.vehicule$.asObservable();
    }

    getLocationWithGap(positions: any, device: any) {
        if(!positions.length) return; // Pasar esta logica al pipe del obs

        this.filterMarkers([device]);

        let coordinates: google.maps.LatLng[] = [];

        positions.reduce((prevPosition: any, newPosition: any, currentIndex: number) => {
            let x = this.getDistanceFromLatLonInKm({ prev: positions[currentIndex - 1], new: newPosition });
            if (x > 0.8) {
                coordinates.push(new google.maps.LatLng(parseFloat(newPosition.delolati), parseFloat(newPosition.delolong)));
            }
        });

        this.drawALotOfMarkers(coordinates, device.devinuid.toString())
    }

    getDistanceFromLatLonInKm(positions: any) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(positions.new.delolati - positions.prev.delolati);  // deg2rad below
        var dLon = this.deg2rad(positions.new.delolong - positions.prev.delolong);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(dLat) * Math.cos(dLon) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    deg2rad(deg: any) {
        return deg * (Math.PI / 180)
    }
}