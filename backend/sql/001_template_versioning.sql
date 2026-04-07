SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('template_families', 'U') IS NULL
BEGIN
    CREATE TABLE template_families (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        created_by NVARCHAR(255) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END;

IF OBJECT_ID('banner_template_versions', 'U') IS NULL
BEGIN
    CREATE TABLE banner_template_versions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        template_family_id INT NOT NULL,
        version_number INT NOT NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'draft',
        change_note NVARCHAR(MAX) NULL,
        previous_version_id INT NULL,
        language_code NVARCHAR(20) NULL,
        name NVARCHAR(255) NOT NULL,
        main_text NVARCHAR(MAX) NULL,
        info_paragraph NVARCHAR(MAX) NULL,
        header_text NVARCHAR(MAX) NULL,
        button_accept_text NVARCHAR(255) NULL,
        button_reject_text NVARCHAR(255) NULL,
        button_configure_text NVARCHAR(255) NULL,
        created_by NVARCHAR(255) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        published_at DATETIME2 NULL,
        is_deleted BIT NOT NULL DEFAULT 0,
        CONSTRAINT UQ_banner_template_versions_family_version UNIQUE (template_family_id, version_number)
    );

    CREATE INDEX IX_banner_template_versions_family_status_version
        ON banner_template_versions (template_family_id, status, version_number DESC);

    ALTER TABLE banner_template_versions
        ADD CONSTRAINT FK_banner_template_versions_family
        FOREIGN KEY (template_family_id) REFERENCES template_families(id);
END;

IF COL_LENGTH('banner_templates', 'template_family_id') IS NULL
BEGIN
    ALTER TABLE banner_templates ADD template_family_id INT NULL;
END;

IF COL_LENGTH('banner_templates', 'version_number') IS NULL
BEGIN
    ALTER TABLE banner_templates ADD version_number INT NULL;
END;

IF COL_LENGTH('banner_templates', 'status') IS NULL
BEGIN
    ALTER TABLE banner_templates ADD status NVARCHAR(20) NULL;
END;

IF EXISTS (SELECT 1 FROM banner_templates)
BEGIN
    DECLARE @legacyId INT;
    DECLARE @legacyName NVARCHAR(255);

    DECLARE legacy_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT bt.id, bt.name
        FROM banner_templates bt
        LEFT JOIN banner_template_versions btv ON bt.id = btv.id
        WHERE btv.id IS NULL
        ORDER BY bt.id;

    OPEN legacy_cursor;
    FETCH NEXT FROM legacy_cursor INTO @legacyId, @legacyName;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO template_families (name)
        VALUES (ISNULL(@legacyName, CONCAT('Template ', @legacyId)));

        DECLARE @familyId INT = SCOPE_IDENTITY();

        SET IDENTITY_INSERT banner_template_versions ON;

        INSERT INTO banner_template_versions (
            id,
            template_family_id,
            version_number,
            status,
            change_note,
            previous_version_id,
            language_code,
            name,
            main_text,
            info_paragraph,
            header_text,
            button_accept_text,
            button_reject_text,
            button_configure_text,
            created_by,
            created_at,
            published_at,
            is_deleted
        )
        SELECT
            bt.id,
            @familyId,
            1,
            'published',
            'Initial migration version',
            NULL,
            bt.language_code,
            bt.name,
            bt.main_text,
            bt.info_paragraph,
            bt.header_text,
            bt.button_accept_text,
            bt.button_reject_text,
            bt.button_configure_text,
            NULL,
            SYSDATETIME(),
            SYSDATETIME(),
            0
        FROM banner_templates bt
        WHERE bt.id = @legacyId;

        SET IDENTITY_INSERT banner_template_versions OFF;

        EXEC sp_executesql
            N'UPDATE banner_templates
              SET template_family_id = @familyId,
                  version_number = 1,
                  status = ''published''
              WHERE id = @legacyId;',
            N'@familyId INT, @legacyId INT',
            @familyId = @familyId,
            @legacyId = @legacyId;

        FETCH NEXT FROM legacy_cursor INTO @legacyId, @legacyName;
    END;

    CLOSE legacy_cursor;
    DEALLOCATE legacy_cursor;
END;

COMMIT TRANSACTION;
