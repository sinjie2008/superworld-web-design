<?php
declare(strict_types=1);

namespace Superworld\Core\Rest;

final class RateBudget
{
    public static function allow(): bool
    {
        $window = intdiv(time(), 60);
        $limit = max(1, min(600, (int) apply_filters('superworld_core/rest_budget', 90)));
        if (wp_using_ext_object_cache()) {
            $key = 'rest:' . $window;
            wp_cache_add($key, 0, 'superworld-core', 65);
            $count = wp_cache_incr($key, 1, 'superworld-core');
            return $count !== false && $count <= $limit;
        }
        $state = get_transient('superworld_rest_budget');
        $count = is_array($state) && ($state['window'] ?? null) === $window ? (int) $state['count'] + 1 : 1;
        set_transient('superworld_rest_budget', ['window' => $window, 'count' => $count], 65);
        return $count <= $limit;
    }
}
