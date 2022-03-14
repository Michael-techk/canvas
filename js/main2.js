class Sky{
    constructor(canvas){
        //określamy nasz canvas, że jest elementem podanym przy tworzeniu zmiennej o klasie Sky, ma to zapobiec jakimś
        //nieporozumieniom w kodzie, dalej tworzymy kwadrat ctx, który będzie tłem i pobieramy szerokość i wys. okna przeglądarki
        this.canvas = canvas; 
        this.ctx = canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.lastUpdate = 0;
        this.lastConstellation = 0;
        this.nextConstellation = Math.random() * 1000 + 500;
    }

    initCanvas() {
        //bierze dane z konstruktora o szerokości oraz wielkości
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        //wypełnia kwadrat na czarno, w fillRect jest dokładnie określone ile ma być wypełniony nasz element
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height)
    }

    //funkcja rysująca gwiazdy
    drawStars() {
        this.stars.forEach(star => {
            this.drawStar(star)
        })
    }

    //funkcja od zapisania stanu canvasa, dokonania transformacji i przywrócenia stanu początkowego
    drawStar(star) {
        this.ctx.save();

        this.ctx.fillStyle = star.color;
        this.ctx.beginPath();

        //ustawiamy się w pkt, który będzie środkiem gwiazdy
        this.ctx.translate(star.x, star.y)

        //idziemy na czubek 1 ramienia gwiazdy
        this.ctx.moveTo(0, 0 - star.radius)

        //pętla rysująca 5 ramion gwiazd
        for(let i = 0; i < 5; i++) {

            //przesuwa punkt na którym będziemy robić ramię o 36 stopni, czyli 1/10 360 stopni, w ten sposób będzie 10 ramion rozłożonych 
            //równomiernie, z czego 5 ramion robimy do połowy, co da efekt gwiazdy
            this.ctx.rotate((Math.PI / 180) * 36);
            this.ctx.lineTo(0, 0 - star.radius * 0.5);

            this.ctx.rotate((Math.PI / 180) * 36);
            this.ctx.lineTo(0, 0 - star.radius)
        }


        this.ctx.fill();
        this.ctx.restore();
    }

    //metoda przygotowująca tablicę gwiazd, np tworząca 100 gwiazd i dająca je na jakieś miejsca na elemencie
    starTable(count) {
        //szykuje tablicę, wywołuję funkcję tyle razy, ile ma być gwiazd i na koniec czyszczę tablicę 
        let stars = [];

        //tworzy wcześniej podaną ilość gwiazd o losowej lokazlizacji , rozmiarze i szybkości poruszania się
        for(let i = 0; i < count; i++){
            const radius = Math.random() * 2 + 2; //wielkość ramienia od 2 do 6

            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: radius,
                originalRadiius: radius,
                color: '#fff',
                speed: Math.random() * 0.75,
            })
        }
        this.stars = stars;
    }

    //funkcja przesuwająca gwiazdy
    updateStar() {
        this.stars.forEach(star => {
            star.x += star.speed;

            //porusza się kuliście po ekranie
            star.y -= star.speed * ((this.width / 2) - star.x) / 1500;

            //migotanie gwiazd
            star.radius = star.originalRadiius * (Math.random() / 7 + 0.95);

            //warunek, jeśli gwiazda zjedzie nam z ekranu z prawej, to ma się pojawić po lewej
            if(star.x > this.width + 2 * star.radius) {
                star.x = -(2 * star.radius);
            }
        });
    }

    //funkcja, żeby migotanie gwiazdy, czyli zmieniający się radius, był przyciemniany
    drawOverLayer() {
        //tworzenie koloru za pomocą gradientu
        let gradient = this.ctx.createRadialGradient(this.width / 2, this.height / 2, 250, this.width / 2, this.height / 2, this.width / 2);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

        //dodawanie stworzonego koloru 
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height)
    }

    //funkcja tworząca losową linię łączącą gwiazdy
    generateRandomConstellation() {
        //losowy obszar z którego będzie losowo wybierać gwiazdy
        const x = this.width / 2 * Math.random() * 1.5 - 0.5;
        const y = this.height / 2 * Math.random() * 1.5 - 0.5;
        const radius = Math.random() * (this.height / 2 - 200) + 100;

        
        //obiekt wybierający od 3 do 10 gwiazd do konstelacji
        this.constellation = {
            stars: this.stars.filter(star => {
                return star.y > y - radius
                && star.y < y + radius
                && star.x > x - radius
                && star.x < x + radius
            }).slice(0, Math.round(Math.random() * 5 + 3)),
            isClosed: Math.random() < 0.8,
            width: 5,
        }

    }

    //funkcja zmniejszająca konstelację na przestrzeni czasu za pomocą parametru width
    updateConstallation() {
        if(this.constellation.width > 0){
        this.constellation.width -= this.delta / 300;
        } else this.constellation.width = 0;
    }

    //funkcja rysująca konstelacje, czyli linie
    drawConstellation() {
        //pobieramy 3 zmienne z obiektu losowej konstelacji
        const { stars, isClosed, width } = this.constellation;

        const firstStar = stars[0];
        const lastStar = stars[stars.length - 1];

        this.ctx.beginPath();
        this.ctx.moveTo(firstStar.x, firstStar.y);
        this.ctx.lineTo(stars[1].x, stars[1].y);
        if (width > 0) this.ctx.strokeStyle = "#f7edad";
        this.ctx.lineWidth = width / 4;

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
        //różnica czasowa między klatkami, w tym przypadku będzie użyta do równomiernym zanikaniu konstelacji
        this.delta = now - this.lastUpdate;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height); //clear canvas


        //komenda wyznaczająca kod, który będzie się wykonywał 60 razy na sekundę domyślnie(60fps) i co ma się rysować po kolei
        this.drawStars();
        this.updateStar();

        this.drawConstellation();
        this.updateConstallation()

          //wyznacza czas do zmiany konstelacji
          if(now - this.lastConstellation > this.nextConstellation){
            this.lastConstellation = now;
            this.nextConstellation = Math.random() * 3000 + 1000;
            this.generateRandomConstellation();
        }


        this.drawOverLayer();

        this.lastUpdate = now;
        window.requestAnimationFrame((now) => this.draw(now))
    }

    runForestRun() {
        //w tym kodzie wywołuje pozostałe funkcje
        this.initCanvas();
        this.starTable(500);
        this.generateRandomConstellation();
        this.draw(0);
    }
}

const sky = new Sky(document.querySelector('#canvas'));
sky.runForestRun()