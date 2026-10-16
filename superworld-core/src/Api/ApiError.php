<?php
declare(strict_types=1);

namespace Superworld\Core\Api;

/** Internal errors deliberately exclude upstream messages, bodies and URLs. */
final class ApiError
{
    public static function correlationId(): string
    {
        return wp_generate_uuid4();
    }

    public static function validCorrelationId(mixed $value): bool
    {
        return is_string($value)
            && preg_match('/\A[A-Za-z0-9][A-Za-z0-9._:-]{0,127}\z/D', $value) === 1;
    }

    public static function make(string $code, string $message, int $status, ?string $correlationId = null): \WP_Error
    {
        return new \WP_Error('superworld_api_' . $code, $message, [
            'status' => $status,
            'correlationId' => $correlationId ?? self::correlationId(),
        ]);
    }
}
