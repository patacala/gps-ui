import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, take, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    map!: google.maps.Map;
    private vehicule$: Subject<any> = new Subject();
    private openInfoLoc$: Subject<any> = new Subject<any>();
    private openInfoLocIds: any[]=[];
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

        // Verificar si ya existe un marcador para el mismo id
        if (this.mapDevices.has(id)) {
            const existingMarker = this.mapDevices.get(id);
            // Verificar si el marcador actual tiene la misma posición
            if (existingMarker && existingMarker.getPosition()?.lat() === lat && existingMarker.getPosition()?.lng() === lng) {
            // El mismo elemento ya ha sido seleccionado, no se realiza ninguna acción adicional
            return;
            }
            // Actualizar la posición del marcador existente
            existingMarker?.setPosition(new google.maps.LatLng(lat, lng));
            return;
        }

        let marker = new google.maps.Marker({
            map: this.map,
            position: new google.maps.LatLng(lat, lng),
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(20, 40)
            }
        })

        marker.set('id', id);
        marker.addListener('click', () => {
            const markerId = marker.get('id');
            referenceSubj.next(markerId);
        });

        this.mapDevices.set(id, marker);
        this.centerMapOnMarkers();
    }

    resetMapToInitial() {
        for(let key of this.routeOfMarkers.keys()){
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

        // Resetear mapa
        this.clearMapHistory(stringKey);

        // Aplicar lineas
        this.drawColorLine(stringKey, points, '#3498DB');

        const markers = [];
        
        // Colocar icono en cada punto de ubicación
        for (const [index, point] of points.entries()) {
            let marker = new google.maps.Marker();
            const locId = point.delonuid;

            if (index == 0) {
                point.typeOfTour = 'Ultima ubicación.';
                marker = this.drawColorTag(locId.toString(), point, 'yellow');
            } else if (index == points.length - 1) {
                point.typeOfTour = 'Primera ubicación.';
                marker = this.drawColorTag(locId.toString(), point, 'red');
            } else {
                point.typeOfTour = 'Ubicación';
                marker = this.drawSymbolTag(locId.toString(), point, '#3498DB');
            }
            
            marker.addListener('click', () => {
                const markerId = marker.get('id');
                this.openInfoWdById(stringKey, markerId);
            });
              
            markers.push(marker);
            this.rtOfMarkersH.set(stringKey, markers);
        }

        this.adjustZoom(points);
    }

    openInfoWdById(stringKey: string, id: string) {
        stringKey = stringKey.toString();
        id = id.toString();
        const markers = this.rtOfMarkersH.get(stringKey);
      
        if (markers) {
          const marker = markers.find((marker) => marker.get('id') === id);
        
          if (marker) {
            const point = marker.get('point');
            const pointRow = `
              <h3>${point.typeOfTour}</h3>
              <b>Lat:</b> ${point.delolati}, <b>Long:</b> ${point.delolong}<br> 
              <b>Vel:</b> ${point.delospee} KM/H,<br>
              <b>F.GPS:</b> ${point.delotime},<br>
              <b>F.SIST:</b> ${point.delofesi}
            `;
            const infoWindow = new google.maps.InfoWindow({
              content: pointRow,
            });

            infoWindow.addListener('closeclick', () => {
                this.rmOpenInfoId(id);
            });

            const opInfoIndex = this.openInfoLocIds.findIndex(opInfLoc => opInfLoc === id);
            if (opInfoIndex === -1) {
                this.openInfoLocIds.push(id);
                this.openInfoLoc$.next(this.openInfoLocIds);
                infoWindow.open(this.map, marker);
            }
          }
        }
    }

    rmOpenInfoId(id: string) {
        const opInfoIndex = this.openInfoLocIds.findIndex(openInfId => openInfId === id.toString());
        this.openInfoLocIds.splice(opInfoIndex);
        this.openInfoLoc$.next(this.openInfoLocIds);
    }
      
    getOpenInfoLocIds() {
        return this.openInfoLoc$.asObservable();
    }

    drawColorTag(id: string, position: any, color: string) {
        const wayPoint = new google.maps.LatLng(Number(position.delolati), Number(position.delolong));

        const marker = new google.maps.Marker({
            position: wayPoint,
            map: this.map,
            icon: {
                url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
                scaledSize: new google.maps.Size(40, 40),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(20, 40)
            },
        });

        marker.set('id', id);
        marker.set('point', position);
        return marker;
    }

    drawSymbolTag(id: string, position: any, color: string) {
        const wayPoint = new google.maps.LatLng(Number(position.delolati), Number(position.delolong));
        const marker = new google.maps.Marker({
            position: wayPoint,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,  // Aplicar icono
                fillColor: color,
                fillOpacity: 1.0,
                strokeWeight: 0,
                scale: 6  // Tamaño del icono
            }
        });

        marker.set('id', id);
        marker.set('point', position);
        return marker;
    }

    drawColorLine(key: string, points: Array<any>, color: string) {
        const stringKey = key.toString();
        const waypoints = [];

        for (let position of points) {
            let wayp = new google.maps.LatLng(Number(position.delolati), Number(position.delolong));
            waypoints.push(wayp);
        }
        
        // Trazar lineas entre localizaciones
        const polyline = new google.maps.Polyline({
            path: waypoints,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        polyline.setMap(this.map);
        this.rtOfLineH.set(stringKey, [polyline]);
    }

    adjustZoom(points: Array<any>) {
        let waypoints = [];
        for (let position of points) {
            let wayp = new google.maps.LatLng(Number(position.delolati), Number(position.delolong));
            waypoints.push(wayp);
        }

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

    clearMapHistory(key: string) {
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