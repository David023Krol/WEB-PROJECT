const vysledkyElement = document.getElementById('vysledky');
const filterSection = document.getElementById('auta-section');
const autaSection = document.getElementById('auta');
const detailView = document.getElementById('detail-auto-view');

let vsechnaAuta = [];
let aktualniAuto = null; // Proměnná pro uložení detailu aktuálního auta
let aktualniIndexFotky = 0; // Index aktuálně zobrazené fotky
let aktualniTypVozidla = 'osobni'; // Aktuálně vybraný typ vozidla

// --- DYNAMICKÉ PLNĚNÍ DROPDOWN MODELU ---
function aktualizujModely() {
    const vybraneZnacky = Array.from(document.querySelectorAll('.brand-checkboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    const modelSelect = document.getElementById('input-model');
    
    // Získáme všechny modely, které odpovídají vybraným značkám
    const dostupneModely = new Set();
    vsechnaAuta.forEach(auto => {
        if (vybraneZnacky.length === 0 || vybraneZnacky.includes(auto.znacka)) {
            dostupneModely.add(auto.model);
        }
    });
    
    const puvodniHodnota = modelSelect.value;
    modelSelect.innerHTML = '<option value="">Model</option>';
    
    Array.from(dostupneModely).sort().forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });
    
    // Obnovíme vybranou hodnotu, pokud existuje
    modelSelect.value = puvodniHodnota;
}

let dostupneZnackyZAPI = []; // Globální proměnná pro uchování dostupných značek

// --- AKTUALIZACE DOSTUPNÝCH ZNAČEK PODLE TYPU VOZIDLA ---
function aktualizujDostupneZnacky() {
    const znackyContainer = document.getElementById('znacka-checkbox-filtry');
    
    console.log('Dostupné značky z API:', dostupneZnackyZAPI);
    
    // Aktualizuje viditelnost checkboxů na základě dostupných značek
    znackyContainer.querySelectorAll('.brand-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const znacka = checkbox.value;
        
        if (dostupneZnackyZAPI.includes(znacka)) {
            item.style.display = 'block';
            // Neresettuj checkbox, nech uživatele vybrat!
        } else {
            item.style.display = 'none';
            checkbox.checked = false; // Jen když není dostupná, pak ji odznač
        }
    });
}

// --- AKTUALIZACE DOSTUPNÝCH KAROSERIÍ PODLE TYPU VOZIDLA ---
function aktualizujDostupneKaroserie() {
    const karoserieSelect = document.getElementById('input-karoserie');
    const dostupneKaroserie = new Set();
    
    // Sesbírá všechny dostupné karoserie z aktuálních dat
    vsechnaAuta.forEach(auto => {
        if (auto.karoserie) {
            dostupneKaroserie.add(auto.karoserie);
        }
    });
    
    // Aktualizuje select s karoserií
    const puvodniHodnota = karoserieSelect.value;
    karoserieSelect.innerHTML = '<option value="">Karoserie</option>';
    
    Array.from(dostupneKaroserie).sort().forEach(karoserie => {
        const option = document.createElement('option');
        option.value = karoserie;
        option.textContent = karoserie;
        karoserieSelect.appendChild(option);
    });
    
    karoserieSelect.value = puvodniHodnota;
}

