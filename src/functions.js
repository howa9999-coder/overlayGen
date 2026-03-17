
/**************************************************** 
* 6. FEATURE EDITOR 
****************************************************/ 
/* map.on('pm:create', (e) => {
    const layer = e.layer;
    // Initialize custom properties
    layer.options.customData = {
        id: L.stamp(layer)
    };

    layer.on('click', () => openEditor(layer));
    openEditor(layer);
}); */
//WHY THIS FUNCTION IS NOT WORKING CORRECTLY?
function createInputField(labelText, id, value = "") { 
    const div = document.createElement('div'); 
    const label = document.createElement('label'); 
    const input = document.createElement('input'); 
    label.textContent = labelText; 
    input.id = id; 
    input.value = value; 
    input.required = true; 
    div.appendChild(label); 
    div.appendChild(input); 
    return div
} 
//=============================================================> openEditor function
function openEditor(layer){
    DOM.featureForm.classList.remove('hidden');
    document.getElementById('empty-msg').classList.add('hidden');
    DOM.featureDiv.innerHTML = ""
    if(state.overlayPropertiesArray){
        state.currentLayer = layer
        const data = layer.options.customData
        const layerID = data.id
        customDataSize = Object.keys(data).length
        document.getElementById('prop-id').value = layerID;
        if(customDataSize<=1){
            //input should be required
            for (let i=0; i<state.overlayPropertiesArray.length; i++){
                const div = document.createElement('div')
                const label = document.createElement('label')
                const input = document.createElement('input')
                input.required = true;
                label.innerHTML = state.overlayPropertiesArray[i]
                input.id= `${state.overlayPropertiesArray[i]}-${layerID}`
                div.appendChild(label)
                div.appendChild(input)
                DOM.featureDiv.appendChild(div)
            } 
        }else{
            Object.entries(data).forEach(dataArray=>{
                const key = dataArray[0]
                const value = dataArray[1]
                if(key!='id'){
                    const div = document.createElement('div')
                    const label = document.createElement('label')
                    const input = document.createElement('input')
                    input.required = true;
                    label.innerHTML = key
                    input.id= `${key}-${layerID}`
                    input.value = value
                    div.appendChild(label)
                    div.appendChild(input)
                    DOM.featureDiv.appendChild(div)
                }
            })
        }
    }
}

