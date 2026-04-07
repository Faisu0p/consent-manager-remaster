import React, { useEffect, useMemo, useState } from "react";
import bannerService from "../services/bannerServices";
import retrospectiveConsentService from "../services/retrospectiveConsentService";
import "../styles/RetrospectiveConsentCampaign.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseUploadedContent = (content, extension) => {
  const trimmed = content.trim();
  if (!trimmed) {
    return [];
  }

  if (extension === "json") {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      if (parsed.every((item) => typeof item === "string")) {
        return parsed;
      }

      if (parsed.every((item) => typeof item === "object" && item !== null)) {
        return parsed
          .map((row) => row.email || row.Email || row.mail)
          .filter(Boolean)
          .map(String);
      }
    }

    if (parsed?.emails && Array.isArray(parsed.emails)) {
      return parsed.emails.map(String);
    }

    return [];
  }

  return trimmed
    .split(/[\n,;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeEmails = (emails = []) => {
  const unique = [];
  const invalid = [];
  const seen = new Set();

  emails.forEach((raw) => {
    const email = String(raw || "").trim().toLowerCase();
    if (!email || seen.has(email)) {
      return;
    }

    seen.add(email);

    if (!EMAIL_REGEX.test(email)) {
      invalid.push(email);
      return;
    }

    unique.push(email);
  });

  return { unique, invalid };
};

const RetrospectiveConsentCampaign = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const [clientName, setClientName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [emailsText, setEmailsText] = useState("");
  const [fileError, setFileError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await bannerService.getAllBannerTemplates();
        const data = Array.isArray(response) ? response : response?.data || [];
        setTemplates(data);
      } catch (error) {
        setErrorMessage(error?.message || "Failed to load templates");
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, []);

  const parsedEmails = useMemo(() => normalizeEmails(emailsText.split(/[\n,;]+/g)), [emailsText]);

  const handleFileUpload = async (event) => {
    setFileError("");
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const extension = file.name.split(".").pop()?.toLowerCase() || "txt";
      const parsed = parseUploadedContent(content, extension);

      if (!parsed.length) {
        setFileError("No emails found in file. Use JSON array/object or CSV/TXT list.");
        return;
      }

      setEmailsText(parsed.join("\n"));
    } catch (error) {
      setFileError(error?.message || "Failed to read file");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setErrorMessage("");

    if (!clientName.trim()) {
      setErrorMessage("Client name is required");
      return;
    }

    if (!templateId) {
      setErrorMessage("Please select a banner template");
      return;
    }

    if (parsedEmails.unique.length === 0) {
      setErrorMessage("Please provide at least one valid email");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await retrospectiveConsentService.createCampaign({
        clientName: clientName.trim(),
        templateId: Number(templateId),
        emails: parsedEmails.unique,
        emailSubject: emailSubject.trim(),
        emailBody: emailBody.trim(),
        expiresInDays: Number(expiresInDays),
      });

      setResult(response);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="retrospective-campaign-page enterprise-page">
      <div className="enterprise-page-header">
        <h1 className="enterprise-page-title">Retrospective Consent</h1>
        <p className="enterprise-page-subtitle">
          Upload historical customer emails, send hosted consent links, and track consent collection campaign status.
        </p>
      </div>

      <form className="retrospective-campaign-panel enterprise-panel" onSubmit={handleSubmit}>
        <div className="retrospective-campaign-grid">
          <label>
            Client Name
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nykaa" required />
          </label>

          <label>
            Template
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={isLoadingTemplates}
              required
            >
              <option value="">Select template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} (id: {template.id})
                </option>
              ))}
            </select>
          </label>

          <label>
            Link Expiry (Days)
            <input
              type="number"
              min={1}
              max={365}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            />
          </label>

          <label>
            Email Subject
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Please review your consent preferences"
            />
          </label>
        </div>

        <label className="retrospective-campaign-body-label">
          Email Body Template
          <textarea
            rows={6}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder={"Use {{clientName}}, {{consentLink}}, {{email}} placeholders"}
          />
        </label>

        <div className="retrospective-campaign-upload-row">
          <label>
            Upload JSON/CSV/TXT
            <input type="file" accept=".json,.csv,.txt" onChange={handleFileUpload} />
          </label>
          {fileError ? <p className="retrospective-campaign-error">{fileError}</p> : null}
        </div>

        <label className="retrospective-campaign-body-label">
          Emails
          <textarea
            rows={10}
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            placeholder={"one@email.com\nsecond@email.com"}
            required
          />
        </label>

        <div className="retrospective-campaign-meta">
          <span>Valid emails: {parsedEmails.unique.length}</span>
          <span>Invalid emails: {parsedEmails.invalid.length}</span>
        </div>

        {parsedEmails.invalid.length > 0 ? (
          <div className="retrospective-campaign-warning">
            Ignored invalid emails: {parsedEmails.invalid.slice(0, 8).join(", ")}
            {parsedEmails.invalid.length > 8 ? " ..." : ""}
          </div>
        ) : null}

        {errorMessage ? <p className="retrospective-campaign-error">{errorMessage}</p> : null}

        <button type="submit" className="retrospective-campaign-submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Campaign..." : "Create Campaign And Send Emails"}
        </button>
      </form>

      {result ? (
        <section className="retrospective-campaign-result enterprise-panel">
          <h2>Campaign Created</h2>
          <p>Campaign ID: {result.campaignId}</p>
          <p>Total: {result.totalEmails}</p>
          <p>Sent: {result.sentCount}</p>
          <p>Failed: {result.failedCount}</p>
          {result.invalidEmails?.length > 0 ? (
            <p>Invalid input emails ignored: {result.invalidEmails.length}</p>
          ) : null}
          {result.failed?.length > 0 ? (
            <div>
              <p>Failed deliveries:</p>
              <ul>
                {result.failed.slice(0, 10).map((item) => (
                  <li key={`${item.inviteId}-${item.email}`}>
                    {item.email}: {item.error}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};

export default RetrospectiveConsentCampaign;
