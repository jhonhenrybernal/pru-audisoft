<?php
namespace App\Application\Service;

use App\Infrastructure\Persistence\MySql\SiteRepository;

final class SiteService
{
    public function __construct(private SiteRepository $repo) {}

    public function list(): array
    {
        return $this->repo->list();
    }

    public function create(string $name, string $url, int $categoryId): int
    {
        $name = trim($name);
        $url  = trim($url);

        if ($name === '') {
            throw new \InvalidArgumentException("El nombre es requerido.");
        }

        if ($url === '') {
            throw new \InvalidArgumentException("La URL es requerida.");
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new \InvalidArgumentException("URL inválida.");
        }

        if ($this->repo->existsByName($name)) {
            throw new \InvalidArgumentException('Ya existe un sitio con ese nombre.');
        }
        if ($this->repo->existsByUrl($url)) {
            throw new \InvalidArgumentException('Ya existe un sitio con esa URL.');
        }

        if ($categoryId <= 0) {
            throw new \InvalidArgumentException("La categoría es requerida.");
        }

        return $this->repo->create($name, $url, $categoryId);
    }

    public function update(int $id, string $name, string $url, int $categoryId): void
    {
        $name = trim($name);
        $url  = trim($url);

        if ($name === '') {
            throw new \InvalidArgumentException("El nombre es requerido.");
        }

        if ($url === '') {
            throw new \InvalidArgumentException("La URL es requerida.");
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new \InvalidArgumentException("URL inválida.");
        }

        if ($this->repo->existsByName($name, $id)) {
            throw new \InvalidArgumentException('Ya existe otro sitio con ese nombre.');
        }

        if ($this->repo->existsByUrl($url, $id)) {
            throw new \InvalidArgumentException('Ya existe otro sitio con esa URL.');
        }
        
        if ($categoryId <= 0) {
            throw new \InvalidArgumentException("La categoría es requerida.");
        }

        $this->repo->update($id, $name, $url, $categoryId);
    }

    public function delete(int $id): void
    {
        $this->repo->delete($id);
    }

    public function paginatedList(int $page, int $pageSize): array
    {
        return $this->repo->paginated($page, $pageSize);
    }
}
