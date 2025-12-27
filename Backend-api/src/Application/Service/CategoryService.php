<?php
namespace App\Application\Service;

use App\Infrastructure\Persistence\MySql\CategoryRepository;

final class CategoryService
{
    public function __construct(private CategoryRepository $repo) {}

    public function list(): array
    {
        return $this->repo->list();
    }

    public function create(string $name): int
    {
        $name = trim($name);
        if ($name === '') {
            throw new \InvalidArgumentException('El nombre es requerido.');
        }

        if ($this->repo->existsByName($name)) {
            throw new \InvalidArgumentException('Ya existe una categoría con ese nombre.');
        }

        return $this->repo->create($name);
    }


    public function delete(int $id): void
    {
        $this->repo->delete($id); // si está en uso, SQL Server lanzará error (SP/Trigger)
    }

    public function update(int $id, string $name): void
    {
        $name = trim($name);
        if ($name === '') {
            throw new \InvalidArgumentException('El nombre es requerido.');
        }

        if ($this->repo->existsByName($name, $id)) {
            throw new \InvalidArgumentException('Ya existe otra categoría con ese nombre.');
        }

        $this->repo->update($id, $name);
    }

    public function paginatedList(int $page, int $pageSize): array
    {
        return $this->repo->paginated($page, $pageSize);
    }
}
