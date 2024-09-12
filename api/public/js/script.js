const socket = io();

// Wait until the socket connection is fully established
socket.on('connect', () => {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        }, (error) => {
            console.error(error);
        }, {
            enableHighAccuracy: true,
            timeout: 5000,  // after how much time it checks the position
            maximumAge: 0,  // caching disabled. 
        });
    }
});

const map = L.map("map").setView([0, 0], 16); // zoom 

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Tracker"
}).addTo(map);

const markers = {};

// Update markers when receiving location data
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Remove markers when a user disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
