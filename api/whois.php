<?php
/**
 * Host Baran - WHOIS API
 * Checks domain availability
 * 
 * Usage: GET /api/whois.php?domain=example.com
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

// Rate limiting (simple file-based)
$rateLimitFile = __DIR__ . '/../data/rate_limits.json';
$maxRequestsPerMinute = 60;

// Get and sanitize domain parameter
$domain = isset($_GET['domain']) ? filter_input(INPUT_GET, 'domain', FILTER_SANITIZE_STRING) : '';

if (empty($domain)) {
    http_response_code(400);
    echo json_encode(['error' => 'Domain parameter is required']);
    exit;
}

// Validate domain format
if (!validateDomain($domain)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid domain format']);
    exit;
}

// Normalize domain
$domain = strtolower(trim($domain));

// Check rate limit
if (!checkRateLimit($rateLimitFile, $maxRequestsPerMinute)) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please try again later.']);
    exit;
}

// Mock WHOIS lookup (in production, integrate with real WHOIS provider)
$result = mockWhoisLookup($domain);

// Return JSON response
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

/**
 * Validate domain name format
 * @param string $domain
 * @return bool
 */
function validateDomain($domain) {
    // Basic validation
    if (strlen($domain) < 3 || strlen($domain) > 253) {
        return false;
    }
    
    // Check for valid characters
    if (!preg_match('/^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/i', $domain)) {
        return false;
    }
    
    // Check for consecutive hyphens at positions 3-4 (IDN check)
    if (preg_match('/^xn--/', $domain) && strpos($domain, '--', 2) !== false) {
        return false;
    }
    
    return true;
}

/**
 * Simple rate limiting implementation
 * @param string $file
 * @param int $maxRequests
 * @return bool
 */
function checkRateLimit($file, $maxRequests) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $currentTime = time();
    $windowStart = $currentTime - 60; // 1 minute window
    
    // Load existing data
    $data = [];
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $data = json_decode($content, true) ?: [];
    }
    
    // Clean old entries
    foreach ($data as $key => $timestamps) {
        $data[$key] = array_filter($timestamps, function($ts) use ($windowStart) {
            return $ts > $windowStart;
        });
    }
    
    // Check current IP
    if (!isset($data[$ip])) {
        $data[$ip] = [];
    }
    
    if (count($data[$ip]) >= $maxRequests) {
        // Save updated data
        file_put_contents($file, json_encode($data));
        return false;
    }
    
    // Add current request
    $data[$ip][] = $currentTime;
    file_put_contents($file, json_encode($data));
    
    return true;
}

/**
 * Mock WHOIS lookup
 * In production, replace with real WHOIS provider integration
 * @param string $domain
 * @return array
 */
function mockWhoisLookup($domain) {
    // Extract TLD
    $parts = explode('.', $domain);
    $tld = end($parts);
    
    // Simulate some domains as registered
    $registeredDomains = [
        'google.com',
        'facebook.com',
        'amazon.com',
        'test.com',
        'example.com',
        'demo.com'
    ];
    
    $isRegistered = in_array($domain, $registeredDomains);
    
    // Generate suggestions for registered domains
    $suggestions = [];
    if ($isRegistered) {
        $name = str_replace('.' . $tld, '', $domain);
        $alternativeTlds = ['com', 'net', 'org', 'ir'];
        
        foreach ($alternativeTlds as $altTld) {
            if ($altTld !== $tld) {
                $suggestions[] = [
                    'domain' => $name . '.' . $altTld,
                    'available' => !in_array($name . '.' . $altTld, $registeredDomains)
                ];
            }
        }
    }
    
    // Price mapping (in Tomans)
    $prices = [
        'com' => 2100000,
        'net' => 3500000,
        'org' => 3100000,
        'ir' => 85000
    ];
    
    $price = $prices[$tld] ?? 2100000;
    
    return [
        'domain' => $domain,
        'available' => !$isRegistered,
        'registered' => $isRegistered,
        'price' => $price,
        'currency' => 'IRT',
        'suggestions' => $suggestions,
        'timestamp' => date('c')
    ];
}

/**
 * Real WHOIS lookup (placeholder for future implementation)
 * This would integrate with a WHOIS provider API
 * 
 * Example providers:
 * - WhoisXML API
 * - DomainTools
 * - RDAP (Registration Data Access Protocol)
 */
function realWhoisLookup($domain) {
    // TODO: Implement real WHOIS lookup
    // Example using cURL:
    /*
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.whoisprovider.com/v1/whois?domain=" . urlencode($domain));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer YOUR_API_KEY',
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        return [
            'available' => $data['available'] ?? false,
            'registered' => !($data['available'] ?? false),
            'registrar' => $data['registrar'] ?? null,
            'expiryDate' => $data['expiryDate'] ?? null
        ];
    }
    */
    
    return null;
}
