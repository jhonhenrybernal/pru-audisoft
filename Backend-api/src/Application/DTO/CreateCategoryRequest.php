<?php
namespace App\Application\DTO;

final class CreateCategoryRequest
{
    public function __construct(
        public string $name
    ) {}
}
