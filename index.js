const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const raycast = document.getElementById("screen");
const ctxr = raycast.getContext("2d");

const settingsRenderSize = document.getElementById("settingsRenderSize");
const settingsTurnSpeed = document.getElementById("settingsTurnSpeed");
const settingsMoveSpeed = document.getElementById("settingsMoveSpeed");
const settingsRayDistance = document.getElementById("settingsRDistance");
const settingsRayGap = document.getElementById("settingsRGap");
const settingsAngle = document.getElementById("settingsAngle");
const settingsRColSteps = document.getElementById("settingsRColSteps");

const settingsBGColor = document.getElementById("settingsBGColor");

let keys = new Map();
let walls = [];

let wallGap = 46;
let wallThickness = 46;

let background = "black";

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.turnSpeed = 0.05;
        this.moveSpeed = 2;

        this.renderDistance = 200;
        this.renderAngle = 32;
        this.renderGap = 2;
        this.renderColDetail = 5;
    }
    raycast() {
        for(let i=-this.renderAngle/2;i<this.renderAngle/2;i++) {
            let angle = this.angle + (i * (0.017*this.renderGap));
            let posX = null;
            let posY = null;
            for(let l=1;l<=this.renderDistance;l+=this.renderColDetail) {
                let rX = this.x+Math.cos(angle)*(l+10);
                let rY = this.y+Math.sin(angle)*(l+10);
                for(let w=0;w<walls.length;w++) {
                    let wall = walls[w];
                    if(ctx.isPointInPath(wall.path2d, rX, rY)) {
                        posX = rX;
                        posY = rY;
                    }
                }
                if(posX && posY) break;
            }

            if(posX && posY) {
                let dx = posX - player.x;
                let dy = posY - player.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(posX, posY);
                ctx.strokeStyle = "red";
                ctx.stroke();

                ctxr.beginPath();
                ctxr.moveTo((canvas.width/2)+(i*wallGap), canvas.height);
                ctxr.lineTo((canvas.width/2)+(i*wallGap), distance);
                ctxr.strokeStyle = `rgb(${255-distance}, 0, 0)`;
                ctxr.lineWidth = wallThickness;
                ctxr.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x+Math.cos(angle)*this.renderDistance, this.y+Math.sin(angle)*this.renderDistance);
                ctx.strokeStyle = "red";
                ctx.stroke();
            }
        }
    }
    draw() {
        this.raycast();

        ctx.save();

        ctx.beginPath();
        ctx.fillStyle = "lime";
        ctx.arc(this.x, this.y, 4, 0, Math.PI*2, false);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x+(Math.cos(this.angle)*this.renderDistance), this.y+(Math.sin(this.angle)*this.renderDistance));
        ctx.strokeStyle = "yellow";
        ctx.stroke();

        ctx.restore();
    }
}

class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = "white";

        this.path2d = new Path2D()
        this.path2d.rect(this.x, this.y, this.w, this.h);
    }
    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

let player = new Player(canvas.width/2, canvas.height/2);

walls = [
    new Wall(32, 32, canvas.width-64, 32),
    new Wall(128, 128, 32, 32),
    new Wall(32, canvas.height-64, canvas.width-64, 32),
    new Wall(32, 64, 32, canvas.height-128),
    new Wall(canvas.width-64, 64, 32, canvas.height-128),
    new Wall(canvas.width-150, canvas.height-150, 32, 32)
]

function keyHandler() {
    if(keys.has("KeyA")) {
        player.angle -= player.turnSpeed;
    }
    if(keys.has("KeyD")) {
        player.angle += player.turnSpeed;
    }

    if(keys.has("KeyW")) {
        player.x += Math.cos(player.angle) * player.moveSpeed;
        player.y += Math.sin(player.angle) * player.moveSpeed;
    }

    if(keys.has("KeyS")) {
        player.x -= Math.cos(player.angle) * player.moveSpeed;
        player.y -= Math.sin(player.angle) * player.moveSpeed;
    }

    if(player.angle > Math.PI * 2) player.angle = 0;
    if(player.angle < 0) player.angle = Math.PI * 2;
}

function draw() {
    ctx.save();
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    ctxr.save();
    ctxr.fillStyle = background;
    ctxr.fillRect(0, 0, raycast.width, raycast.height);
    ctxr.restore();

    keyHandler();
    walls.forEach(wall => wall.draw());
    player.draw();
    
    requestAnimationFrame(draw);
}
draw();

addEventListener("keydown", (e) => {
    keys.set(e.code, true);
});

addEventListener("keyup", (e) => {
    keys.delete(e.code);
});

settingsRenderSize.onchange = (e) => {
    wallGap = settingsRenderSize.value;
    wallThickness = settingsRenderSize.value;
}

settingsMoveSpeed.onchange = (e) => player.moveSpeed = parseInt(settingsMoveSpeed.value);
settingsTurnSpeed.onchange = (e) => player.turnSpeed = parseInt(settingsTurnSpeed.value/100);
settingsRayDistance.onchange = (e) => player.renderDistance = parseInt(settingsRayDistance.value);
settingsRayGap.onchange = (e) => player.renderGap = parseInt(settingsRayGap.value);
settingsAngle.onchange = (e) => player.renderAngle = parseInt(settingsAngle.value);
settingsRColSteps.onchange = (e) => player.renderColDetail = parseInt(settingsRColSteps.value);
settingsBGColor.onchange = (e) => background = settingsBGColor.value;

let mouseX = 0;
let mouseY = 0;
canvas.addEventListener("mousedown", (e) => {
    mouseX = e.clientX-8;
    mouseY = e.clientY-8;
});

canvas.addEventListener("mouseup", (e) => {
    walls.push(
        new Wall(mouseX, mouseY, (e.clientX-8)-mouseX, (e.clientY-8)-mouseY)
    )
})