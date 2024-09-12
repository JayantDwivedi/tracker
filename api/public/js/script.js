const socket = io();

function emitLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Emitting location: ${latitude}, ${longitude}`);
            socket.emit("send-location", { latitude, longitude });
        }, (error) => {
            console.error("Geolocation error:", error);
        }, {
            enableHighAccuracy: true,
            timeout: 5000,  // after how much time it checks the position
            maximumAge: 0,  // caching disabled. 
        });
    } else {
        console.error("Geolocation not supported by this browser.");
    }
}

// Only emit location after connection is established
socket.on('connect', () => {
    console.log("Connected, socket ID:", socket.id);
    emitLocation();
});

// Handle reconnection event and re-emit location
socket.on('reconnect', () => {
    console.log("Reconnected, socket ID:", socket.id);
    emitLocation();
});

// Listen for received locations
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Remove markers on user disconnect
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

// Error handling for disconnect
socket.on('disconnect', () => {
    console.log("Disconnected from server");
});
