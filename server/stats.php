<?php
declare(strict_types=1);
// PHP 7.4+. Solo agregados públicos; almacenamiento fuera de public_html.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

function stop(int $status): void {
    http_response_code($status);
    echo '{}';
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'GET' && $method !== 'POST') {
    header('Allow: GET, POST');
    stop(405);
}
if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') stop(403);
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = parse_url($_SERVER['HTTP_ORIGIN']);
    $host = parse_url('https://' . ($_SERVER['HTTP_HOST'] ?? ''));
    if (!$origin || !$host || strtolower($origin['host'] ?? '') !== strtolower($host['host'] ?? '') ||
        ($origin['port'] ?? null) !== ($host['port'] ?? null)) stop(403);
}
$event = null;
if ($method === 'POST') {
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') stop(415);
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 256) stop(413);
    $body = file_get_contents('php://input', false, null, 0, 257);
    if ($body === false || strlen($body) > 256) stop(413);
    $event = json_decode($body, true);
    if (!is_array($event) || count($event) !== 2 ||
        !isset($event['type'], $event['id']) || !is_string($event['type']) || !is_string($event['id']) ||
        !in_array($event['type'], ['visit', 'complete'], true) ||
        !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/D', $event['id'])) stop(400);
}

try {
    // Buscar el public_html real, también si la app está en /evento/.
    $public = realpath(__DIR__);
    while ($public !== false && basename($public) !== 'public_html') {
        $parent = dirname($public);
        if ($parent === $public) throw new RuntimeException('No public_html');
        $public = $parent;
    }
    if ($public === false) throw new RuntimeException('No public_html');
    $private = dirname($public) . DIRECTORY_SEPARATOR . 'match-noveduc-private';
    if (!is_dir($private) && !mkdir($private, 0700, true) && !is_dir($private)) throw new RuntimeException('Directory');
    $resolved = realpath($private);
    if ($resolved === false || dirname($resolved) !== dirname($public) || $resolved === $public) throw new RuntimeException('Unsafe directory');
    $file = $resolved . DIRECTORY_SEPARATOR . 'statistics.json';
    // Archivo de bloqueo separado: rename atómico no invalida el bloqueo.
    $lock = fopen($resolved . DIRECTORY_SEPARATOR . 'statistics.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Lock');
    $state = ['visitors' => 0, 'matchComplete' => 0, 'seen' => []];
    if (file_exists($file)) {
        $state = json_decode((string)file_get_contents($file), true);
        if (!is_array($state) || !isset($state['visitors'], $state['matchComplete'], $state['seen']) ||
            !is_int($state['visitors']) || $state['visitors'] < 0 ||
            !is_int($state['matchComplete']) || $state['matchComplete'] < 0 || !is_array($state['seen']))
            throw new RuntimeException('Invalid storage');
    }
    if ($event !== null) {
        $fingerprint = hash('sha256', $event['type'] . ':' . $event['id']);
        if (!isset($state['seen'][$fingerprint])) {
            $state[$event['type'] === 'visit' ? 'visitors' : 'matchComplete']++;
            $state['seen'][$fingerprint] = true;
            $encoded = json_encode($state, JSON_THROW_ON_ERROR);
            $temp = tempnam($resolved, 'stats-');
            if ($temp === false) throw new RuntimeException('Temp');
            chmod($temp, 0600);
            if (file_put_contents($temp, $encoded) !== strlen($encoded) || !rename($temp, $file)) {
                @unlink($temp);
                throw new RuntimeException('Write');
            }
        }
    }
    $totals = ['visitors' => $state['visitors'], 'matchComplete' => $state['matchComplete']];
    flock($lock, LOCK_UN);
    fclose($lock);
    echo json_encode($totals, JSON_THROW_ON_ERROR);
} catch (Throwable $error) {
    // No exponer rutas, huellas ni detalles del servidor. Nunca reiniciar datos dañados.
    stop(503);
}
