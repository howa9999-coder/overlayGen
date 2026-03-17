/* import { initDB, addData, getAllData, updateData, deleteData, getElement} from "./db.js";
 */
/**************************************************** 
* 4. MAP INITIALIZATION 
****************************************************/ 
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3
});

// 3. Handle Image Upload & Map Calibration
DOM.imageInput.onchange = function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Clear existing image if any
            if (state.imageLayer) map.removeLayer(state.imageLayer);
            const w = this.width;
            const h = this.height;
            console.log(w)
            console.log(h)
            /*ORIGIN ={
                            x: w,
                            y: h
                        } */
            const bounds = [[0, 0], [h, w]];
            state.imageUrl = event.target.result
            state.imageLayer = L.imageOverlay(state.imageUrl, bounds).addTo(map);
           // console.log(state.imageUrl)
            map.fitBounds(bounds);
            map.setMaxBounds(bounds);
            map.on('click', e => {
                displayCoordinates(e)
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);

};
//=======================Coordinates================>
function displayCoordinates(e){
    const x = e.latlng.lat
    const y = e.latlng.lng
    DOM.coords.innerHTML =
        `image X: ${x.toFixed(0)}<span>--</span>image Y: ${y.toFixed(0)}`;
}

/**************************************************** 
* 5. DRAWING CONTROLS (GEOMAN) 
****************************************************/
function configureDrawingTools() { 
    map.pm.removeControls(); // Reset first 
    const baseControls = { 
        position: 'topleft', 
        drawCircleMarker: false, 
        drawRectangle: false, 
        drawCircle: false, 
        editMode: true, 
        dragMode: true, 
        cutPolygon: true, 
        removalMode: true, 
        rotateMode: true 
    }; 
    if (state.overlayType === "point") { 
        baseControls.drawMarker = true; 
    } else if (state.overlayType === "polyline") { 
        baseControls.drawPolyline = true; 
    } else { 
        baseControls.drawPolygon = true; 
    } 
    map.pm.addControls(baseControls); 
} 
function startBtn(){
    map.pm.removeControls(); // Reset first 
    const baseControls = { 
        position: 'topleft', 
        drawCircleMarker: false, 
        drawRectangle: false, 
        drawCircle: false, 
        editMode: true, 
        dragMode: true, 
        cutPolygon: true, 
        removalMode: true, 
        rotateMode: true,
        drawMarker: false, 
        drawPolyline: false,
        drawPolygon: false        
    }; 
    if (state.overlayType === "point") { 
        baseControls.drawMarker = true; 
        if(state.customIcon.iconUrl){
            console.log('state.customIcon.iconUrl', state.customIcon.iconUrl)
            map.pm.setGlobalOptions({
                markerStyle: {
                icon: L.icon(state.customIcon)
                }
            });  
        } 
    } else if (state.overlayType === "polyline") { 
        baseControls.drawPolyline = true; 
    } else { 
        baseControls.drawPolygon = true; 
    } 
    if(state.customStyle.color){
            map.pm.setGlobalOptions({
                pathOptions: state.customStyle,
            })
    }
    map.pm.addControls(baseControls);

    displayClearBtn()
}

/* const IDB = (function init(){
    let db = null
    let objectStore = null
    let DBOpenReq = indexedDB.open('overlayGenDB', 1)
    DBOpenReq.addEventListener('error', (ev)=>{
        console.warn(ev)
    })
    DBOpenReq.addEventListener('success', (ev)=>{
        db = ev.target.result
        console.log('success',db)
       // buildList()
    })
    DBOpenReq.addEventListener('upgradeneeded', (ev)=>{
        db = ev.target.result
        let oldVersion = ev.oldVersion
        let newVersion = ev.newVersion || db.version
        console.log('DB updated from version ', oldVersion, ' to ', newVersion)
        console.log('upgradeneeded',db)
        if(!db.objectStoreNames.contains('layersTable')){
            objectStore = db.createObjectStore('layersTable',{
                keyPath: 'id'
            })
        }
        if(!db.objectStoreNames.contains('inputsValuesTable')){
            objectStore = db.createObjectStore('inputsValuesTabl',{
                keyPath: 'id'
            })
        }

    })
    //ADD DATA
        DOM.imageInput.addEventListener('change', (ev)=>{
        ev.preventDefault()
        let imageObject = {
            id: 1,
            imageUrl: state.imageUrl 
        }

        // ADD DATA TO INDEXEDDB
        let tx = makeTX('inputsValuesTabl', 'readwrite')
        tx.oncomplete = (e)=>{
            console.log(e)
        }

        let store = tx.objectStore('inputsValuesTabl')
        let request = store.add(imageObject)
        request.onsuccess = (e)=>{
            console.log('successed')
        }
        request.onerror = (err)=>{
            console.log('error')
        }
        function makeTX(storeName, model){
            let tx = db.transaction(storeName, model)
            tx.onerror = (err)=>{
                console.warn(err)
            }
            return tx
        }
    })
})()
 */

map.on('pm:create', (e) => {
    const layer = e.layer;
    // Initialize custom properties
    layer.options.customData = {
        id: L.stamp(layer)
    };

    layer.on('click', () => openEditor(layer));
    openEditor(layer);
});