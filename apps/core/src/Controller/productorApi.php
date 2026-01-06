<?php

namespace App\apps\core\Controller;

use App\apps\core\Service\Productor\CreateProductorService;
use App\apps\core\Service\Productor\DeleteProductorService;
use App\apps\core\Service\Productor\Dto\ProductorDto;
use App\apps\core\Service\Productor\Dto\ProductorDtoTransformer;
use App\apps\core\Service\Productor\GetLastProductorCode;
use App\apps\core\Service\Productor\GetProductoresService;
use App\shared\Api\AbstractSerializerApi;
use App\shared\Doctrine\UidType;
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
        GetProductoresService $service,
    ): Response {
        return $this->ok($service->execute($filterDto));
    }

    #[Route('/', name: 'productor_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload]
        ProductorDto $productorDto,
        CreateProductorService $productorService,
        ProductorDtoTransformer $transformer,
    ): Response
    {
        $productor = $productorService->execute($productorDto);
        return $this->ok([
            'message' => 'Productor creado exitosamente',
            'item' => $transformer->fromObject($productor),
        ]);
    }

    #[Route('/last-code', name: 'productor_last_code', methods: ['GET'])]
    public function lastCode(
        GetLastProductorCode $productorService,
    ): Response
    {
        $lastCode = $productorService->execute();
        return $this->ok(['lastCode' => $lastCode]);
    }

    #[Route('/{id}', name: 'productor_view', requirements: ['id' => UidType::REGEX], methods: ['GET'])]
    public function view(
        string $id,
        GetProductoresService $service,
        ProductorDtoTransformer $transformer,
    ): Response {
        // Aquí podrías implementar un GetProductorService individual si lo necesitas
        // Por ahora, usamos el servicio general
        $filterDto = new FilterDto();
        $result = $service->execute($filterDto);
        
        // Buscar el productor específico (esto es una implementación temporal)
        $productor = null;
        foreach ($result['items'] as $item) {
            if ($item->uuid === $id) {
                $productor = $item;
                break;
            }
        }

        return $this->ok([
            'message' => 'Productor obtenido exitosamente',
            'item' => $productor,
        ]);
    }

    #[Route('/{id}', name: 'productor_delete', requirements: ['id' => UidType::REGEX], methods: ['DELETE'])]
    public function delete(
        string $id,
        DeleteProductorService $productorService,
    ): Response {
        $productorService->execute($id);

        return $this->ok([
            'message' => 'Productor eliminado exitosamente',
            'item' => null,
        ]);
    }
}
