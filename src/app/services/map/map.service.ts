import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    map!: google.maps.Map;
    private vehicule$: Subject<any> = new Subject();
    private openDetailsLoc$: Subject<any> = new Subject<any>();
    private openInfoLoc$: Subject<any> = new Subject<any>();
    private hiddenIconLHisto$: Subject<any> = new Subject<any>();
    private hiddenListHisto$ = new BehaviorSubject<any>({hiddenListHisto: true, sizeControl: 1});
    private openInfoLocIds: any[]=[];
    private root: string = `${environment.apiUrl}`;
    private entityId: string = !!localStorage.getItem('entity') ? JSON.parse(localStorage.getItem('entity') as string).entinuid : null;
    private mapDevsFilter: Map<string, google.maps.Marker[]> = new Map();
    private mapDevs: Map<string, google.maps.Marker[]> = new Map();
    private rtOfLineH: Map<string, google.maps.Polyline[]> = new Map(); 
    private rtOfMarkersH: Map<string, google.maps.Marker[]> = new Map(); 
    constructor(
        private http: HttpClient
    ) {}

    drawMap(idElement: string) {
        const element = document.getElementById(idElement) as HTMLElement;
        this.map = new google.maps.Map(element, {
            center: { lat: 11.0041, lng: -74.8070 },
            zoom: 12,
            disableDefaultUI: true,
            gestureHandling: 'greedy',
        });
    }
    
    drawDvsMainLoc(devices: Array<any>) {
        const stringKey = this.entityId.toString();

        // Resetear mapa
        this.clearMapHistory(stringKey);

        // Colocar icono en cada punto de ubicación de su dispositivo
        const markers: google.maps.Marker[] = [];
    
        devices.forEach(element => {
            let marker = new google.maps.Marker();
            const locId = element?.devinuid;
            const location = element?.deviloca && element.deviloca.length > 0 ? element?.deviloca[0]:[];
        
            if (location && locId) {
                location.plate = element?.carrdevi?.carrier?.carrlice ? element?.carrdevi?.carrier?.carrlice: 'Sin placa';
                marker = this.drawIconTag(locId.toString(), 'assets/', 'location-current.png', 375, 469, location, false);
                marker.addListener('click', () => {
                    const markerId = marker.get('id');
                    this.openDetailsLoc$.next(markerId);
                });
                markers.push(marker);
            }
        });

        this.mapDevs.set(stringKey, markers);
    }

    drawDvsFilter(devices: Array<any>) {
        const stringKey = this.entityId.toString();

        // Resetear mapa
        this.clearMapHistory(stringKey);

        // Colocar icono en cada punto de ubicación de su dispositivo
        const markers: google.maps.Marker[] = [];
        
        devices.forEach(element => {
            let marker = new google.maps.Marker();
            const locId = element?.devinuid;
            const location = element?.locations[0];
            
            if (location && locId) {
                marker = this.drawIconTag(locId.toString(), 'assets/', 'location-current.png', 375, 469, location, true);
                marker.addListener('click', () => {
                    const markerId = marker.get('id');
                    this.openDetailsLoc$.next(markerId);
                });
                markers.push(marker);
            }
        });

        this.mapDevsFilter.set(stringKey, markers);
    }

    drawRoute(key: string, filterDataDv: any, points: Array<any>) {
        const stringKey = key.toString();
        const isLocation = filterDataDv?.isLocation;
        const isEvent = filterDataDv?.isEvent;
        const isLocEvent = isLocation && isEvent ? true:false;
        
        // Resetear mapa
        this.clearMapHistory(stringKey);

        if (isLocation || isLocEvent) {
            // Aplicar lineas
            this.drawColorLine(stringKey, points, '#3498DB');
        }
       
        const markers = [];
        
        // Colocar icono en cada punto de ubicación
        for (const [index, point] of points.entries()) {
            let markerLoc = new google.maps.Marker();
            let markerEvent = new google.maps.Marker();

            let locId = point.delonuid;
            const keyTypeName = point.keytypenomb;
            const keywFunc = point.keywfunc;
            const keyIconRoute = point.keyicoroute;
            const keyIconName = point.keyiconame;
            
            const currentPoint = point;
            const prevPoint = points[index + 1];

            if (index == 0) {
                if (keyTypeName === 'position') {
                    point.typeOfTour = 'Ultima ubicación.';
                    markerLoc = this.drawIconTag(locId.toString(), 'assets/', 'location-end.png', 375, 469, point, false);
                }else if (keyTypeName === 'event' || keyTypeName === 'alarm') {
                    point.typeOfTour = keywFunc;
                    markerEvent = this.drawIconTag(locId.toString(), keyIconRoute, keyIconName, 375, 469, point, false);
                }
            } else if (index == points.length - 1) {
                if (keyTypeName === 'position') {
                    point.typeOfTour = 'Primera ubicación.';
                    markerLoc = this.drawIconTag(locId.toString(), 'assets/', 'location-start.png', 375, 469, point, false);
                } else if (keyTypeName === 'event' || keyTypeName === 'alarm') {
                    point.typeOfTour = keywFunc;
                    markerEvent = this.drawIconTag(locId.toString(), keyIconRoute, keyIconName, 375, 469, point, false);
                }
            } else {
                if (keyTypeName === 'position') {
                    // Calcular la dirección de la flecha
                    point.typeOfTour = keywFunc;
                    if (currentPoint && prevPoint && currentPoint.delolong && prevPoint.delolong) {
                        const arrowDirection = Math.atan2(
                            currentPoint.delolong - prevPoint.delolong,
                            currentPoint.delolati - prevPoint.delolati
                        ) * (180 / Math.PI);

                        markerLoc = this.drawSymbolTag(locId.toString(), point, arrowDirection, '#3498DB');
                    }
                }
                
                if (keyTypeName === 'event' || keyTypeName === 'alarm') {
                    point.typeOfTour = keywFunc;
                    markerEvent = this.drawIconTag(locId.toString(), keyIconRoute, keyIconName, 375, 469, point, false);
                }
            }
            
            markerLoc.addListener('click', () => {
                const markerId = markerLoc.get('id');
                this.openInfoWdById(stringKey, markerId);
            });

            markerEvent.addListener('click', () => {
                const markerId = markerEvent.get('id');
                this.openInfoWdById(stringKey, markerId);
            });
              
            markers.push(markerLoc);
            if (keyTypeName === 'event' || keyTypeName === 'alarm') {   
                markers.push(markerEvent);
            }
        }

        this.rtOfMarkersH.set(stringKey, markers);
        this.adjustZoom(2, points);
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

    clearOpenInfoLoc() {
        this.openInfoLocIds = [];
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

    drawIconTag(id: string, nameRoute: string, nameIcon: string, width: number, height: number, position: any, labelBoolean: boolean) {
        const wayPoint = new google.maps.LatLng(Number(position.delolati), Number(position.delolong));
        const desiredWidth = 25;
        const aspectRatio = width / height;
        const desiredHeight = desiredWidth / aspectRatio;
        let labelText = '';
        let markerObject = {};
       
        if (labelBoolean) {
            labelText = position.plate || 'Sin placa';
            markerObject = {
                position: wayPoint,
                map: this.map,
                label: {
                    text: labelText,
                    fontWeight: 'bold',
                    fontSize: '14px',
                },
                icon: {
                    url: `../../${nameRoute}${nameIcon}`,
                    scaledSize: new google.maps.Size(desiredWidth, desiredHeight),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(desiredWidth / 2, desiredHeight),
                    labelOrigin: new google.maps.Point(12, -7)
                },
            };
        } else {
            markerObject = {
                position: wayPoint,
                map: this.map,
                icon: {
                    url: `../../${nameRoute}${nameIcon}`,
                    scaledSize: new google.maps.Size(desiredWidth, desiredHeight),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(desiredWidth / 2, desiredHeight),
                    labelOrigin: new google.maps.Point(12, -7)
                },
            };
        }

        const marker = new google.maps.Marker(markerObject);
        marker.set('id', id);
        marker.set('point', position);
        return marker;
    }

    drawSymbolTag(id: string, position: any, arrowDirection: number, color: string) {
        const wayPoint = new google.maps.LatLng(Number(position.delolati), Number(position.delolong));
        const marker = new google.maps.Marker({
            position: wayPoint,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,  // Aplicar icono img
                fillColor: color,
                fillOpacity: 1.0,
                strokeWeight: 0,
                scale: 4,  // Tamaño del icono
                rotation: arrowDirection
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

    adjustZoom(zoomFactor: number, points: any) {
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

        const mapDevsToDelete = this.mapDevs.get(stringKey);
        if (mapDevsToDelete) {
            for (const marker of mapDevsToDelete) {
                marker.setMap(null); // Eliminar el marcador del mapa
            }
            this.mapDevs.delete(stringKey); // Eliminar tags
        }

        const mapDevsFtDelete = this.mapDevsFilter.get(stringKey);
        if (mapDevsFtDelete) {
            for (const marker of mapDevsFtDelete) {
                marker.setMap(null); // Eliminar el marcador del mapa
            }
            this.mapDevsFilter.delete(stringKey); // Eliminar tags
        }

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

    getLocationDevices(userSelectedId: any) {
        return this.http.get(`${this.root}/device/entity/${this.entityId}/${userSelectedId}/null`);
    }

    getVehiculeObs() {
        return this.vehicule$.asObservable();
    }

    getDeviceObs() {
        return this.openDetailsLoc$.asObservable();
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

    hiddenIconLHisto(status: boolean) {
        this.hiddenIconLHisto$.next(status);
    }

    gethiddenIconLHisto() {
        return this.hiddenIconLHisto$.asObservable();
    }
    
    hiddenListHisto(status: {hiddenListHisto: boolean, sizeControl: number}) {
        this.hiddenListHisto$.next(status);
    }

    getHiddenListHisto() {
        return this.hiddenListHisto$.asObservable();
    }
}