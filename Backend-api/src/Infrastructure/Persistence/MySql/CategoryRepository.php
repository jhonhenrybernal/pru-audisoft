<?php

namespace App\Infrastructure\Persistence\MySql;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;

final class CategoryRepository
{
    public function __construct(private Connection $db) {}

    public function list(): array
    {
        // Ajusta el nombre del SP si es distinto
        return $this->db->fetchAllAssociative('CALL spCategory_List()');
    }

    public function create(string $name): int
    {
        $row = $this->db->fetchAssociative(
            'CALL spCategory_Create(?)',
            [$name]
        );

        return (int)($row['id'] ?? $row['Id'] ?? 0);
    }

    public function update(int $id, string $name): void
    {
        $this->db->executeStatement(
            'CALL spCategory_Update(?, ?)',
            [$id, $name]
        );
    }

    public function delete(int $id): void
    {
        $this->db->executeStatement('CALL spCategory_Delete(?)', [$id]);
    }

    public function paginated(int $page, int $pageSize): array
    {
        $offset = ($page - 1) * $pageSize;

        $items = $this->db->fetchAllAssociative(
            'SELECT
                c.id,
                c.name
             FROM categories c
             ORDER BY c.id
             LIMIT :limit OFFSET :offset',
            [
                'limit'  => $pageSize,
                'offset' => $offset,
            ],
            [
                'limit'  => ParameterType::INTEGER,
                'offset' => ParameterType::INTEGER,
            ]
        );

        $total = (int) $this->db->fetchOne('SELECT COUNT(*) FROM categories');

        return [
            'items'    => $items,
            'total'    => $total,
            'page'     => $page,
            'pageSize' => $pageSize,
        ];
    }

    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM categories WHERE LOWER(name) = LOWER(:name)';
        $params = ['name' => $name];
        $types  = [];

        if ($excludeId !== null) {
            $sql .= ' AND id <> :id';
            $params['id'] = $excludeId;
            $types['id']  = ParameterType::INTEGER;
        }

        $count = (int) $this->db->fetchOne($sql, $params, $types);
        return $count > 0;
    }
}
