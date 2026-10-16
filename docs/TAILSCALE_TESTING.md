# Private live API verification

Current live status: **BLOCKED**. Environment policy reports `vpn_configured:false`; no backend URL, WordPress staging address or matching secret/variable binding was supplied. No address was guessed and no live API result is claimed. Offline fixtures and disposable WordPress tests are separate evidence.

## Configure the authorized connection

1. Start the Windows PC, Laragon/Apache/PHP 8.3 and its existing catalog database. Enable the platform-managed Tailscale connection, with access limited to the required backend host/port. Do not install a second Tailscale client in the cloud task.
2. Supply the actual complete API base URL through environment settings (`SW_PRODUCT_API_BASE_URL` for the live test command), including any project subdirectory and `/api`. Credentials, if required, belong in approved environment secret settings, never chat or source control.
3. Permit that exact destination through the environment's HTTP policy and Tailnet ACL. Retain the inherited HTTP(S) proxy and CA trust. No Funnel, public tunnel, MySQL forwarding, import or admin endpoint is required.
4. On the PC, verify Apache binds to the authorized interface, Windows Firewall allows the required connection, and the actual URL reaches the public API entrypoint. Different document roots/rewrite configurations may need different prefixes. Do not assume the project's directory name is the URL prefix.

## Bounded transport checks

Use the supplied value; these commands do not invent a host:

```bash
: "${SW_PRODUCT_API_BASE_URL:?Set the actual authorized API base URL}"
curl --fail-with-body --show-error --max-time 20 \
  --header 'Accept: application/json' \
  "${SW_PRODUCT_API_BASE_URL%/}/health"
curl --fail-with-body --show-error --max-time 20 \
  --header 'Accept: application/json' \
  "${SW_PRODUCT_API_BASE_URL%/}/tree"
```

Use normal proxy routing even for private IPs. Do not disable certificate verification, bypass a policy denial, print authentication headers, scan addresses or expose database ports. Executor DNS alone is not authoritative for proxy-resolved Tailnet hosts. A 403 destination denial needs a policy/ACL correction; DNS errors, connection refusal and timeouts need separate host/service diagnosis. Retry only after a meaningful configuration change; do not loop indefinitely.

## PHP / WordPress contract smoke

On an authorized **non-production WordPress staging/test instance**, configure the actual base as `SUPERWORLD_PRODUCT_API_BASE_URL`. `SUPERWORLD_ALLOW_PRIVATE_API=true` permits the single configured HTTP/private base only outside production; production needs its own reachable HTTPS backend. The public website must not depend on the developer PC staying online.

```bash
SW_PRODUCT_API_BASE_URL="$SW_PRODUCT_API_BASE_URL" SW_ALLOW_PRIVATE_API=1 \
  php superworld-core/tests/php/live.php /actual/path/to/wordpress
```

The script reads health/tree, derives category/series paths from that response, checks resolve/category/series/fields, paginated parts, facets, an available filter value and search using returned data. It performs no catalog writes. A second page/filter scenario with insufficient actual records is reported NOT TESTED rather than passed.

In Codex Cloud, WordPress HTTP requests also need the platform proxy and trusted CA configured in the isolated test host. WordPress uses its documented `WP_PROXY_HOST` / `WP_PROXY_PORT` / `WP_PROXY_BYPASS_HOSTS` constants, not necessarily shell proxy variables. Inner Docker containers need the runtime's reachable proxy and a read-only trusted CA bundle; retain verification. See the cloud runtime skill's networking/Docker guidance. Do not bake session proxy settings or certificates into this plugin ZIP. A standard production deployment uses its own WordPress/network trust configuration.

Once live adapter checks pass, install the ZIP in authorized staging, insert `[superworld_catalog]`, choose an API-returned series path for `[superworld_parts]`, and verify filtering, pagination and inquiry selections in published pages and Elementor preview. Record actual versions, URL prefix (without credentials), source SHAs and outcomes in `docs/TESTING.md`.
