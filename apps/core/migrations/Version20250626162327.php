<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250626162327 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE core_parametro (id INT AUTO_INCREMENT NOT NULL, parent_id INT DEFAULT NULL, name VARCHAR(100) NOT NULL, alias VARCHAR(12) DEFAULT NULL, value NUMERIC(12, 4) DEFAULT NULL, uuid BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, is_active TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_372497BD17F50A6 (uuid), INDEX IDX_372497B727ACA70 (parent_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE core_parametro ADD CONSTRAINT FK_372497B727ACA70 FOREIGN KEY (parent_id) REFERENCES core_parametro (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE core_parametro DROP FOREIGN KEY FK_372497B727ACA70
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE core_parametro
        SQL);
    }
}
