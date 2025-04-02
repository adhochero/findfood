document.addEventListener('DOMContentLoaded', () => {
    
    const compassNeedle = document.getElementById('needle');
    const compassClosed = document.getElementById('closed');
    const compassOpen = document.getElementById('open');

    let rect, compassX, compassY, baseSize, maxRadius;

    const radiusMultiplier = 30; // <<-- CHANGE THIS VALUE TO SET BASE RADIUS

    function updateCompassPosition() {
        rect = compassOpen.getBoundingClientRect();
        compassX = rect.left + rect.width / 2;
        compassY = rect.top + rect.height / 2;

        baseSize = 240; // Base size of the largest image
        let currentSize = rect.width; // Current size of the image
        let scaleFactor = currentSize / baseSize;

        maxRadius = radiusMultiplier * scaleFactor; // Scaled radius
    }

    window.addEventListener('resize', updateCompassPosition);

    document.addEventListener('pointerdown', () => {
        closeCompass();
    });

    document.addEventListener('pointerup', () => {
        setTimeout(openCompass, 100);
    });

    const closeCompass = () => {
        compassClosed.classList.remove('hidden');
        compassOpen.classList.add('hidden');
        compassNeedle.classList.add('hidden');
    };

    const openCompass = () => {
        compassClosed.classList.add('hidden');
        compassOpen.classList.remove('hidden');
        compassNeedle.classList.remove('hidden');
    };

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const distanceX = mouseX - compassX;
        const distanceY = mouseY - compassY;
        const norm = Math.sqrt(distanceX ** 2 + distanceY ** 2);

        if (norm > 0) {
            const moveDistance = Math.min(norm, maxRadius);
            const scaleX = distanceX / norm;
            const scaleY = distanceY / norm;

            const x = scaleX * moveDistance;
            const y = scaleY * moveDistance;

            compassNeedle.style.transform = `translate(-50%, -50%) translateX(${x}px) translateY(${y}px)`;
        }
    });

    updateCompassPosition();


    const lat = 37.11808186876309;
    const long = -113.50143589183372;

    const map = L.map('map').setView([lat, long], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

    L.marker([lat, long]).addTo(map);


});


let targetLat = 37.11808186876309, targetLng = -113.50143589183372;
let userLat, userLng;

// Get User Location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;
            updateDistance();
        }, (error) => {
            console.error("Error getting location:", error);
        }, { enableHighAccuracy: true });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Calculate Distance Using Haversine Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    let dLat = (lat2 - lat1) * (Math.PI / 180);
    let dLon = (lon2 - lon1) * (Math.PI / 180);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}

// Update Distance Display
function updateDistance() {
    if (userLat !== undefined && userLng !== undefined) {
        let distance = calculateDistance(userLat, userLng, targetLat, targetLng);
        let distanceMiles = distance / 1609.34; // Convert meters to miles
        
        //document.getElementById("distance").textContent = 
        //    distanceMiles > 0.1 ? distanceMiles.toFixed(2) + " miles" : (distance * 3.28084).toFixed(0) + " feet";
    }
}

// Calculate Bearing (Direction to Target)
function calculateBearing(lat1, lon1, lat2, lon2) {
    let dLon = (lon2 - lon1) * (Math.PI / 180);
    let y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
    let x = Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
            Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
}

// Update Compass Rotation
function updateCompass(heading) {
    if (userLat !== undefined && userLng !== undefined) {
        let targetBearing = calculateBearing(userLat, userLng, targetLat, targetLng);
        //let compass = document.getElementById("compass");
        let rotation = targetBearing - heading;
        //compass.style.transform = `rotate(${rotation}deg)`;
    }
}

// Get Device Orientation
window.addEventListener("deviceorientationabsolute", (event) => {
    let heading = event.alpha; // Alpha represents compass direction
    if (heading !== null) {
        //document.getElementById("device-heading").textContent = `${Math.round(heading)}°`;
        updateCompass(heading);
    } else {
        //document.getElementById("device-heading").textContent = "Not Supported";
    }
});

getUserLocation(); // Start tracking location