import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import retrospectiveConsentService from "../services/retrospectiveConsentService";
import "../styles/RetrospectiveConsentLanding.css";

const RetrospectiveConsentLanding = () => {
  const location = useLocation();
  const token = useMemo(() => new URLSearchParams(location.search).get("token") || "", [location.search]);

  const [isLoading, setIsLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [given, setGiven] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        setErrorMessage("Invalid consent link. Token missing.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await retrospectiveConsentService.getInviteDetails(token);
        setInviteData(response);

        const requiredIds = (response.categories || [])
          .filter((category) => category.is_required)
          .map((category) => category.id);

        setSelectedCategories(requiredIds);
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || "Failed to load consent invite";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const toggleCategory = (category) => {
    if (category.is_required || !given) {
      return;
    }

    setSelectedCategories((prev) => {
      if (prev.includes(category.id)) {
        return prev.filter((id) => id !== category.id);
      }

      return [...prev, category.id];
    });
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitMessage("");

    if (!token) {
      setSubmitError("Invalid token");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        given,
        selectedCategories: given ? selectedCategories : [],
      };

      await retrospectiveConsentService.submitConsent(token, payload);
      setSubmitMessage("Thanks. Your consent response has been saved successfully.");
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to submit consent";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="retro-landing-shell">
        <div className="retro-landing-card">Loading your consent request...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="retro-landing-shell">
        <div className="retro-landing-card retro-landing-error">{errorMessage}</div>
      </div>
    );
  }

  if (!inviteData) {
    return null;
  }

  return (
    <div className="retro-landing-shell">
      <div className="retro-landing-card">
        <header className="retro-landing-header">
          <p className="retro-landing-client">{inviteData.invite.clientName}</p>
          <h1>{inviteData.template?.header_text || "Update Your Consent"}</h1>
          <p>{inviteData.portal?.upper_text || inviteData.template?.main_text}</p>
          <p className="retro-landing-email">For: {inviteData.invite.email}</p>
        </header>

        <section className="retro-landing-consent-switch">
          <label>
            <input type="radio" checked={given} onChange={() => setGiven(true)} /> I Accept
          </label>
          <label>
            <input type="radio" checked={!given} onChange={() => setGiven(false)} /> I Reject
          </label>
        </section>

        <section>
          <h2>Consent Categories</h2>
          <div className="retro-landing-categories">
            {(inviteData.categories || []).map((category) => (
              <button
                type="button"
                key={category.id}
                className={`retro-landing-category ${selectedCategories.includes(category.id) ? "active" : ""}`}
                onClick={() => toggleCategory(category)}
                disabled={!given || category.is_required}
              >
                <strong>{category.name}</strong>
                <span>{category.description}</span>
                {category.is_required ? <em>Required</em> : null}
              </button>
            ))}
          </div>
        </section>

        {submitError ? <p className="retro-landing-error">{submitError}</p> : null}
        {submitMessage ? <p className="retro-landing-success">{submitMessage}</p> : null}

        <button className="retro-landing-submit" disabled={isSubmitting || Boolean(submitMessage)} onClick={handleSubmit}>
          {isSubmitting ? "Saving..." : "Submit Consent"}
        </button>

        <p className="retro-landing-footer">
          {inviteData.portal?.lower_text || "You can close this window after submitting your consent."}
        </p>
      </div>
    </div>
  );
};

export default RetrospectiveConsentLanding;
