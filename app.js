const vysledkyElement = document.getElementById('vysledky');
const filtrySection = document.getElementById('filtry');
const autaSection = document.getElementById('auta');
const detailView = document.getElementById('detail-auto-view');

let vsechnaAuta = [];

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


// --- ZOBRAZENÍ DETAILU AUTA (NOVÁ STRÁNKA) ---
function zobrazDetail(auto) {
    prepniNaDetail();
    detailView.innerHTML = ''; 

    const cenaFormat = (auto.cena || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 });
    const najetoFormat = (auto.najeto || 0).toLocaleString('cs-CZ');

    detailView.innerHTML = `
        <button id="zpet-na-seznam" class="back-button">← Zpět na seznam aut</button>
        
        <div class="auto-detail-header">
            <h1>${auto.znacka} ${auto.model} (${auto.rok || 'N/A'})</h1>
            <p class="detail-price-big">${cenaFormat}</p>
        </div>

        <div class="auto-detail-grid">
            
            <div class="detail-gallery">
                <img src="${auto.foto_url || 'img/placeholder_default.png'}" alt="Foto ${auto.znacka} ${auto.model}" class="main-detail-photo">
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

        autoKarta.innerHTML = `
            <div class="auto-karta-foto-container">
                <img src="${auto.foto_url || 'img/placeholder_default.png'}" alt="Foto ${auto.znacka}" class="auto-karta-foto">
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