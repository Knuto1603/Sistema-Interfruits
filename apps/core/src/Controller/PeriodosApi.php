<?php

namespace App\apps\core\Controller;

use App\apps\core\Service\Contexto\Periodo\CreatePeriodoService;
use App\apps\core\Service\Contexto\Periodo\Dto\PeriodoDto;
use App\apps\core\Service\Contexto\Periodo\Dto\PeriodoDtoTransformer;
use App\apps\core\Service\Contexto\Periodo\GetPeriodoShared;
use App\apps\core\Service\Contexto\Periodo\GetPeriodosService;
use App\shared\Api\AbstractSerializerApi;
use App\shared\Service\Dto\FilterDto;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/periodos')]
class PeriodosApi extends AbstractSerializerApi
{
    #[Route('/', name: 'periodos_list', methods: ['GET'])]
    public function list(
        #[MapQueryString]
        FilterDto $filterDto,
        GetPeriodosService $service,
    ): Response {
        return $this->ok($service->execute($filterDto));
    }

    #[Route('/', name: 'periodo_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload]
        PeriodoDto $periodoDto,
        CreatePeriodoService $periodoService,
        PeriodoDtoTransformer $transformer,
    ): Response
    {
        $periodo =$periodoService->execute($periodoDto);
        return $this->ok([
            'message' => 'Registro creado',
            'item' => $transformer->fromObject($periodo),
        ]);
    }

    #[Route('/shared', name: 'periodo_shared_list', methods: ['GET'])]
    public function sharedList(
        GetPeriodoShared $service
    ): Response {
        return $this->ok(['items' => $service->execute()]);
    }
}
