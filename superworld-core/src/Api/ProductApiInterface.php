<?php
declare(strict_types=1);

namespace Superworld\Core\Api;

/** A replaceable, read-only catalog boundary. Results contain decoded data only. */
interface ProductApiInterface
{
    public function request(string $operation, array $arguments = []): array|\WP_Error;
}
