//creates and returns new marker
function createMarker(lon, lat, isIntermediate = false, label = "") {
  const newMarker = new mapgl.Marker(map, {
    coordinates: [lon, lat],
    icon: "media/marker.png",
  });
  markerList.push(newMarker);

  if (isIntermediate) {
    newMarker.on("click", function (e) {
      let index = route.findIndex(
        (element) =>
          element[0] == newMarker.getCoordinates()[0] && element[1] == newMarker.getCoordinates()[1]
      );
      if (index != -1) {
        route.splice(index, 1);
      } else {
        route.push(newMarker.getCoordinates());
      }
      let startP = [route[0][0], route[0][1]];
      route.sort((a, b) => {
        return (
          distanceBetweenPointsInMeters(startP, a) - distanceBetweenPointsInMeters(startP, b)
        );
      });
      directions.pedestrianRoute({
        points: route,
        style: {
          routeLineWidth: ["interpolate", ["linear"], ["zoom"], 10, 30, 14, 3],
          substrateLineWidth: [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            30,
            14,
            10,
          ],
        },
      });
    });
  }
  if (label != "") {
    const tooltipEl = document.getElementById("tooltip");

    newMarker.on("mouseover", (event) => {
      const offset = 5;

      tooltipEl.style.top = `${event.point[1] + offset}px`;
      tooltipEl.style.left = `${event.point[0] + offset}px`;
      tooltipEl.style.display = "block";
      tooltipEl.innerHTML = label;
    });

    newMarker.on("mouseout", (e) => {
      tooltipEl.style.display = "none";
    });
  }

  return newMarker;
}

function destroySightMarkers() {
  markerList.forEach((marker) => {
    if (marker != finishMarker) marker.destroy();
  });
  markerList = [];
}

function showToast(text, time = 5000) {
  statusT.textContent = text;
  statusT.style.opacity = 1;
  statusT.animate(
    {
      transform: ["translateY(-150px )", "translateY(0)"],
    },
    1000
  );
  setTimeout(() => {
    statusT.animate(
      {
        transform: "translateY(-150px )",
      },
      1000
    );
    setTimeout(() => {
      statusT.style.opacity = 0;
    }, 1000);
  }, 1000 + time);
}

function geoFindMe() {
  if (!navigator.geolocation) {
    showToast("Геолокация не поддерживается вашим браузером");
  } else {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.setCenter([pos.coords.longitude, pos.coords.latitude]);

        if (userMarker) {
          userMarker.destroy();
        }

        userMarker = new mapgl.CircleMarker(map, {
          coordinates: [pos.coords.longitude, pos.coords.latitude],
          radius: 14,
          color: "#0088ff",
          strokeWidth: 4,
          strokeColor: "#ffffff",
          stroke2Width: 6,
          stroke2Color: "#0088ff55",
        });
      },
      () => {
        showToast("Не удалось определить местоположение");
      }
    );
  }
}

let foundSights = [];
let route = [];

function findRoutePoints(start, finish) {
  let centrCoords = [(start[0] + finish[0]) / 2, (start[1] + finish[1]) / 2];
  let requestString =
    "https://api.opentripmap.com/0.1/ru/places/radius?radius={RADIUS}&{COORDS}&{KIND}&rate=3&format=json&limit=200&apikey=5ae2e3f221c38a28845f05b69276174a1cdb303095e66db6574e28b6";
  requestString = requestString
    .replace("{COORDS}", "lon=" + centrCoords[0] + "&lat=" + centrCoords[1])
    .replace("{KIND}", "kinds="+destin.slice(0, -1))
    //.replace("{RADIUS}", Math.round(radius))
    .replace("{RADIUS}", distanceBetweenPointsInMeters(start, finish) / 2);
  //let requestString = "https://api.opentripmap.com/0.1/ru/places/bbox?{RECT}&{KIND}&rate=3&format=json&apikey=5ae2e3f221c38a28845f05b69276174a1cdb303095e66db6574e28b6";
  //requestString = requestString
  //    .replace("{KIND}", destin.slice(0, -1))
  //    .replace("{RECT}", "lon_min=" + Math.min(start[0], finish[0]) + "&lon_max=" + Math.max(start[0], finish[0]) + "&lat_min=" + Math.min(start[1], finish[1]) + "&lat_max=" + Math.max(start[1], finish[1]))
  const request = new XMLHttpRequest();
  request.open("GET", requestString);
  request.onload = function () {
    destroySightMarkers();
    route.push(start);

    JSON.parse(request.response).forEach((element) => {
      if (
        distanceSegPointInMeters(
          [element.point.lon, element.point.lat],
          start,
          finish
        ) <= slider.value
      ) {
        route.push([element.point.lon, element.point.lat]);
      }
      createMarker(element.point.lon, element.point.lat, true, element.name);
    });
    console.log(requestString);

    if (route.length >= 10) {
      route.splice(9, route.length - 9);
    }
    route.push(finish);
    console.log("dfzxd", route);

    route.sort((a, b) => {
      return (
        distanceBetweenPointsInMeters(start, a) -
        distanceBetweenPointsInMeters(start, b)
      );
    });
    directions.pedestrianRoute({
      points: route,

      style: {
        routeLineWidth: ["interpolate", ["linear"], ["zoom"], 10, 30, 14, 3],
        substrateLineWidth: [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          30,
          14,
          10,
        ],
      },
    });
    //let currentPoint = [start[0], start[1]]
    //while (distanceBetweenInMeters(currentPoint, finish) > 500) {
    //    for (let i = 0; i < foundSights.length; i++) {
    //        const sight = foundSights[i];
    //
    //        if (checkPoint(currentPoint, sight)) {
    //            routePoints.push(sight)
    //            createMarker(sight[0], sight[1])
    //            currentPoint = [sight[0], sight[1]]
    //            break
    //        }
    //    }
    //}

    /*const polyline = new mapgl.Polyline(map, {
            coordinates: [
                start,
                finish
            ],
            width: 10,
            color: '#00b7ff',
        });*/

    //return routePoints
  };
  request.send();
}

function rebuildRoute(start, finish) {}

//=========================================================================

//проверка попадания в полуокружность
//start - текущая позиция
//point - точка достопримечательности
/*function checkPoint(start, finish, point) {
    return distanceSegPointInMeters(point, start, finish)
}*/

function distanceBetweenPointsInMeters(point1, point2) {
  return (
    Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
    ) *
    111.111 *
    1000
  );
}

function distanceSegPointInMeters(p, pA, pB) {
  let point = [p[0] * 111.111 * 1000, p[1] * 111.111 * 1000];
  let a = [pA[0] * 111.111 * 1000, pA[1] * 111.111 * 1000];
  let b = [pB[0] * 111.111 * 1000, pB[1] * 111.111 * 1000];
  return (
    Math.abs(
      (b[1] - a[1]) * point[0] -
        (b[0] - a[0]) * point[1] +
        b[0] * a[1] -
        a[0] * b[1]
    ) / Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
  );
}

const GRAD_TO_RAD = 0.017;