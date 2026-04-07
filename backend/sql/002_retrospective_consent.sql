IF OBJECT_ID('retrospective_consent_campaigns', 'U') IS NULL
BEGIN
    CREATE TABLE retrospective_consent_campaigns (
        id INT IDENTITY(1,1) PRIMARY KEY,
        client_name NVARCHAR(255) NOT NULL,
        template_id INT NOT NULL,
        email_subject NVARCHAR(255) NOT NULL,
        email_body NVARCHAR(MAX) NOT NULL,
        created_by NVARCHAR(255) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
END;

IF OBJECT_ID('retrospective_consent_invites', 'U') IS NULL
BEGIN
    CREATE TABLE retrospective_consent_invites (
        id INT IDENTITY(1,1) PRIMARY KEY,
        campaign_id INT NOT NULL,
        email NVARCHAR(255) NOT NULL,
        token_hash NVARCHAR(128) NOT NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'pending',
        expires_at DATETIME2 NOT NULL,
        last_sent_at DATETIME2 NULL,
        responded_at DATETIME2 NULL,
        consent_user_id INT NULL,
        consent_id INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_retrospective_invites_campaign
            FOREIGN KEY (campaign_id) REFERENCES retrospective_consent_campaigns(id)
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_retrospective_invites_token_hash'
      AND object_id = OBJECT_ID('retrospective_consent_invites')
)
BEGIN
    CREATE UNIQUE INDEX UX_retrospective_invites_token_hash
    ON retrospective_consent_invites(token_hash);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_retrospective_invites_email_status'
      AND object_id = OBJECT_ID('retrospective_consent_invites')
)
BEGIN
    CREATE INDEX IX_retrospective_invites_email_status
    ON retrospective_consent_invites(email, status);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_retrospective_invites_campaign'
      AND object_id = OBJECT_ID('retrospective_consent_invites')
)
BEGIN
    CREATE INDEX IX_retrospective_invites_campaign
    ON retrospective_consent_invites(campaign_id);
END;
