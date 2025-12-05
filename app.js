const vysledkyElement = document.getElementById('vysledky');
const filtrySection = document.getElementById('filtry');
const autaSection = document.getElementById('auta');
const detailView = document.getElementById('detail-auto-view');

let vsechnaAuta = [];
let aktualniAuto = null; // Proměnná pro uložení detailu aktuálního auta
let aktualniIndexFotky = 0; // Index aktuálně zobrazené fotky

// --- FUNKCE PRO PŘEPÍNÁNÍ POHLEDŮ ---
function prepniNaSeznam() {
    filtrySection.style.display = 'block';
    autaSection.style.display = 'block';
    detailView.style.display = 'none';
}

function prepniNaDetail() {
    filtrySection.style.display = 'none';
    autaSection.style.display = 'none';
    detailView.style.display = 'block';
}

// --- NOVÁ FUNKCE: ZMĚNA FOTKY V GALERII ---
function zmenFotku(smer) {
    if (!aktualniAuto || !aktualniAuto.galerie || aktualniAuto.galerie.length === 0) return;

    const pocetFotografií = aktualniAuto.galerie.length;
    
    // Nový index = (aktuální index + směr + počet) MODULO počet
    // Tím zajistíme, že se index "zacyklí" (posune se na konec/začátek)
    aktualniIndexFotky = (aktualniIndexFotky + smer + pocetFotografií) % pocetFotografií;
    
    const novaURL = aktualniAuto.galerie[aktualniIndexFotky];
    document.getElementById('hlavni-foto').src = novaURL;
    
    // Zobrazení indexu (např. 1/3)
    document.getElementById('foto-index').textContent = `${aktualniIndexFotky + 1} / ${pocetFotografií}`;
}


// --- ZOBRAZENÍ DETAILU AUTA (NOVÁ STRÁNKA) ---
function zobrazDetail(auto) {
    prepniNaDetail();
    detailView.innerHTML = ''; 
    aktualniAuto = auto; // Uložíme aktuální auto do globální proměnné
    aktualniIndexFotky = 0; // Vždy začínáme od první fotky

    const cenaFormat = (auto.cena || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 });
    const najetoFormat = (auto.najeto || 0).toLocaleString('cs-CZ');
    
    const pocatecniFotoURL = (auto.galerie && auto.galerie.length > 0) ? auto.galerie[0] : (auto.foto_url || 'img/placeholder_default.png');
    const pocetFotografií = (auto.galerie && auto.galerie.length) || 1;

    detailView.innerHTML = `
        <button id="zpet-na-seznam" class="back-button">← Zpět na seznam aut</button>
        
        <div class="auto-detail-header">
            <h1>${auto.znacka} ${auto.model} (${auto.rok || 'N/A'})</h1>
            <p class="detail-price-big">${cenaFormat}</p>
        </div>

        <div class="auto-detail-grid">
            
            <div class="detail-gallery">
                <div class="slider-container">
                    <img id="hlavni-foto" src="${pocatecniFotoURL}" alt="Foto ${auto.znacka} ${auto.model}" class="main-detail-photo">
                    
                    ${pocetFotografií > 1 ? `
                        <button id="slider-prev" class="slider-btn prev-btn">❮</button>
                        <button id="slider-next" class="slider-btn next-btn">❯</button>
                    ` : ''}
                    
                    <div id="foto-index" class="foto-index">${pocetFotografií > 1 ? `1 / ${pocetFotografií}` : ''}</div>
                </div>
            </div>

            <div class="detail-info-block">
                <h3>Základní informace</h3>
                <p><strong>Rok výroby:</strong> ${auto.rok || 'N/A'}</p>
                <p><strong>Karoserie:</strong> ${auto.karoserie || 'N/A'}</p>
                <p><strong>Palivo:</strong> ${auto.palivo || 'N/A'}</p>
                <p><strong>Najeto:</strong> ${najetoFormat} km</p>
                <p><strong>ID vozu:</strong> ${auto.id}</p>
            </div>
            
            <div class="detail-description">
                <h3>Popis vozidla</h3>
                <p>Jedná se o exkluzivní sportovní vůz ve špičkovém stavu. První majitel, kompletní servisní historie. Vůz je k vidění po předchozí domluvě v našem showroomu.</p>
            </div>
        </div>
    `;

    document.getElementById('zpet-na-seznam').addEventListener('click', prepniNaSeznam);
    
    // Přidání posluchačů na šipky po vygenerování HTML
    if (pocetFotografií > 1) {
        document.getElementById('slider-prev').addEventListener('click', () => zmenFotku(-1));
        document.getElementById('slider-next').addEventListener('click', () => zmenFotku(1));
    }
}


