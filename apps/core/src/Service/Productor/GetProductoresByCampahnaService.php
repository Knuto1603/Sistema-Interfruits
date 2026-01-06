<?php

namespace App\apps\core\Service\Productor;

use App\apps\core\Repository\ProductorRepository;
use App\apps\core\Service\Productor\Dto\ProductorDtoTransformer;
use App\apps\core\Service\Productor\Filter\ProductorFilterDto;
use App\shared\Service\Dto\FilterDto;
use App\shared\Service\Dto\SortingDto;
use App\shared\Service\Filter\PaginationFilter;
use App\shared\Service\Filter\SearchTextFilter;
use App\shared\Service\FilterService;
use App\shared\Service\Sorting\SortByRequestField;

final readonly class GetProductoresByCampahnaService
{
    public function __construct(
        protected FilterService $filterService,
        protected ProductorRepository $repository,
        protected ProductorDtoTransformer $dtoTransformer,
    )
    {
    }

    public function execute(string $campahnaId, FilterDto $filterDto): array
    {
        // Crear filtro específico para la campaña
        $campahnaFilterDto = new ProductorFilterDto(
            page: $filterDto->page,
            itemsPerPage: $filterDto->itemsPerPage,
            search: $filterDto->search,
            sort: $filterDto->sort,
            direction: $filterDto->direction,
            campahnaId: $campahnaId
        );

        // Apply filters
        $this->filterService->addFilter(new PaginationFilter($campahnaFilterDto->page, $campahnaFilterDto->itemsPerPage));
        $this->filterService->addFilter(new SearchTextFilter($campahnaFilterDto->search, [
            'productor.nombre',
            'productor.codigo',
            'productor.clp',
        ]));

        // Filtro específico por campaña
        $this->filterService->addCondition(
            'campahna.uuid = :campahnaId',
            ['campahnaId' => $campahnaId]
        );

        // Sortings
        $sorting = SortingDto::create($campahnaFilterDto->sort, $campahnaFilterDto->direction);
        $this->filterService->addSorting(new SortByRequestField($sorting, [
            'nombre' => 'productor.nombre',
            'codigo' => 'productor.codigo',
            'clp' => 'productor.clp',
            'createdAt' => 'productor.createdAt',
        ]));

        // Pagination
        $paginator = $this->repository->paginateAndFilter($this->filterService);
        $items = $this->dtoTransformer->fromObjects($paginator->getIterator());

        return ['items' => $items, 'pagination' => $paginator->pagination()];
    }
}
