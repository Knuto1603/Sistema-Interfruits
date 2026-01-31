<?php

namespace App\apps\core\Entity;

use App\apps\core\Repository\ProductorRepository;
use App\shared\Entity\EntityTrait;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductorRepository::class)]
#[ORM\Table(name: 'core_productor')]
#[ORM\HasLifecycleCallbacks]
class Productor implements \Stringable
{
    use EntityTrait;
    use ContextTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 4)]
    private ?string $codigo = null;

    #[ORM\Column(length: 100)]
    private ?string $nombre = null;

    #[ORM\Column(length: 12)]
    private ?string $clp = null;

    #[ORM\Column(length: 6, nullable: true)]
    private ?string $mtdCeratitis = null;

    #[ORM\Column(length: 6, nullable: true)]
    private ?string $mtdAnastrepha = null;

    #[ORM\Column(length: 255)]
    private ?string $productor = null;

    public function __toString(): string
    {
        return $this->getNombre() ?? '';
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCodigo(): ?string
    {
        return $this->codigo;
    }

    public function setCodigo(string $codigo): static
    {
        $this->codigo = $codigo;
        return $this;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getClp(): ?string
    {
        return $this->clp;
    }

    public function setClp(string $clp): static
    {
        $this->clp = $clp;
        return $this;
    }

    public function getMtdCeratitis(): ?string
    {
        return $this->mtdCeratitis;
    }

    public function setMtdCeratitis(?string $mtdCeratitis): static
    {
        $this->mtdCeratitis = $mtdCeratitis;
        return $this;
    }

    public function getMtdAnastrepha(): ?string
    {
        return $this->mtdAnastrepha;
    }

    public function setMtdAnastrepha(?string $mtdAnastrepha): static
    {
        $this->mtdAnastrepha = $mtdAnastrepha;
        return $this;
    }

    public function getProductor(): ?string
    {
        return $this->productor;
    }

    public function setProductor(string $productor): static
    {
        $this->productor = $productor;
        return $this;
    }
}