// --- ZOBRAZENÍ SEZNAMU (GRIDU) --- (Beze změny)
function zobrazAuta(auta) {
    vysledkyElement.innerHTML = ''; 

    if (auta.length === 0) {
        vysledkyElement.innerHTML = '<p>Nebylo nalezeno žádné auto podle filtru.</p>';
        return;
    }

    auta.forEach(auto => {
        const autoKarta = document.createElement('div');
        autoKarta.className = 'auto-karta';
        autoKarta.setAttribute('data-id', auto.id); 

        const cenaFormat = (auto.cena || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 });
        const najetoFormat = (auto.najeto || 0).toLocaleString('cs-CZ');
        const fotoSeznamURL = auto.foto_url || 'img/placeholder_default.png';

        autoKarta.innerHTML = `
            <div class="auto-karta-foto-container">
                <img src="${fotoSeznamURL}" alt="Foto ${auto.znacka}" class="auto-karta-foto">
            </div>

            <h3>${auto.znacka} ${auto.model} (${auto.rok || 'N/A'})</h3>
            <p>Karoserie: ${auto.karoserie || 'N/A'}</p>
            <p>Palivo: ${auto.palivo || 'N/A'}</p>
            <p>Najeto: ${najetoFormat} km</p>
            <p class="cena">${cenaFormat}</p>
        `;
        vysledkyElement.appendChild(autoKarta);
    });
    
    pridejPosluchaceKaret();
}

function pridejPosluchaceKaret() {
    document.querySelectorAll('.auto-karta').forEach(karta => {
        karta.style.cursor = 'pointer'; 
        karta.addEventListener('click', function() {
            const autoId = parseInt(this.getAttribute('data-id'));
            const detailAuta = vsechnaAuta.find(a => a.id === autoId);
            
            if (detailAuta) {
                zobrazDetail(detailAuta);
            }
        });
    });
}


// --- PŮVODNÍ FUNKCE (nactiAuta, filtrujAuta) --- (Beze změny)
function nactiAuta(filtry = {}) {
    vysledkyElement.innerHTML = '<p>Načítám data z API...</p>';
    const query = new URLSearchParams(filtry).toString();

    fetch(`backend/api.php?${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(`PHP chyba: ${data.error}`);
            vsechnaAuta = data.auta;
            prepniNaSeznam();
            zobrazAuta(vsechnaAuta);
        })
        .catch(error => {
            vysledkyElement.innerHTML = `<p class="chyba" style="color: red;">Chyba: ${error.message}.</p>`;
            prepniNaSeznam();
        });
}

function filtrujAuta() {
    const vybraneZnacky = Array.from(document.querySelectorAll('.brand-checkboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    const minCena = document.getElementById('input-cena-min').value;
    const maxCena = document.getElementById('input-cena-max').value;
    const rokOd = document.getElementById('input-rok-od').value;
    const karoserie = document.getElementById('input-karoserie').value;
    const palivo = document.getElementById('input-palivo').value;

    const filtry = { znacka: vybraneZnacky.join(','), min_cena: minCena, max_cena: maxCena, rok_od: rokOd, karoserie: karoserie, palivo: palivo };

    Object.keys(filtry).forEach(key => (filtry[key] === '' || filtry[key] === null || (key.includes('cena') && filtry[key] === '0')) && delete filtry[key]);
    
    nactiAuta(filtry);
}

document.addEventListener('DOMContentLoaded', () => {
    nactiAuta(); 
    document.getElementById('tlacitko-filtr').addEventListener('click', filtrujAuta);

    document.querySelectorAll('.filter-grid select, .brand-checkboxes input[type="checkbox"]').forEach(element => {
        element.addEventListener('change', filtrujAuta);
    });
});