<?php
namespace App\Controller;

use App\Application\Service\CategoryService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;


final class CategoryController
{
    public function __construct(private CategoryService $service) {}

    #[Route('/api/categories', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $pageSize = max(1, min(100, (int) $request->query->get('pageSize', 10)));

        $result = $this->service->paginatedList($page, $pageSize);

        return new JsonResponse($result);
    }

    #[Route('/api/categories', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $id = $this->service->create($data['name'] ?? '');
        return new JsonResponse(['id' => $id], 201);
    }

    #[Route('/api/categories/{id}', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $name = $data['name'] ?? '';

        $this->service->update($id, $name);

        return new JsonResponse(null, 204);
    }

    #[Route('/api/categories/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->service->delete($id);
        return new JsonResponse(null, 204);
    }
}
