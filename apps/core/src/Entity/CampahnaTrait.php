<?php

namespace App\apps\core\Entity;

use Doctrine\ORM\Mapping as ORM;

trait CampahnaTrait
{
    #[ORM\ManyToOne(targetEntity: Campahna::class)]
    #[ORM\JoinColumn(name: 'campahna_id', nullable: false)]
    protected ?Campahna $campahna = null;

    public function getCampahna(): ?Campahna
    {
        return $this->campahna;
    }

    public function setCampahna(?Campahna $campahna): static
    {
        $this->campahna = $campahna;
        return $this;
    }

    /**
     * Acceso rápido a la fruta de la campaña
     */
    public function getFruta(): ?Fruta
    {
        return $this->campahna?->getFruta();
    }

    /**
     * Acceso rápido al período de la campaña
     */
    public function getPeriodo(): ?Periodo
    {
        return $this->campahna?->getPeriodo();
    }
}
