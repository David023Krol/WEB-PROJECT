<?php
// VYPÍNÁME CHYBOVÉ HLÁŠENÍ, ABY NEKAZILO JSON VÝSTUP (PŘÍČINA VAŠÍ CHYBY <)
error_reporting(0);
ini_set('display_errors', 0);

// Nastavení hlavičky pro JSON odpověď
header('Content-Type: application/json');

// --- ZÁKLADNÍ NAČTENÍ DAT ---

// Doporučená oprava cesty pomocí __DIR__ pro spolehlivé spuštění
$json_file_path = __DIR__ . '/../data/auta.json';

// KONTROLA DAT: Pokud soubor neexistuje, vrátíme chybu
if (!file_exists($json_file_path)) {
    http_response_code(500);
    echo json_encode(['error' => 'Data soubor (auta.json) nenalezen na cestě: ' . $json_file_path]);
    exit;
}

// Načtení a dekódování dat
$json_data = file_get_contents($json_file_path);
$data = json_decode($json_data, true);

// KONTROLA DEKÓDOVÁNÍ JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Chyba dekódování JSON souboru: ' . json_last_error_msg()]);
    exit;
}

$vsechna_auta = $data['auta'] ?? [];

// --- ZPRACOVÁNÍ FILTRŮ Z GET PARAMETRŮ ---
$znacka_input = $_GET['znacka'] ?? null;
// Rozdělíme CSV string značek na PHP pole pro kontrolu
$znacky = $znacka_input ? explode(',', $znacka_input) : null; 

$min_cena = $_GET['min_cena'] ?? null; 
$max_cena = $_GET['max_cena'] ?? null; 
$rok_od = $_GET['rok_od'] ?? null;
$karoserie = $_GET['karoserie'] ?? null;
$palivo = $_GET['palivo'] ?? null;

// --- APLIKACE FILTRŮ ---
$filtrovana_auta = array_filter($vsechna_auta, function($auto) use ($znacky, $min_cena, $max_cena, $rok_od, $karoserie, $palivo) {
    $cena = (int)($auto['cena'] ?? 0); // Bezpečné získání ceny
    $rok = (int)($auto['rok'] ?? 0); // Bezpečné získání roku
    
    // Filtr 1: Značka
    if ($znacky && !in_array($auto['znacka'], $znacky)) {
        return false;
    }
    
    // Filtr 2: Minimální cena 
    if ($min_cena !== null && $cena < (int)$min_cena) {
        return false;
    }

    // Filtr 3: Maximální cena 
    if ($max_cena !== null && $cena > (int)$max_cena) {
        return false;
    }

    // Filtr 4: Rok výroby od
    if ($rok_od !== null && $rok < (int)$rok_od) {
        return false;
    }

    // Filtr 5: Karoserie
    if ($karoserie && ($auto['karoserie'] ?? null) !== $karoserie) {
        return false;
    }
    
    // Filtr 6: Palivo
    if ($palivo && ($auto['palivo'] ?? null) !== $palivo) {
        return false;
    }

    return true; 
});

// Vrátíme filtrovaný seznam aut
echo json_encode([
    'auta' => array_values($filtrovana_auta)
]);
// Bez zavírací značky ?>