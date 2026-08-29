<?php
/**
 * Host Baran - Competitor Prices API
 * Loads competitor pricing data from JSON files
 * 
 * Usage: GET /api/competitor-prices.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Configuration
$competitorsDir = __DIR__ . '/../data/competitors/';
$maxCompetitors = 5; // Limit number of competitors to display

// Load all competitor data
$competitors = loadCompetitors($competitorsDir, $maxCompetitors);

// Build response
$response = [
    'success' => true,
    'competitors' => $competitors,
    'count' => count($competitors),
    'last_updated' => date('c'),
    'currency' => 'IRT',
    'disclaimer' => 'قیمت‌های نمایش‌داده‌شده براساس آخرین داده در دسترس تهیه شده‌اند و ممکن است توسط ارائه‌دهندگان در هر زمان تغییر کنند.'
];

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

/**
 * Load competitor data from JSON files
 * @param string $dir
 * @param int $maxCompetitors
 * @return array
 */
function loadCompetitors($dir, $maxCompetitors) {
    $competitors = [];
    
    // Check if directory exists
    if (!is_dir($dir)) {
        return $competitors;
    }
    
    // Get all JSON files
    $jsonFiles = glob($dir . '*.json');
    
    if (empty($jsonFiles)) {
        return $competitors;
    }
    
    // Limit number of files
    $jsonFiles = array_slice($jsonFiles, 0, $maxCompetitors);
    
    foreach ($jsonFiles as $file) {
        $data = loadJsonFile($file);
        
        if ($data && isValidCompetitorData($data)) {
            $competitors[] = [
                'site_name' => sanitizeInput($data['site_name'] ?? basename($file, '.json')),
                'last_updated' => $data['last_updated'] ?? date('c'),
                'currency' => $data['currency'] ?? 'IRT',
                'domains' => [
                    'com' => $data['domains']['com'] ?? null,
                    'net' => $data['domains']['net'] ?? null,
                    'org' => $data['domains']['org'] ?? null,
                    'ir' => $data['domains']['ir'] ?? null
                ]
            ];
        }
    }
    
    return $competitors;
}

/**
 * Load and parse JSON file
 * @param string $filePath
 * @return array|null
 */
function loadJsonFile($filePath) {
    if (!file_exists($filePath)) {
        return null;
    }
    
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('JSON Error in ' . $filePath . ': ' . json_last_error_msg());
        return null;
    }
    
    return $data;
}

/**
 * Validate competitor data structure
 * @param array $data
 * @return bool
 */
function isValidCompetitorData($data) {
    if (!is_array($data)) {
        return false;
    }
    
    // Must have domains array
    if (!isset($data['domains']) || !is_array($data['domains'])) {
        return false;
    }
    
    // Must have at least one price
    $hasPrice = false;
    foreach (['com', 'net', 'org', 'ir'] as $tld) {
        if (isset($data['domains'][$tld]) && is_numeric($data['domains'][$tld])) {
            $hasPrice = true;
            break;
        }
    }
    
    return $hasPrice;
}

/**
 * Sanitize input string
 * @param string $str
 * @return string
 */
function sanitizeInput($str) {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}

/**
 * Future: Live scraper interface
 * This would be implemented to fetch real-time prices from competitor websites
 */
class CompetitorPriceScraper {
    
    /**
     * Fetch price from a competitor website
     * @param string $url
     * @param string $domain
     * @return float|null
     */
    public function fetchPrice($url, $domain) {
        // TODO: Implement web scraping logic
        // This would use cURL or file_get_contents with proper parsing
        
        /*
        Example implementation:
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'HostBaran/1.0');
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            return $this->parsePrice($html, $domain);
        }
        */
        
        return null;
    }
    
    /**
     * Parse price from HTML
     * @param string $html
     * @param string $domain
     * @return float|null
     */
    private function parsePrice($html, $domain) {
        // TODO: Implement HTML parsing logic
        // Would use DOMDocument or regex to extract price
        
        return null;
    }
}
