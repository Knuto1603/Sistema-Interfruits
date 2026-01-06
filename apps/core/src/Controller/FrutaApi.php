<?php

namespace App\apps\core\Controller;

use App\apps\core\Service\Contexto\Fruta\CreateFrutaService;
use App\apps\core\Service\Contexto\Fruta\Dto\FrutaDto;
use App\apps\core\Service\Contexto\Fruta\Dto\FrutaDtoTransformer;
use App\apps\core\Service\Contexto\Fruta\GetFrutasService;
use App\apps\core\Service\Contexto\Fruta\GetFrutasShared;
use App\shared\Api\AbstractSerializerApi;
use App\shared\Service\Dto\FilterDto;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/frutas')]
class FrutaApi extends AbstractSerializerApi
{
    #[Route('/', name: 'fruta_list', methods: ['GET'])]
    public function list(
        FilterDto $filterDto,
        GetFrutasService $service
    ): Response
    {
        return $this->ok($service->execute($filterDto));
    }

    #[Route('/', name: 'fruta_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload]
        FrutaDto $frutaDto,
        FrutaDtoTransformer $transformer,
        CreateFrutaService $service,
    ): Response
    {
        $fruta = $service->execute($frutaDto);
        return $this->ok([
            'message' => 'Registro creado',
            'item' => $transformer->fromObject($fruta),
        ]);
    }

    #[Route('/shared', name: 'fruta_shared_list', methods: ['GET'])]
    public function sharedList(
        GetFrutasShared $service
    ): Response
    {
        return $this->ok(['items'=>$service->execute()]);
    }



}
