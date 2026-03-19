const apiKeys = {
    main: '4babad42-5fba-49ea-8022-b4b5d42514d7',
    directory: 'runmaq4411'
}

const map = new mapgl.Map('container', {
    center: [55.31878, 25.23584],
    zoom: 13,
    key: apiKeys.main,
    style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b'
});
let markerList = []

const destinationInput = document.getElementById("destination")

const controlContent = `
<div class="buttonRoot" id="find-me">
    <button class="button">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
        >
            <path
                fill="currentColor"
                d="M17.89 26.27l-2.7-9.46-9.46-2.7 18.92-6.76zm-5.62-12.38l4.54 1.3 1.3 4.54 3.24-9.08z"
            />
        </svg>
    </button>
</div>
`;

const control = new mapgl.Control(map, controlContent, {
    position: 'topRight',
});
let userMarker;
let finishMarker;

const statusT = document.querySelector('#status');
const buttonIds = ['interesting_places', "architecture", "natural", "industrial_facilities", "religion", "natural", "cultural", "historic"]
let destin = ""


const slider = document.getElementById("customRange3")
    //=======================================================
window.onload = function() {
    map.on('click', function(e) {
        if (finishMarker) finishMarker.destroy()
        finishMarker = createMarker(e.lngLat[0], e.lngLat[1])
    })

    destinationInput.addEventListener('input', function(e) {
        let request = new XMLHttpRequest();
        request.open('GET', "https://catalog.api.2gis.com/3.0/suggests?q=" + destinationInput.value + "&suggest_type=route_endpoint&key=" + apiKeys.directory)
        request.onload = function() {}
        request.send()
    })

    control
        .getContainer()
        .querySelector('#find-me')
        .addEventListener('click', geoFindMe);

    geoFindMe()

    buttonIds.forEach(id => {
        document.getElementById(id).onclick = (e) => {
            if (document.activeElement.checked)
                destin += id + ",";
            else
                destin = destin.replace(id + ",", "")
        }
    })


}




let directions = new mapgl.Directions(map, {
    directionsApiKey: apiKeys.main,
});

document.getElementById("findRouteBtn").onclick = function(e) {
    if (userMarker && finishMarker) {
        findRoutePoints(userMarker.options.coordinates, finishMarker.getCoordinates())
    } else if (!userMarker) {
        showToast("Местоположение не определено")
    } else {
        showToast("Выберите пункт назначения")
    }
}

document.getElementById("clearRoute").onclick = function(e) {
    destroySightMarkers();
    directions.clear()
    route = []
}

document.getElementById("arrow-button").onclick = function(e) {
    const hideArea = document.getElementById("hide")
    if (hideArea.style.display == "inherit") {
        hideArea.style.display = "none"
        document.getElementById("arrow-button").style.transform = "rotateZ(0deg)"
    } else {
        hideArea.style.display = "inherit"
        document.getElementById("arrow-button").style.transform = "rotateZ(180deg)"
    }
}

slider.oninput = function (){
    document.getElementById("sliderLabel").innerHTML = "Допустимое отклонение: "+slider.value + "м"
}