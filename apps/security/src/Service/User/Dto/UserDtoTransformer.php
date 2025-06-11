<?php

namespace App\apps\security\Service\User\Dto;

use App\apps\security\Entity\User;
use App\shared\Service\ImageService;
use App\shared\Service\Transformer\DtoTransformer;
use CarlosChininin\AttachFile\Service\AttachFileDownloadService;

final class UserDtoTransformer extends DtoTransformer
{
    public function __construct(
        private readonly ImageService $image,
        private readonly AttachFileDownloadService $fileDownload,
    ) {
    }

    /** @param User $object */
    public function fromObject(mixed $object): ?UserDto
    {
        if (null === $object) {
            return null;
        }

        $dto = new UserDto();
        $dto->username = $object->getUsername();
        $dto->fullname = $object->getFullName();
        $dto->roles = $object->getRoles();
        if (null !== ($photo = $object->getPhoto())) {
            $dto->photo = $this->image->get($photo->filePath(), 'small');
            $dto->photoUrl = $this->fileDownload->get($photo);
        }

        $dto->ofEntity($object);

        return $dto;
    }
}
