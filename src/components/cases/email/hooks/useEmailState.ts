
import { useState } from 'react';
import { MailCase } from '../types';

export const useEmailState = (initialCases: MailCase[] = []) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCases, setSelectedCases] = useState<MailCase[]>([]);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('all');
  const [startDateOptions, setStartDateOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [signature, setSignature] = useState('');

  // Handle unselecting a case
  const handleUnselectCase = (caseId: string, rowId: string) => {
    setSelectedCases(prev => 
      prev.filter(c => !(c.id === caseId && c.selectedRowId === rowId))
    );
  };

  return {
    selectAll,
    setSelectAll,
    selectedCases,
    setSelectedCases,
    companyFilter,
    setCompanyFilter,
    techFilter,
    setTechFilter,
    startDateFilter,
    setStartDateFilter,
    startDateOptions,
    setStartDateOptions,
    currentPage,
    setCurrentPage,
    selectedTemplate,
    setSelectedTemplate,
    subject,
    setSubject,
    emailBody,
    setEmailBody,
    sending,
    setSending,
    signature,
    setSignature,
    handleUnselectCase
  };
};
