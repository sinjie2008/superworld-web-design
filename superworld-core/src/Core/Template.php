<?php
declare(strict_types=1);

namespace Superworld\Core\Core;

final class Template
{
    public static function render(string $name, array $data): string
    {
        if (!in_array($name, ['catalog', 'parts', 'error'], true)) {
            return '';
        }
        ob_start();
        try {
            // Templates receive a single data array; no user-controlled include/extract.
            require SUPERWORLD_CORE_PATH . 'templates/' . $name . '.php';
            return (string) ob_get_contents();
        } finally {
            ob_end_clean();
        }
    }
}
