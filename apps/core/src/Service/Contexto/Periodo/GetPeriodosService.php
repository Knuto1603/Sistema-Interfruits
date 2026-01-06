<?php

namespace App\apps\core\Service\Contexto\Periodo;

use App\apps\core\Repository\ContextRepository\PeriodoRepository;
use App\apps\core\Service\Contexto\Periodo\Dto\PeriodoDtoTransformer;
use App\shared\Service\Dto\FilterDto;
use App\shared\Service\Dto\SortingDto;
use App\shared\Service\Filter\PaginationFilter;
use App\shared\Service\Filter\SearchTextFilter;
use App\shared\Service\FilterService;
use App\shared\Service\Sorting\SortByRequestField;

final readonly class GetPeriodosService
{
    public function __construct(
        protected FilterService $filterService,
        protected PeriodoRepository $repository,
        protected PeriodoDtoTransformer $dtoTransformer,
    )
    {
    }

    public function execute(FilterDto $filterDto): array
    {
        $this->filterService->addFilter(new PaginationFilter($filterDto->page, $filterDto->itemsPerPage));
        $this->filterService->addFilter(new SearchTextFilter($filterDto->search, [
            'periodo.nombre',
            'periodo.codigo',
        ]));

        // Sortings
        $sorting = SortingDto::create($filterDto->sort, $filterDto->direction);
        $this->filterService->addSorting(new SortByRequestField($sorting, [
            'nombre' => 'periodo.nombre',
            'codigo' => 'periodo.codigo',
        ]));

        // Pagination
        $paginator = $this->repository->paginateAndFilter($this->filterService);
        $items = $this->dtoTransformer->fromObjects($paginator->getIterator());

        return ['items' => $items, 'pagination' => $paginator->pagination()];
    }

}