DOM.featureForm.addEventListener("submit", (e)=>{
    e.preventDefault(); // prevent reload
    if (!state.currentLayer) return;
    const customData = state.currentLayer.options.customData
    const currentLayerID = customData.id
                //console.log(customData)

    if(state.overlayPropertiesArray[0]!=""){
        for (let i=0; i<state.overlayPropertiesArray.length; i++){
            //console.log(state.overlayPropertiesArray[i]) 
          customData[state.overlayPropertiesArray[i]] = document.querySelector(`#${state.overlayPropertiesArray[i]}-${currentLayerID}`).value
        } 
    }
    alert('Properties updated for this shape!');
})
/**************************************************** 
* 7. EXPORT FUNCTIONS 
****************************************************/ 
function downloadOverlay() {
    const layers = map.pm.getGeomanLayers();

        if(layers.length <= 1){
            alert("There is no layer to download!")
            return
        }
        const collection = {
                type: "FeatureCollection",
                name: state.overlayName,
                baseLayer: state.baseLayerName,
                overlayType: state.overlayType
        }
        if(state.overlayType == 'point'){
            collection.iconPath = state.iconPath
        }else{
            collection.color = state.customStyle.color
            collection.opacity = state.customStyle.opacity
            collection.weight = state.customStyle.weight
        }
        collection.features = []
        map.eachLayer((layer) => {
            // Only export layers created by Geoman (that have our customData)
            if (layer.options.customData) {
                const geojson = layer.toGeoJSON();
                // Merge our custom properties into the GeoJSON properties
                geojson.properties = { ...layer.options.customData };
                collection.features.push(geojson);
            }
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(collection, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${state.overlayName}_layer.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

}
/**************************************************** 
* 8. IMPORT FUNCTIONS 
****************************************************/ 

//let importedGeoJSON = null;
 
function importLayerFunc(event) {

    const file = event.target.files[0];

    // check if file exists
    if (file == null) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const geojsonData = JSON.parse(e.target.result);
            state.overlayName = geojsonData.name
            state.baseLayerName = geojsonData.baseLayer
            state.overlayType = geojsonData.overlayType
            if(state.overlayType == 'point'){
                state.iconPath = geojsonData.iconPath
            }else{
                state.customStyle.color = geojsonData.color
                state.customStyle.opacity = geojsonData.opacity
                state.customStyle.weight = geojsonData.weight
                customStyle = {
                    color: state.customStyle.color,
                    fillColor: state.customStyle.color,
                    weight: state.customStyle.weight,
                    opacity: state.customStyle.opacity,
                    fillOpacity: state.customStyle.opacity
                }
            }
            const bounds = [];

            L.geoJSON(geojsonData, {
                // For Lines & Polygons
                style: function (feature) {

                    if (feature.geometry.type === "LineString" || 
                        feature.geometry.type === "MultiLineString") {

                        return {
                            color: state.customStyle.color,
                            weight: state.customStyle.weight,
                            opacity: state.customStyle.opacity
                        };
                    }

                    if (feature.geometry.type === "Polygon" || 
                        feature.geometry.type === "MultiPolygon") {

                        return {
                            color: state.customStyle.color,
                            weight: state.customStyle.weight,
                            fillColor: state.customStyle.color,
                            fillOpacity: state.customStyle.opacity
                        };
                    }
                },

                // For Points
                pointToLayer: function (feature, latlng) {
                        const icon = L.icon(state.customIcon);
                        return L.marker(latlng, { icon: icon });
                },

                onEachFeature: function (feature, layer) {
                    state.currentLayer = layer

                    // add layer to map
                    layer.addTo(map);

                    // store bounds
                    if (layer.getBounds) {

                        bounds.push(layer.getBounds());

                    } else {

                        bounds.push(layer.getLatLng());

                    }

                    // create customData object
                    layer.options.customData = {};

                    layer.options.customData.id = L.stamp(layer);

                    // copy properties manually
                    if (feature.properties) {

                        for (let key in feature.properties) {

                            layer.options.customData[key] = feature.properties[key];
                            if (!state.overlayPropertiesArray.includes(key) && key != 'id') {
                                state.overlayPropertiesArray.push(key);
                            }
                        }
                    }


                    // click event
                    layer.on('click', function () {

                        openEditor(layer);
                        state.currentLayer = layer

                    });
                }

            });


            // zoom to features
            if (bounds.length > 0) {

                const group = L.featureGroup();

                for (let i = 0; i < bounds.length; i++) {

                    if (bounds[i] instanceof L.LatLngBounds) {

                        const rect = L.rectangle(bounds[i]);
                        group.addLayer(rect);

                    }

                    else {

                        const rect = L.rectangle(L.latLngBounds(bounds[i], bounds[i]));
                        group.addLayer(rect);

                    }

                }

                map.fitBounds(group.getBounds());

            }
        displayDownloadBtn(); 
        startBtn()

        }

        catch (error) {

            console.error(error);

            alert("Invalid GeoJSON file");

        }

    };

    reader.readAsText(file);
    event.target.value = "";
}
/**************************************************** 
* 9. CLEAR / RESET 
****************************************************/

function clearMap() {
    Object.assign(state, { 
            overlayName: null,
            overlayPropertiesArra:[],
            overlayType: "point",
            creatingMultiPointLayer: true,
            iconPath: null,
            baseLayerName: null,
            overlayProperties: null,
            currentLayer: null
    }); 
    overlayPropertiesValue= null,
    overlayProperties = null

    state.customStyle.color= null,
    state.customStyle.opacity= null,
    state.customStyle.weight= null,

    // Remove only Geoman layers, keep the image overlay
    map.eachLayer(layer => {
        // Only remove layers that are not the base image and are editable (Geoman layers)
        if (layer !== state.imageLayer && layer.pm) {
            map.removeLayer(layer);
        }
    });
    // Remove Geoman controls completely
    map.pm.removeControls();
    // Remove Btns
    DOM.clearBtn.style.display = 'none'
    DOM.downloadBtn.style.display = 'none'
}