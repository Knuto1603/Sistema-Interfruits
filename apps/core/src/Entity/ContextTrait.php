<?php

namespace App\apps\core\Entity;

use Doctrine\ORM\Mapping as ORM;

trait ContextTrait
{
    #[ORM\ManyToOne(targetEntity: Periodo::class)]
    #[ORM\JoinColumn(name: 'periodo_id', nullable: false)]
    protected ?Periodo $periodo = null;

    #[ORM\ManyToOne(targetEntity: Fruta::class)]
    #[ORM\JoinColumn(name: 'fruta_id', nullable: false)]
    protected ?Fruta $fruta = null;

    // Getters y setters
    public function getPeriodo(): ?Periodo
    {
        return $this->periodo;
    }

    public function setPeriodo(?Periodo $periodo): static
    {
        $this->periodo = $periodo;
        return $this;
    }

    public function getFruta(): ?Fruta
    {
        return $this->fruta;
    }

    public function setFruta(?Fruta $fruta): static
    {
        $this->fruta = $fruta;
        return $this;
    }
}
