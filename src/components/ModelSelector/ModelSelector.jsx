import { useState } from "react";
import styles from "./ModelSelector.module.css";

export function ModelSelector({ models, currentModel, onChange, isDisabled }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleModelSelect = (modelId) => {
    onChange(modelId);
    setIsOpen(false);
  };

  // Group models by provider
  const groupedModels = models.reduce((acc, model) => {
    const provider = model.provider || "Unknown";
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {});

  return (
    <div className={styles.ModelSelector}>
      <button
        className={styles.SelectorButton}
        onClick={toggleDropdown}
        disabled={isDisabled}
      >
        {currentModel || "Select Model"} <DropdownIcon isOpen={isOpen} />
      </button>
      
      {isOpen && (
        <div className={styles.Dropdown}>
          {Object.entries(groupedModels).map(([provider, providerModels]) => (
            <div key={provider} className={styles.ProviderGroup}>
              <div className={styles.ProviderTitle}>{provider}</div>
              {providerModels.map((model) => (
                <div
                  key={model.id}
                  className={`${styles.ModelOption} ${
                    model.id === currentModel ? styles.Selected : ""
                  }`}
                  onClick={() => handleModelSelect(model.id)}
                >
                  {model.id}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownIcon({ isOpen }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}