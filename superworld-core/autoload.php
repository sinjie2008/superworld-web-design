<?php
declare(strict_types=1);

// Small PSR-4 loader; deployment does not require Composer or vendor packages.
spl_autoload_register(static function (string $class): void {
    $prefix = 'Superworld\\Core\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    if (preg_match('/^[A-Za-z0-9_\\\\]+$/D', $relative) !== 1) {
        return;
    }
    $file = __DIR__ . '/src/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($file)) {
        require_once $file;
    }
});
