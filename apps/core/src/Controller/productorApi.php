<?php

namespace App\apps\core\Controller;

use App\apps\core\Service\Productor\CreateProductorService;
use App\apps\core\Service\Productor\Dto\ProductorDto;
use App\apps\core\Service\Productor\Dto\ProductorDtoTransformer;
use App\shared\Api\AbstractSerializerApi;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/productores')]
class productorApi extends AbstractSerializerApi
{
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
