
/**************************************************** 
* 1. DOM REFERENCES 
****************************************************/ 
const DOM = {
    modal: document.getElementById("myModal"),
    modalContent: document.querySelector(".modal-content"),
    openBtn: document.querySelector("#create-modal-btn"),
    downloadBtn: document.querySelector("#downloadBtn"),
    closeBtn: document.querySelector("#closeBtn"),
    clearBtn: document.querySelector("#clearBtn"),
    sidebar: document.querySelector("#sidebar"),
    propertiesContainer: document.querySelector("#properties-container"),
    featureForm: document.querySelector("#featureForm"),
    featureDiv: document.querySelector("#feature-div"),
    coords: document.getElementById("coords"),
    imageInput: document.getElementById("imgInp")
};

//==================================== Sidebar
function toggleFunction(container, className){
    container.style.display = 'block'; 
    container.classList.add(className);
}


/**************************************************** 
* 2. APPLICATION STATE 
****************************************************/ 
const state = { 
    baseLayerName: null, 
    overlayName: null,
    overlayPropertiesArray: [], 
    overlayType: "point", 
    creatingMultiPointLayer: true, 
    customStyle: { 
        color: null, 
        opacity: null, 
        weight: null, 
    },
    iconPath: null, 
    customIcon: { 
        iconUrl: null,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    }, 
    currentLayer: null, 
    imageUrl: null,
    imageLayer: null,
    importedGeoJSON: null
}; 
/**************************************************** 
* 3. MODAL FUNCTIONS 
****************************************************/ 
modalUI()
function nextInputValues(e,baselayerNameID, overlayNameID, overlayPropertiesID, overlayTypeID){
    e.preventDefault(); // prevent reload
   // baseLayerNameValue
    const overlayName = document.getElementById(overlayNameID) 
    const overlayProperties = document.getElementById(overlayPropertiesID) 
    const overlayType = document.getElementById(overlayTypeID) 
    const baselayerInput = document.getElementById(baselayerNameID) 
    state.baseLayerName = baselayerInput.value
    state.overlayName = overlayName.value
    state.overlayPropertiesArray = overlayProperties.value
    .split(',')            // Split by comma
    .map(item => item.trim()) // Remove spaces from every single item
    .filter(item => item !== ""); // Optional: remove empty items if they typed ,,
    state.overlayType = overlayType.value
}
DOM.openBtn.addEventListener('click', ()=>{openModal(DOM.modal)})
function openModal(modal){
  modal.style.display = "block";
}
function closeModal(modal){
    modal.style.display = "none";
}
function displayDownloadBtn(){
    DOM.downloadBtn.style.display= "block"
}
function displayClearBtn(){
    DOM.clearBtn.style.display= "block"
}
function modalUI(){
    DOM.modalContent.innerHTML=`

        <span id="closeBtn"  class="close">&times;</span>

        <h3>Start Creating an Overlay</h3>
        <div id="btn-modal-container">
            <div>
                <button class="btn btn-import-modal">Import Layer</button>
            </div>
            <div>
                <button class="btn btn-new-overlay">New overlayer</button>
            </div>
        </div>
    `
        document.querySelector("#closeBtn").addEventListener('click', ()=>{
            closeModal(DOM.modal)
        })
        document.querySelector('.btn-import-modal').addEventListener("click",()=>{importLayerModal()})
        document.querySelector(".btn-new-overlay").addEventListener("click",()=>{
            newLayerModal()
        })
}
function importLayerModal(){
    DOM.modalContent.innerHTML=`

        <span id="closeBtn"  class="close">&times;</span>

        <h3><span class="arrow">←</span> Start Creating an Overlay</h3>
            <label>Overlay type</label>
            <select id="overlay-type"
                        style="background: #eee;">
                    <option value="point" selected>Point</option>
                    <option value="polyline">Polyline</option>
                    <option value="polygon">Polygon</option>
            </select>
            <label>Choose Icon If The Overlay Type is point</label>
            <input type="file"
                id="icon-file"
                accept="image/*"
                style="background: #eee;">
        <div id="btn-modal-container">
            <div id="import">
                <input type="file" id="geojson-file"  accept=".geojson, .json" class="hidden">
                <button class="btn btn-import" id="importBtn" onclick="document.getElementById('geojson-file').click();modalUI();closeModal(DOM.modal)">Import Layer</button>
            </div>
        </div>
    `
    document.querySelector("#closeBtn").addEventListener('click', ()=>{
        modalUI()
        closeModal(DOM.modal)
    })
    document.querySelector(".arrow").addEventListener('click', ()=>{
        modalUI()
    })  
    document.querySelector("#icon-file").addEventListener('change', ()=>{
        IconFileURL(event)
    })      
    document.querySelector("#geojson-file").addEventListener('change', ()=>{
        importLayerFunc(event)
    })   

    const select = document.querySelector('#overlay-type')
    select.addEventListener('change', ()=>{
        state.overlayType = select.value
     })
}
function newLayerModal(){
    DOM.modalContent.innerHTML = `
            <span id="closeBtn" class="close">&times;</span>

            <h3><span class="arrow">←</span> Start Creating an Overlay</h3>
            <div class="field">
                <form id="layer-form">
                <label>BaseLayer name</label>
                <input type="text" required
                    id="baselayer-name"
                    placeholder="Enter overlay name"
                    style="background: #eee;">
                <label>Overlay name</label>
                <input type="text" required
                    id="overlay-name"
                    placeholder="Enter overlay name"
                    style="background: #eee;">

                <label>Enter properties keys</label>
                <input type="text" required
                    id="properties-keys"
                    placeholder='Use "," as separator'
                    style="background: #eee;">

                <label>Overlay type</label>
                <select id="overlay-type"
                        style="background: #eee;">
                    <option value="point" selected>Point</option>
                    <option value="polyline">Polyline</option>
                    <option value="polygon">Polygon</option>
                </select>

                <button class="btn btn-next" type="submit">
                    Next
                </button>  
                </form>          
            </div>
    `
            // attach submit event AFTER creating HTML
        document.querySelector(".arrow").addEventListener('click', ()=>{
            modalUI()
        }) 
        document.querySelector("#closeBtn").addEventListener('click', ()=>{
            modalUI()
            closeModal(DOM.modal);
        })
        document.getElementById('layer-form')
        .addEventListener('submit', function(e){

            e.preventDefault();

            nextInputValues(
                e,
                'baselayer-name',
                'overlay-name',
                'properties-keys',
                'overlay-type'
            );

            layerTypeModalContent('overlay-type');

        });
        const baseLayerName = document.getElementById('baselayer-name')
        baseLayerName.value = state.baseLayerName
        const overlayName = document.getElementById('overlay-name')
        overlayName.value =  state.overlayName
        overlayProperties = document.getElementById('properties-keys') 
        overlayProperties.value = state.overlayPropertiesArray.join(", ")
        const overlayType = document.getElementById('overlay-type') 
        overlayType.value = state.overlayType
}
function layerTypeModalContent(selectID){
    const selectInput = document.getElementById(selectID)
    if(selectInput.value == 'point'){
     //   state.creatingMultiPointLayer = true
        DOM.modalContent.innerHTML=`
            <span id="closeBtn" class="close">&times;</span>

            <h3><span class="arrow">←</span> Start Creating an Overlay</h3>
            <form id="icon-form">
            <label>Choose Icon</label>
            <input type="file" required
                id="icon-file"
                accept="image/*"
                onchange="IconFileURL(event)"
                style="background: #eee;">

            <label>Icon path</label>
            <input type="text" required
                id="icon-path"
                placeholder="Icon path will appear here"
                style="background: #eee;">

            <button class="btn btn-start" type="submit">
                Start
            </button>
            </form>
        `
        document.querySelector(".arrow").addEventListener('click', ()=>{
            newLayerModal()
        }) 
        document.querySelector("#closeBtn").addEventListener('click', ()=>{
            modalUI()
            closeModal(DOM.modal);
        })
        document.querySelector('#icon-form').addEventListener('submit', (e)=>{
            e.preventDefault();
            layerStyle(); 
            modalUI();
            closeModal(DOM.modal); 
            startBtn(); 
            toggleFunction(DOM.propertiesContainer, 'properties-active'); 
            displayDownloadBtn()
        })
    }else{
     //   state.creatingMultiPointLayer = false
        DOM.modalContent.innerHTML = `
            <span id="closeBtn"  class="close">&times;</span>

            <h3><span class="arrow">←</span> Start Creating an Overlay</h3>
            <form id="style-form">
            <label>Color</label>
            <input type="color" required
                id="overlay-color"
                value="#3388ff"
                style="background: #eee; border: none">

            <label>Opacity</label>
            <input type="number" required
                id="overlay-opacity"
                min="0"
                max="1"
                step="0.1"
                value="1"
                style="background: #eee;">

            <label>Weight</label>
            <input type="number" required
                id="overlay-weight"
                min="1"
                max="20"
                value="3"
                style="background: #eee;">

            <button class="btn btn-start" type="submit">
                Start
            </button>
            </form>
        `
        document.querySelector("#closeBtn").addEventListener('click', ()=>{
            modalUI()
            closeModal(DOM.modal);
        })
        document.querySelector(".arrow").addEventListener('click', ()=>{
            newLayerModal()
        }) 
        document.querySelector('#style-form').addEventListener('submit', (e)=>{
            e.preventDefault();
            layerStyle(); 
            closeModal(DOM.modal); 
            startBtn(); 
            toggleFunction(DOM.propertiesContainer, 'properties-active');
            displayDownloadBtn()
        })
    }

}
function layerStyle(){
    if(state.overlayType === "point"){
        const iconPathInput = document.querySelector('#icon-path')
        state.iconPath = iconPathInput.value
    }else{
        const colorInput = document.querySelector('#overlay-color')
        const opacityInput = document.querySelector('#overlay-opacity')
        const weightInput = document.querySelector('#overlay-weight')
        state.customStyle.color = colorInput.value
        state.customStyle.opacity = opacityInput.value
        state.customStyle.weight = weightInput.value

    }
}
function IconFileURL(e){

    let file = e.target.files[0];
    if(!file) return;

    const iconURL = URL.createObjectURL(file);
    state.customIcon.iconUrl = iconURL
}
