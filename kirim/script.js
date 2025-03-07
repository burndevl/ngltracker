let count = 50; 

function updateCount() {
    let randomIncrease = Math.floor(Math.random() * 10) + 1; 
    count += randomIncrease;
    document.getElementById("number").textContent = count;
}

setInterval(updateCount, 1000);

// const shadow = document.querySelector('.cursor-shadow');

// document.addEventListener('mousemove', (e) => {
//     // Ambil posisi mouse
//     const x = e.clientX;
//     const y = e.clientY;
    

//     shadow.style.transform = `translate(${x - 40}px, ${y - 40}px)`;
// });
