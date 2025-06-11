<?php

namespace App\apps\core\Entity;

use App\apps\core\Repository\ProductorRepository;
use App\shared\Entity\EntityTrait;
use Doctrine\ORM\Mapping as ORM;


#[ORM\Entity(repositoryClass: ProductorRepository::class)]
#[ORM\Table(name: 'core_productor')]
#[ORM\HasLifecycleCallbacks]
class Productor
{
    use EntityTrait;
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 4)]
    private ?string $codigo = null;

    #[ORM\Column(length: 100)]
    private ?string $nombre = null;

    #[ORM\Column(length: 10)]
    private ?string $clp = null;

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
}
