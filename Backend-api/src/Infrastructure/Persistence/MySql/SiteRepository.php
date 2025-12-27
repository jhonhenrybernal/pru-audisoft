<?php

namespace App\Infrastructure\Persistence\MySql;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\ParameterType;

final class SiteRepository
{
    public function __construct(private Connection $db) {}

    public function list(): array
    {
        return $this->db->fetchAllAssociative('CALL spSite_List()');
    }

    public function create(string $name, string $url, int $categoryId): int
    {
        $row = $this->db->fetchAssociative(
            'CALL spSite_Create(?, ?, ?)',
            [$name, $url, $categoryId]
        );

        return (int)($row['id'] ?? $row['Id'] ?? 0);
    }

    public function update(int $id, string $name, string $url, int $categoryId): void
    {
        $this->db->executeStatement(
            'CALL spSite_Update(?, ?, ?, ?)',
            [$id, $name, $url, $categoryId]
        );
    }

    public function delete(int $id): void
    {
        $this->db->executeStatement('CALL spSite_Delete(?)', [$id]);
    }

    public function paginated(int $page, int $pageSize): array
    {
        $offset = ($page - 1) * $pageSize;

        $items = $this->db->fetchAllAssociative(
            'SELECT
                s.id,
                s.name,
                s.url,
                s.category_id AS categoryId,
                c.name       AS categoryName
             FROM sites s
             LEFT JOIN categories c ON c.id = s.category_id
             ORDER BY s.id
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

        $total = (int) $this->db->fetchOne('SELECT COUNT(*) FROM sites');

        return [
            'items'    => $items,
            'total'    => $total,
            'page'     => $page,
            'pageSize' => $pageSize,
        ];
    }

    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM sites WHERE LOWER(name) = LOWER(:name)';
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

    public function existsByUrl(string $url, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM sites WHERE LOWER(url) = LOWER(:url)';
        $params = ['url' => $url];
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
