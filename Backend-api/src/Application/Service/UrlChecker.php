<?php
namespace App\Application\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class UrlChecker
{
    public function __construct(private HttpClientInterface $client) {}

    public function isReachable(string $url): bool
    {
        try {
            $response = $this->client->request('HEAD', $url, [
                'timeout' => 5,
                'max_redirects' => 5,
            ]);

            $status = $response->getStatusCode();
            return $status >= 200 && $status < 400;
        } catch (\Throwable $e) {
            // DNS, timeout, SSL, etc.
            return false;
        }
    }
}

