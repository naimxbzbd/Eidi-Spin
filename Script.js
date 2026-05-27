// --- Web Audio API Sound Generator (No external file URLs needed) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'spin') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'jackpot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.7);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.7);
    }
}

// --- Wheel Data & Canvas Setup ---
const prizes = [
    { text: "১০ টাকা", color: "#0d5c63" },
    { text: "২০ টাকা", color: "#028090" },
    { text: "৫০ টাকা", color: "#00a896" },
    { text: "১০০ টাকা", color: "#02c39a" },
    { text: "২০০ টাকা", color: "#f0f3f4" },
    { text: "কাতান শাড়ি", color: "#ff007f" },
    { text: "থ্রি-পিস", color: "#9b5de5" },
    { text: "টি-শার্ট", color: "#ffd700" }, // Jackpot 
    { text: "জার্সি", color: "#f15bb5" },
    { text: "ঘড়ি", color: "#00bbf9" },
    { text: "Better Luck Next Time", color: "#334155" }
];

const numSlices = prizes.length;
const sliceAngle = (2 * Math.PI) / numSlices;
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");

let currentRotation = 0;

// Draw Wheel Function
function drawWheel() {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save state to rotate total structure
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(currentRotation);
    
    for (let i = 0; i < numSlices; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius - 10, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.fillStyle = prizes[i].color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.stroke();
        
        // Render Text
        ctx.save();
        ctx.fillStyle = (prizes[i].text === "১০ টাকা" || prizes[i].text === "২০ টাকা" || prizes[i].text === "৫০ টাকা" || prizes[i].text === "টি-শার্ট") ? "#ffffff" : "#cbd5e1";
        if(prizes[i].text === "টি-শার্ট") ctx.fillStyle = "#000000"; // Black text on Gold for readability
        
        ctx.rotate(i * sliceAngle + sliceAngle / 2);
        ctx.font = "bold 15px 'Hind Siliguri', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(prizes[i].text, radius - 35, 6);
        ctx.restore();
    }
    ctx.restore();
}
drawWheel();

// --- Probability Calculation Engine ---
function getTargetIndex() {
    // 1 in 100 dynamic check for hidden Rare Jackpot (টি-শার্ট)
    const jackpotRoll = Math.floor(Math.random() * 100);
    if (jackpotRoll === 7) { 
        return prizes.findIndex(p => p.text === "টি-শার্ট"); 
    }

    // Weighted standard distribution for the allowed 4 elements
    // Better Luck Next Time (45%), ১০ টাকা (35%), ২০ টাকা (15%), ৫০ টাকা (5%)
    const roll = Math.random() * 100;
    if (roll < 45) {
        return prizes.findIndex(p => p.text === "Better Luck Next Time");
    } else if (roll < 80) {
        return prizes.findIndex(p => p.text === "১০ টাকা");
    } else if (roll < 95) {
        return prizes.findIndex(p => p.text === "২০ টাকা");
    } else {
        return prizes.findIndex(p => p.text === "৫০ টাকা");
    }
}

// --- Spin Logic Handler ---
spinBtn.addEventListener("click", () => {
    // Check local storage restriction
    if (localStorage.getItem("elyra_eid_spinned") === "true") {
        showModal("🚫 আপনার স্পিন সীমা শেষ হয়েছে", "আপনার ডিভাইস থেকে আজকের ইদি স্পিন ক্যাম্পেইনে একবার অংশগ্রহণ করা হয়ে গেছে। ঈদ মোবারক!");
        spinBtn.disabled = true;
        return;
    }

    spinBtn.disabled = true;
    const targetIndex = getTargetIndex();
    
    // Smooth custom easing mechanics
    const baseSpins = 6 + Math.floor(Math.random() * 4); // 6 to 9 full spins
    
    // Calculate final stop angle to pinpoint at absolute top center (270 degrees)
    const targetAngle = (2 * Math.PI) - (targetIndex * sliceAngle + sliceAngle / 2) - (Math.PI / 2);
    const finalRotation = (baseSpins * 2 * Math.PI) + targetAngle;
    
    let startTimestamp = null;
    const duration = 5000; // 5 seconds realistic slow down duration
    
    let lastSoundAngle = 0;

    function animateWheel(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic formula for elite realistic slowdown
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        currentRotation = easeOutCubic * finalRotation;
        
        // Tick sound simulation algorithm on segment crossover
        if (currentRotation - lastSoundAngle > 0.3) {
            playSound('spin');
            lastSoundAngle = currentRotation;
        }
        
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            // Animation complete
            localStorage.setItem("elyra_eid_spinned", "true");
            triggerRewardProcessing(prizes[targetIndex].text);
        }
    }
    requestAnimationFrame(animateWheel);
});

// --- Trigger Reward & Modal Interface ---
function triggerRewardProcessing(prizeText) {
    const modal = document.getElementById("resultModal");
    const content = document.getElementById("modalContent");
    
    content.classList.remove("jackpot");
    
    if (prizeText === "Better Luck Next Time") {
        showModal("😢 ভাগ্য সহায় হয়নি", "দুঃখিত! এবার ভাগ্য সহায় হয়নি। Elyra Elegants এর সাথেই থাকুন পরবর্তী অফারের জন্য।");
    } else if (prizeText === "টি-শার্ট") {
        content.classList.add("jackpot");
        playSound('jackpot');
        startConfettiLoop(true);
        showModal("🎉 JACKPOT WINNER! 🎉", "অভিনন্দন! আপনি Elyra Elegants এর পক্ষ থেকে একটি এক্সক্লুসিভ 'টি-শার্ট' জ্যাকপট জিতেছেন।");
        if(navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    } else {
        playSound('win');
        startConfettiLoop(false);
        showModal("🎁 অভিনন্দন! 🎁", `আপনি জিতেছেন ${prizeText} ইদি সালামি!`);
        if(navigator.vibrate) navigator.vibrate(150);
    }
}

// --- Modal Helper Engine ---
function showModal(title, description) {
    const modal = document.getElementById("resultModal");
    document.getElementById("modalIcon").innerText = title.includes("Better Luck") || title.includes("সহায় হয়নি") ? "🌙" : "🎉";
    document.getElementById("modalMessage").innerHTML = `<h3>${title}</h3><p style="margin-top:10px; font-weight:400; opacity:0.9;">${description}</p>`;
    modal.classList.add("show");
}

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("resultModal").classList.remove("show");
    stopConfettiLoop();
});

// Window initial check state
if (localStorage.getItem("elyra_eid_spinned") === "true") {
    spinBtn.disabled = true;
}

// --- Confetti Canvas Scripting System ---
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiArray = [];
let confettiAnimationId = null;

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeConfettiCanvas);
resizeConfettiCanvas();

class ConfettiParticle {
    constructor(isJackpot) {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * confettiCanvas.height - confettiCanvas.height;
        this.size = Math.random() * 8 + 4;
        this.color = isJackpot ? `hsl(${Math.random() * 30 + 45}, 100%, 50%)` : `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 5 + 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
    }
    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate((this.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = this.color;
        confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        confettiCtx.restore();
    }
}

function startConfettiLoop(isJackpot) {
    confettiArray = [];
    const count = isJackpot ? 250 : 120;
    for (let i = 0; i < count; i++) {
        confettiArray.push(new ConfettiParticle(isJackpot));
    }
    function updateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiArray.forEach((p, idx) => {
            p.update();
            p.draw();
            if (p.y > confettiCanvas.height) {
                confettiArray[idx].y = -20;
            }
        });
        confettiAnimationId = requestAnimationFrame(updateConfetti);
    }
    updateConfetti();
}

function stopConfettiLoop() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}
