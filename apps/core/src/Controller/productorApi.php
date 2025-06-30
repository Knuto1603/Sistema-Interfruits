<?php

namespace App\apps\core\Controller;

use App\apps\core\Service\Productor\CreateProductorService;
use App\apps\core\Service\Productor\Dto\ProductorDto;
use App\apps\core\Service\Productor\Dto\ProductorDtoTransformer;
use App\apps\core\Service\Productor\GetProductoresService;
use App\shared\Api\AbstractSerializerApi;
use App\shared\Service\Dto\FilterDto;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/productores')]
class productorApi extends AbstractSerializerApi
{

    #[Route('/', name: 'productor_list', methods: ['GET'])]
    public function list(
        #[MapQueryString]
        FilterDto $filterDto,
        GetProductoresService $parametrosService,
    ): Response {
        return $this->ok($parametrosService->execute($filterDto));
    }

    #[Route('/', name: 'productor_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload]
        ProductorDto $productorDto,
        CreateProductorService $productorService,
        ProductorDtoTransformer $transformer,
    ): Response
    {
        $productor =$productorService->execute($productorDto);
        return $this->ok([
            'message' => 'Registro creado',
            'item' => $transformer->fromObject($productor),
        ]);
    }
}
