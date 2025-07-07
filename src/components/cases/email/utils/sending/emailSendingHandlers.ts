
import { toast } from 'sonner';
import { MailCase } from '../../types';

// Enhance email with AI (simulation)
export const enhanceEmail = async (
  emailBody: string, 
  callback: (enhancedBody: string) => void
) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Just add some polishing to the email body as a simulation
  const enhancedBody = emailBody + `

---
このメールは自動生成されていません。
`;
  
  // Show success message
  toast.success('メール本文が最適化されました', {
    description: 'AIが文章を改善しました'
  });
  
  callback(enhancedBody);
};

// Send email (simulation)
export const sendEmail = async (
  subject: string, 
  emailBody: string, 
  signature: string, 
  selectedCases: MailCase[],
  callback: () => void
) => {
  // Simulate sending delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract recipients for display
  const recipients = selectedCases.map(c => {
    return c.selectedSenderName || c.sender || 'Unknown Recipient';
  });
  
  // Show success message
  toast.success(`${recipients.length}名にメールを送信いたしました`, {
    description: `件名: ${subject}`
  });
  
  callback();
};

// Send test email (simulation)
export const sendTestEmail = async (
  subject: string, 
  emailBody: string, 
  signature: string
) => {
  // Simulate sending delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Show success message
  toast.success('テストメールを送信しました', {
    description: '自分宛にテストメールが送信されました'
  });
};

// Handle enhance email
export const handleEnhanceEmail = (
  emailBody: string,
  setSending: (sending: boolean) => void,
  setEmailBody: (body: string) => void
) => {
  setSending(true);
  
  enhanceEmail(emailBody, (enhancedBody) => {
    setEmailBody(enhancedBody);
    setSending(false);
  });
};

// Handle send email
export const handleSendEmail = (
  selectedCases: MailCase[],
  mailCases: MailCase[],
  subject: string,
  emailBody: string,
  setSending: (sending: boolean) => void,
  setSelectedCases: (cases: MailCase[]) => void,
  setSelectAll: (value: boolean) => void,
  setSubject: (subject: string) => void,
  setEmailBody: (body: string) => void,
  setSelectedEngineers: (engineers: any[]) => void
) => {
  if (selectedCases.length === 0) {
    toast.error('送信するメールが選択されていません');
    return;
  }
  
  if (!subject || !emailBody) {
    toast.error('件名または本文が入力されていません');
    return;
  }
  
  setSending(true);
  
  sendEmail(subject, emailBody, "", selectedCases, () => {
    // Reset state after sending
    setSelectedCases([]);
    setSelectAll(false);
    setSubject('');
    setEmailBody('');
    setSelectedEngineers([]);
    setSending(false);
  });
};

// Handle test email
export const handleTestEmail = (
  subject: string,
  emailBody: string,
  signature: string,
  setSending: (sending: boolean) => void
) => {
  if (!subject || !emailBody) {
    toast.error('件名または本文が入力されていません');
    return;
  }
  
  setSending(true);
  
  sendTestEmail(subject, emailBody, signature)
    .then(() => {
      setSending(false);
    });
};

// Create email sending handlers
export const createEmailSendingHandlers = ({
  selectedCases,
  subject,
  emailBody,
  signature,
  setSending
}: {
  selectedCases: MailCase[];
  subject: string;
  emailBody: string;
  signature: string;
  setSending: (sending: boolean) => void;
}) => {
  return {
    handleEnhanceEmail: () => handleEnhanceEmail(emailBody, setSending, () => {}),
    handleSendEmail: (
      mailCases: MailCase[],
      setSelectedCases: (cases: MailCase[]) => void,
      setSelectAll: (value: boolean) => void,
      setSubject: (subject: string) => void,
      setEmailBody: (body: string) => void,
      setSelectedEngineers: (engineers: any[]) => void
    ) => handleSendEmail(
      selectedCases,
      mailCases,
      subject,
      emailBody,
      setSending,
      setSelectedCases,
      setSelectAll,
      setSubject,
      setEmailBody,
      setSelectedEngineers
    ),
    handleTestEmail: () => handleTestEmail(subject, emailBody, signature, setSending)
  };
};
