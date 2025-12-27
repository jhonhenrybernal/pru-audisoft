<?php
namespace App\Controller;

use App\Application\Service\SiteService;
use App\Application\Service\UrlChecker;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class SiteController
{
    public function __construct(private SiteService $service,private UrlChecker $checkUrl) {}

    #[Route('/api/sites', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $pageSize = max(1, min(100, (int) $request->query->get('pageSize', 10)));

        // Igual que en CategoryController
        $result = $this->service->paginatedList($page, $pageSize);

        return new JsonResponse($result);
    }

    #[Route('/api/sites', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $id = $this->service->create(
            $data['name'] ?? '',
            $data['url'] ?? '',
            (int)($data['categoryId'] ?? 0)
        );

        return new JsonResponse(['id' => $id], 201);
    }

    #[Route('/api/sites/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        if (!$this->urlChecker->isReachable($url)) {
            return new JsonResponse([
                'message' => 'La URL no responde o no existe.'
            ], 409);
        }
        $this->service->update(
            $id,
            $data['name'] ?? '',
            $data['url'] ?? '',
            (int)($data['categoryId'] ?? 0)
        );

        return new JsonResponse(null, 204);
    }

    #[Route('/api/sites/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $this->service->delete($id);
            return new JsonResponse(null, 204);
        } catch (\Doctrine\DBAL\Exception\DriverException $e) {
            return new JsonResponse([
                'message' => 'No se puede borrar la categoría porque está en uso.'
            ], 409);
        }
    }
}
