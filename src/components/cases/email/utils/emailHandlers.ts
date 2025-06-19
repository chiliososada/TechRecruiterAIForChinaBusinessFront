
// Main emailHandlers.ts file - now just re-exports functionality from smaller modules

// Re-export template handlers
export {
  replacePlaceholders,
  applyTemplate,
  handleTemplateChange
} from './template/templateHandlers';

// Re-export signature handlers
export {
  updateSignatureInBody,
  removeSignatureFromBody,
  formatSignaturePreview
} from './signature/signatureHandlers';

// Re-export case selection handlers
export {
  handleSelectAll,
  handleSelectCase
} from './selection/caseSelectionHandlers';

// Re-export email sending handlers
export {
  enhanceEmail,
  sendEmail,
  sendTestEmail,
  handleEnhanceEmail,
  handleSendEmail,
  handleTestEmail
} from './sending/emailSendingHandlers';