// --- RESETOVÁNÍ VŠECH FILTRŮ ---
function resetujVsechnyFiltry() {
    // Reset checkboxů značek
    document.querySelectorAll('.brand-checkboxes input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset select polí
    document.getElementById('input-model').value = '';
    document.getElementById('input-cena-min').value = '0';
    document.getElementById('input-cena-max').value = '0';
    document.getElementById('input-rok-od').value = '';
    document.getElementById('input-karoserie').value = '';
    document.getElementById('input-palivo').value = '';
}

// --- FUNKCE PRO NAVIGACI V HEADERU ---
function zobrazStranku(strankaId) {
    const filtrySection = document.getElementById('filtry');
    const autaSection = document.getElementById('auta');
    const detailView = document.getElementById('detail-auto-view');
    const onas = document.getElementById('onas');
    const kontakt = document.getElementById('kontakt');
    
    // Odstraň třídu 'active' ze všech overlay stránek
    if (onas) onas.classList.remove('active');
    if (kontakt) kontakt.classList.remove('active');
    
    // Skryj všechny sekce
    if (filtrySection) filtrySection.style.display = 'none';
    if (autaSection) autaSection.style.display = 'none';
    if (detailView) detailView.style.display = 'none';
    if (onas) onas.style.display = 'none';
    if (kontakt) kontakt.style.display = 'none';
    
    // Zobraz zvolenou sekci
    if (strankaId === 'home') {
        if (filtrySection) filtrySection.style.display = 'block';
        if (autaSection) autaSection.style.display = 'block';
        nactiAuta();
    } else if (strankaId === 'onas') {
        if (onas) {
            onas.style.display = 'block';
            onas.classList.add('active');
        }
    } else if (strankaId === 'kontakt') {
        if (kontakt) {
            kontakt.style.display = 'block';
            kontakt.classList.add('active');
        }
    }
}

// --- FUNKCE PRO PŘEPÍNÁNÍ POHLEDŮ ---
function prepniNaSeznam() {
    filterSection.style.display = 'block';
    autaSection.style.display = 'block';
    detailView.style.display = 'none';
    
    // Scroll na sekci s filtry
    setTimeout(() => {
        document.getElementById('auta-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function prepniNaDetail() {
    filterSection.style.display = 'none';
    autaSection.style.display = 'none';
    detailView.style.display = 'block';
    
    // Scroll na detail auta
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
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


// --- ZOBRAZENÍ SEZNAMU (GRIDU) ---
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


// --- PŮVODNÍ FUNKCE (nactiAuta, filtrujAuta) ---
function nactiAuta(filtry = {}) {
    vysledkyElement.innerHTML = '<p>Načítám data z API...</p>';
    const query = new URLSearchParams(filtry).toString();

    fetch(`backend/api.php?${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(`PHP chyba: ${data.error}`);
            vsechnaAuta = data.auta;
            // Ulož dostupné značky z API
            dostupneZnackyZAPI = data.dostupneZnacky || [];
            // Aktualizujeme dropdown modelu hned jak máme data
            aktualizujModely();
            aktualizujDostupneZnacky();
            aktualizujDostupneKaroserie();
            prepniNaSeznam();
            zobrazAuta(vsechnaAuta);
        })
        .catch(error => {
            vysledkyElement.innerHTML = `<p class="chyba" style="color: red;">Chyba: ${error.message}.</p>`;
            prepniNaSeznam();
        });
}

function filtrujAuta() {
    console.log('filtrujAuta se spustila');
    const vybraneZnacky = Array.from(document.querySelectorAll('.brand-checkboxes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    console.log('Vybrané značky:', vybraneZnacky);
    
    // Aktualizujeme dostupné modely při změně značky
    aktualizujModely();
    
    const model = document.getElementById('input-model').value;
    const minCena = document.getElementById('input-cena-min').value;
    const maxCena = document.getElementById('input-cena-max').value;
    const rokOd = document.getElementById('input-rok-od').value;
    const karoserie = document.getElementById('input-karoserie').value;
    const palivo = document.getElementById('input-palivo').value;
    const najetoDo = document.getElementById('input-najeto-do').value;

    const filtry = { 
        typ: aktualniTypVozidla,
        znacka: vybraneZnacky.length > 0 ? vybraneZnacky.join(',') : '', 
        model: model, 
        min_cena: minCena, 
        max_cena: maxCena, 
        rok_od: rokOd, 
        karoserie: karoserie, 
        palivo: palivo,
        max_najeto: najetoDo
    };

    console.log('Filtry před smazáním prázdných:', filtry);
    
    // Smaž všechny prázdné filtry, ale zachovej "typ" vozidla
    Object.keys(filtry).forEach(key => {
        if (key === 'typ') return; // Nikdy nemazej typ
        if (filtry[key] === '' || filtry[key] === null || (key.includes('cena') && filtry[key] === '0')) {
            delete filtry[key];
        }
    });
    
    console.log('Filtry po smazání prázdných:', filtry);
    
    nactiAuta(filtry);
}

document.addEventListener('DOMContentLoaded', () => {
    nactiAuta(); 
    document.getElementById('tlacitko-filtr').addEventListener('click', filtrujAuta);

    // Delegovaný event listener pro checkboxy (funguje i pro dynamicky přidané prvky)
    document.getElementById('znacka-checkbox-filtry').addEventListener('change', function(event) {
        if (event.target.type === 'checkbox') {
            filtrujAuta();
        }
    });

    // Event listener pro ostatní filtry
    document.querySelectorAll('.filter-grid select').forEach(select => {
        select.addEventListener('change', filtrujAuta);
    });
    
    // Event listener pro přepínání typu vozidla (osobní/motorky)
    document.querySelectorAll('#typ-vozidla-filtry button').forEach(button => {
        button.addEventListener('click', function() {
            // Odstraň třídu active ze všech tlačítek
            document.querySelectorAll('#typ-vozidla-filtry button').forEach(btn => btn.classList.remove('active'));
            // Přidej třídu active k kliknutému tlačítku
            this.classList.add('active');
            // Nastav aktuální typ vozidla
            aktualniTypVozidla = this.getAttribute('data-typ');
            // Resetuj všechny filtry
            resetujVsechnyFiltry();
            // Načti nová data bez filtrů (budou se aktualizovat dostupné filtry)
            nactiAuta({ typ: aktualniTypVozidla });
        });
    });
});