<?php

namespace App\apps\core\Service\Contexto;

use App\apps\core\Entity\Campahna;
use App\apps\core\Repository\CampahnaRepository;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Servicio encargado de resolver la campaña activa basándose en el header de la petición.
 */
class ContextService
{
    private ?Campahna $campahnaActual = null;

    public function __construct(
        private RequestStack $requestStack,
        private CampahnaRepository $campahnaRepository
    ) {}

    /**
     * Obtiene la campaña activa desde el header 'X-Campahna-Id'.
     */
    public function getCampahnaActual(): ?Campahna
    {
        if ($this->campahnaActual) {
            return $this->campahnaActual;
        }

        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return null;
        }

        $campahnaId = $request->headers->get('X-Campahna-Id');

        if ($campahnaId) {
            // Buscamos la campaña por ID. En una versión más avanzada se podría usar UUID.
            $this->campahnaActual = $this->campahnaRepository->find((int)$campahnaId);
        }

        return $this->campahnaActual;
    }
}
