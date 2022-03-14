class Sky {
    constructor(canvas) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastUpdate = 0;
        this.lastConstellation = 0;
        this.nextConstellation = Math.random() * 1000 + 500;
    }

    initCanvas() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    generateStars(count) {
        let stars = [];
        for (let i = 0; i < count; i++) {
            const radius = Math.random() * 2 + 2;
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: radius,
                originalRadius: radius,
                speed: Math.random(),
                color: '#fff',
            })
        }

        this.stars = stars;
    }

    updateStars() {
        this.stars.forEach(star => {
            star.x += star.speed * this.delta / 100;
            star.y -= star.speed * ((this.width / 2) - star.x) / 3000;
            star.radius = star.originalRadius * (Math.random() / 5 + 0.9);

            if (star.x > this.width + star.radius) {
                star.x = -star.originalRadius;
            }
        })
    }

    drawStars() {
        this.ctx.save();
        this.stars.forEach(star => {
            this.drawStar(star);
        })
        this.ctx.restore();
    }

    drawStar(star) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = star.color;
        this.ctx.translate(star.x, star.y);
        this.ctx.moveTo(0, 0 - star.radius);
        for (let i = 0; i < 5; i++) {
            this.ctx.rotate(Math.PI / 5);
            this.ctx.lineTo(0, 0 - (star.radius * 2));
            this.ctx.rotate(Math.PI / 5);
            this.ctx.lineTo(0, 0 - star.radius);
        }
        this.ctx.fill();
        this.ctx.restore();
    }


    drawOverlayer() {
        this.ctx.save();
        let gradient = this.ctx.createRadialGradient(this.width / 2, this.height / 2, 200, this.width / 2, this.height / 2, this.width / 2);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.75)");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }

    generateRandomConstellation() {
        const x = this.width / 2 * Math.random() * 1.5 - 0.5;
        const y = this.height / 2 * Math.random() * 1.5 - 0.5;
        const radius = Math.random() * (this.height / 2 - 200) + 100;

        this.constellation = {
            stars: this.stars.filter(star =>
                star.y > y - radius
                && star.y < y + radius
                && star.x > x - radius
                && star.x < x + radius).slice(0, Math.round(Math.random() * 5 + 3)),
            isClosed: Math.random() < 0.5,
            width: 5,

        }
    }

    updateConstellation() {
        if (this.constellation.width > 0)
            this.constellation.width -= this.delta / 300;
        else this.constellation.width = 0;
    }

    drawConstellation() {
        const { stars, isClosed, width } = this.constellation;
        const starsCount = stars.length;

        const firstStar = stars[0];
        const lastStar = stars[starsCount - 1];

        this.ctx.beginPath();
        this.ctx.moveTo(firstStar.x, firstStar.y);
        this.ctx.lineTo(stars[1].x, stars[1].y);
        if (width > 0) this.ctx.strokeStyle = "#f7edad";
        this.ctx.lineWidth = width;

        for (let i = 1; i < stars.length - 1; i++) {
            const star = stars[i];
            const nextStar = stars[i + 1];
            this.ctx.moveTo(star.x, stars[i].y);
            this.ctx.lineTo(nextStar.x, nextStar.y);
            this.ctx.stroke();

        }

        if (isClosed) {
            this.ctx.moveTo(lastStar.x, lastStar.y);
            this.ctx.lineTo(firstStar.x, firstStar.y);
            this.ctx.stroke();
        }
    }

    draw(now) {
        this.delta = now - this.lastUpdate;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height); // clear canvas

        this.drawStars();


        this.updateStars();

        this.drawConstellation();
        this.updateConstellation();

        if (now - this.lastConstellation > this.nextConstellation) {
            this.lastConstellation = now;
            this.nextConstellation = Math.random() * 1000 + 3000;
            this.generateRandomConstellation()
        }

        this.drawOverlayer();

        this.lastUpdate = now;
        window.requestAnimationFrame((now) => this.draw(now));

    }

    run() {
        this.initCanvas();
        this.generateStars(500);
        this.generateRandomConstellation();
        this.draw(0);
    }
}

const sky = new Sky(document.querySelector('#canvas'));

sky.run();